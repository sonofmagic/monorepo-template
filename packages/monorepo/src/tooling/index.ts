import type {
  CommitlintToolingConfig,
  EslintToolingConfig,
  LintStagedToolingConfig,
  StylelintToolingConfig,
  ToolingConfig,
  VitestProjectToolingConfig,
  VitestToolingConfig,
} from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { icebreaker as createCommitlint } from '@icebreakers/commitlint-config'
import { icebreaker as createEslint } from '@icebreakers/eslint-config'
import { icebreaker as createStylelint } from '@icebreakers/stylelint-config'
import YAML from 'yaml'
import { loadMonorepoConfig } from '../core/config'

/**
 * `commitlint.config.*` 最终导出的配置类型。
 *
 * 目前 commitlint 上游未暴露更细的结构化类型时，按对象配置处理。
 */
export type MonorepoCommitlintConfig = Record<string, unknown>

/**
 * `eslint.config.js` 最终导出的 flat config 类型。
 */
export type MonorepoEslintConfig = ReturnType<typeof createEslint>

/**
 * `stylelint.config.js` 最终导出的配置类型。
 *
 * 目前 stylelint 上游未暴露更细的结构化类型时，按对象配置处理。
 */
export type MonorepoStylelintConfig = Record<string, unknown>

/**
 * `lint-staged` 最终配置对象。
 *
 * key 为 glob pattern，value 为命令数组或命令生成函数。
 */
export interface MonorepoLintStagedConfig {
  [pattern: string]: string[] | ((files: string[]) => string | string[])
}

/**
 * `createMonorepoLintStagedConfig()` 与 `defineMonorepoLintStagedConfig()` 的配置项。
 */
export interface MonorepoLintStagedConfigOptions extends LintStagedToolingConfig {}

/**
 * `createMonorepoVitestConfig()` 与 `defineMonorepoVitestConfig()` 的共享配置项。
 *
 * 这些值会先参与 monorepo 级默认配置计算，再产出最终的 Vitest `test` 配置。
 */
export interface MonorepoVitestConfigOptions extends VitestToolingConfig {}

/**
 * `createMonorepoVitestProjectConfig()` 的项目级配置项。
 */
export interface MonorepoVitestProjectConfigOptions extends VitestProjectToolingConfig {}

/**
 * `createMonorepoVitestConfig()` 返回的标准结果结构。
 *
 * 该类型可用于约束自定义封装或二次 merge 的返回值。
 */
export interface MonorepoVitestConfigResult {
  test: {
    projects: string[]
    coverage: {
      enabled: boolean
      all: boolean
      skipFull: boolean
      exclude?: string[]
    }
    forceRerunTriggers: string[]
  }
}

/**
 * 单个 package/app 的 `vitest.config.*` 最终导出结构。
 */
export interface MonorepoVitestProjectConfigResult {
  test: {
    alias?: Array<{
      find: string | RegExp
      replacement: string
    }>
    globals: boolean
    testTimeout: number
    environment?: string
  }
}

/**
 * `defineMonorepoVitestConfig()` 的最终覆盖项。
 *
 * 适合在 `vitest.config.ts` 中只覆写少量字段，而不是手动展开整个
 * `config.test.coverage` 结构。
 */
export interface MonorepoVitestConfigOverrides {
  test?: Partial<Omit<MonorepoVitestConfigResult['test'], 'coverage'>> & {
    coverage?: Partial<MonorepoVitestConfigResult['test']['coverage']>
  }
}

const defaultProjectRoots = ['packages', 'apps']
const defaultConfigCandidates = [
  'vitest.config.ts',
  'vitest.config.mts',
  'vitest.config.js',
  'vitest.config.cjs',
  'vitest.workspace.ts',
  'vitest.workspace.mts',
]
const defaultWorkspaceConfigCandidates = [
  'vitest.config.ts',
  'vitest.config.mts',
  'vitest.config.cts',
  'vitest.config.js',
  'vitest.config.cjs',
  'vitest.config.mjs',
]
const windowsPathSeparatorPattern = /\\/g
const relativeCurrentDirPattern = /^\.\//
const globTokenPattern = /[*?[{]/
const trailingSlashPattern = /\/+$/

function escapeForShell(value: string) {
  return `'${value.replaceAll('\'', '\'\\\'\'')}'`
}

function resolveProjects(rootDir: string, projectRoots: string[], configCandidates: string[]) {
  const projects: string[] = []

  for (const folder of projectRoots) {
    const rootPath = path.resolve(rootDir, folder)
    if (!fs.existsSync(rootPath)) {
      continue
    }

    const entries = fs.readdirSync(rootPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      const projectDir = path.join(rootPath, entry.name)
      const configPath = configCandidates
        .map(candidate => path.join(projectDir, candidate))
        .find(fs.existsSync)

      if (configPath) {
        projects.push(path.relative(rootDir, configPath))
      }
    }
  }

  return projects
}

function extractBaseDirFromGlob(pattern: string): string | null {
  if (!pattern) {
    return null
  }

  const normalized = pattern
    .replace(windowsPathSeparatorPattern, '/')
    .replace(relativeCurrentDirPattern, '')
  const globIndex = normalized.search(globTokenPattern)
  const base = globIndex === -1
    ? normalized
    : normalized.slice(0, globIndex)

  const cleaned = base.replace(trailingSlashPattern, '')
  return cleaned || null
}

function loadProjectRootsFromWorkspace(rootDir: string, workspaceFile: string) {
  const workspacePath = path.resolve(rootDir, workspaceFile)
  if (!fs.existsSync(workspacePath)) {
    return []
  }

  try {
    const workspaceContent = fs.readFileSync(workspacePath, 'utf8')
    const workspace = YAML.parse(workspaceContent) ?? {}
    const packages: unknown[] = Array.isArray(workspace.packages) ? workspace.packages : []

    const roots = packages
      .map(entry => typeof entry === 'string' ? entry.trim() : '')
      .filter(entry => entry && !entry.startsWith('!'))
      .map(extractBaseDirFromGlob)
      .filter((entry): entry is string => Boolean(entry))

    return roots.length ? [...new Set(roots)] : []
  }
  catch {
    return []
  }
}

function findConfig(basePath: string, configCandidates: string[]) {
  for (const filename of configCandidates) {
    const candidate = path.join(basePath, filename)
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

/**
 * 读取当前工作目录下的 `monorepo.config.*` 中 `tooling` 配置块。
 *
 * @param cwd 配置文件解析起点。默认使用 `process.cwd()`
 * @returns 标准化后的 tooling 配置；未配置时返回空对象
 *
 * @example
 * ```ts
 * import { loadMonorepoToolingConfig } from '@icebreakers/monorepo/tooling'
 *
 * const tooling = await loadMonorepoToolingConfig()
 * console.log(tooling.vitest?.includeWorkspaceRootConfig)
 * ```
 */
export async function loadMonorepoToolingConfig(cwd = process.cwd()): Promise<NonNullable<ToolingConfig>> {
  const config = await loadMonorepoConfig(cwd)
  return config.tooling ?? {}
}

async function loadToolingSection<K extends keyof NonNullable<ToolingConfig>>(key: K, cwd = process.cwd()) {
  const config = await loadMonorepoToolingConfig(cwd)
  return config[key]
}

/**
 * 基于 `@icebreakers/commitlint-config` 创建 commitlint 配置。
 *
 * 适合在需要手动传入覆盖项时使用；如果只想读取 `monorepo.config.ts` 默认值，
 * 优先使用 `defineMonorepoCommitlintConfig()`。
 *
 * @param options 额外合并到默认 commitlint 配置上的字段
 * @returns 可直接作为 `commitlint.config.ts` 默认导出的配置对象
 *
 * @example
 * ```ts
 * import { createMonorepoCommitlintConfig } from '@icebreakers/monorepo/tooling'
 *
 * export default createMonorepoCommitlintConfig({
 *   rules: {
 *     'subject-case': [0],
 *   },
 * })
 * ```
 */
export function createMonorepoCommitlintConfig(options: CommitlintToolingConfig = {}): MonorepoCommitlintConfig {
  return {
    ...createCommitlint(),
    ...options,
  }
}

/**
 * 从 `monorepo.config.ts` 读取 `tooling.commitlint`，并生成 commitlint 配置。
 *
 * @param cwd 配置文件解析起点。默认使用 `process.cwd()`
 * @returns 可直接导出的 commitlint 配置对象
 *
 * @example
 * ```ts
 * import { defineMonorepoCommitlintConfig } from '@icebreakers/monorepo/tooling'
 *
 * export default await defineMonorepoCommitlintConfig()
 * ```
 */
export async function defineMonorepoCommitlintConfig(cwd = process.cwd()): Promise<MonorepoCommitlintConfig> {
  return createMonorepoCommitlintConfig(await loadToolingSection('commitlint', cwd))
}

/**
 * 基于 `@icebreakers/eslint-config` 创建 ESLint 配置。
 *
 * 默认会追加一个用于忽略 `fixtures` 目录的 glob，除非显式传入其他 `ignores`。
 *
 * @param options 额外 ESLint 配置；`ignores` 默认会忽略 `fixtures` 目录
 * @returns 可直接作为 `eslint.config.js` 默认导出的 flat config
 */
export function createMonorepoEslintConfig(options: EslintToolingConfig = {}): MonorepoEslintConfig {
  const { ignores = ['**/fixtures/**'], ...rest } = options
  return createEslint({
    ignores,
    ...rest,
  })
}

/**
 * 从 `monorepo.config.ts` 读取 `tooling.eslint`，并生成 ESLint 配置。
 *
 * @param cwd 配置文件解析起点。默认使用 `process.cwd()`
 * @returns 可直接导出的 ESLint flat config
 *
 * @example
 * ```js
 * import { defineMonorepoEslintConfig } from '@icebreakers/monorepo/tooling'
 *
 * export default await defineMonorepoEslintConfig()
 * ```
 */
export async function defineMonorepoEslintConfig(cwd = process.cwd()): Promise<MonorepoEslintConfig> {
  return createMonorepoEslintConfig(await loadToolingSection('eslint', cwd))
}

/**
 * 基于 `@icebreakers/stylelint-config` 创建 Stylelint 配置。
 *
 * @param options 额外合并到默认 stylelint 配置上的字段
 * @returns 可直接作为 `stylelint.config.js` 默认导出的配置对象
 */
export function createMonorepoStylelintConfig(options: StylelintToolingConfig = {}): MonorepoStylelintConfig {
  return {
    ...createStylelint(),
    ...options,
  }
}

/**
 * 从 `monorepo.config.ts` 读取 `tooling.stylelint`，并生成 Stylelint 配置。
 *
 * @param cwd 配置文件解析起点。默认使用 `process.cwd()`
 * @returns 可直接导出的 Stylelint 配置对象
 */
export async function defineMonorepoStylelintConfig(cwd = process.cwd()): Promise<MonorepoStylelintConfig> {
  return createMonorepoStylelintConfig(await loadToolingSection('stylelint', cwd))
}

/**
 * 创建适用于当前仓库约定的 `lint-staged` 配置。
 *
 * 默认行为：
 * - `*.{js,jsx,mjs,ts,tsx,mts,cts}` 运行 `eslint --fix`
 * - `*.vue` 同时运行 `eslint --fix` 与 `stylelint --fix --allow-empty-input`
 * - `*.{ts,tsx,mts,cts,vue}` 调用 `pnpm exec monorepo verify staged-typecheck`
 * - 样式文件运行 `stylelint --fix --allow-empty-input`
 *
 * @param options 仅支持 `monorepoCommand`，默认值为 `pnpm exec monorepo`
 * @returns 可直接导出的 `lint-staged` 配置对象
 *
 * @example
 * ```js
 * import { createMonorepoLintStagedConfig } from '@icebreakers/monorepo/tooling'
 *
 * export default createMonorepoLintStagedConfig({
 *   monorepoCommand: 'pnpm exec monorepo',
 * })
 * ```
 */
export function createMonorepoLintStagedConfig(options: MonorepoLintStagedConfigOptions = {}): MonorepoLintStagedConfig {
  const monorepoCommand = options.monorepoCommand ?? 'pnpm exec monorepo'
  return {
    '*.{js,jsx,mjs,ts,tsx,mts,cts}': [
      'eslint --fix',
    ],
    '*.vue': [
      'eslint --fix',
      'stylelint --fix --allow-empty-input',
    ],
    '*.{ts,tsx,mts,cts,vue}': (files) => {
      const uniqueFiles = [...new Set(files)]
      if (uniqueFiles.length === 0) {
        return []
      }
      return `${monorepoCommand} verify staged-typecheck ${uniqueFiles.map(escapeForShell).join(' ')}`
    },
    '*.{json,md,mdx,html,yml,yaml}': [
      'eslint --fix',
    ],
    '*.{css,scss,sass,less}': [
      'stylelint --fix --allow-empty-input',
    ],
  }
}

/**
 * 从 `monorepo.config.ts` 读取 `tooling.lintStaged`，并生成 `lint-staged` 配置。
 *
 * @param cwd 配置文件解析起点。默认使用 `process.cwd()`
 * @returns 可直接导出的 `lint-staged` 配置对象
 */
export async function defineMonorepoLintStagedConfig(cwd = process.cwd()): Promise<MonorepoLintStagedConfig> {
  return createMonorepoLintStagedConfig(await loadToolingSection('lintStaged', cwd))
}

/**
 * 创建 monorepo 根级 Vitest 配置。
 *
 * 默认值：
 * - `rootDir`: `process.cwd()`
 * - `workspaceFile`: `'pnpm-workspace.yaml'`
 * - `projectRoots`: 自动从 workspace packages 推导，失败时回退到 `['packages', 'apps']`
 * - `includeWorkspaceRootConfig`: `false`
 * - `coverageEnabled`: `true`
 * - `coverageAll`: `false`
 * - `coverageSkipFull`: `true`
 *
 * @param options Vitest 默认配置生成参数
 * @returns 仅包含 `test` 字段的 Vitest 配置片段
 *
 * @example
 * ```ts
 * import { createMonorepoVitestConfig } from '@icebreakers/monorepo/tooling'
 *
 * export default {
 *   ...createMonorepoVitestConfig({
 *     includeWorkspaceRootConfig: false,
 *     coverageExclude: ['dist output glob'],
 *   }),
 * }
 * ```
 */
export function createMonorepoVitestConfig(options: MonorepoVitestConfigOptions = {}): MonorepoVitestConfigResult {
  const rootDir = options.rootDir ?? process.cwd()
  const workspaceFile = options.workspaceFile ?? 'pnpm-workspace.yaml'
  const workspaceProjectRoots = loadProjectRootsFromWorkspace(rootDir, workspaceFile)
  const projectRoots = options.projectRoots ?? (workspaceProjectRoots.length ? workspaceProjectRoots : defaultProjectRoots)
  const configCandidates = options.configCandidates ?? defaultConfigCandidates
  const includeWorkspaceRootConfig = options.includeWorkspaceRootConfig ?? false
  const projects = resolveProjects(rootDir, projectRoots, configCandidates)

  if (includeWorkspaceRootConfig) {
    const rootConfig = findConfig(rootDir, defaultWorkspaceConfigCandidates)
    if (rootConfig) {
      projects.unshift(rootConfig)
    }
  }

  return {
    test: {
      projects: [...new Set(projects)],
      coverage: {
        enabled: options.coverageEnabled ?? true,
        all: options.coverageAll ?? false,
        skipFull: options.coverageSkipFull ?? true,
        ...(options.coverageExclude ? { exclude: options.coverageExclude } : {}),
      },
      forceRerunTriggers: [
        '**/{vitest,vite}.config.*/**',
      ],
    },
  }
}

function mergeMonorepoVitestConfig(
  base: MonorepoVitestConfigResult,
  overrides: MonorepoVitestConfigOverrides = {},
): MonorepoVitestConfigResult {
  return {
    ...base,
    ...overrides,
    test: {
      ...base.test,
      ...overrides.test,
      coverage: {
        ...base.test.coverage,
        ...overrides.test?.coverage,
      },
    },
  }
}

/**
 * 从 `monorepo.config.ts` 读取 `tooling.vitest`，再叠加运行时 `options` 与 `overrides`
 * 生成最终 Vitest 配置。
 *
 * 优先级从低到高：
 * 1. `monorepo.config.ts -> tooling.vitest`
 * 2. `options`
 * 3. `overrides`
 *
 * 推荐把“参与默认值推导”的字段放在 `options`，把“最终局部覆盖”放在 `overrides`。
 *
 * @param options 先与 `tooling.vitest` 合并的配置项
 * @param overrides 最终返回值上的局部覆盖项，适合覆盖 `test.coverage`
 * @param cwd 配置文件解析起点。默认使用 `process.cwd()`
 * @returns 可直接作为 `defineConfig()` 返回值的 Vitest 配置对象
 *
 * @example
 * ```ts
 * import { defineMonorepoVitestConfig } from '@icebreakers/monorepo/tooling'
 * import { defineConfig } from 'vitest/config'
 *
 * export default defineConfig(async () => await defineMonorepoVitestConfig(
 *   {
 *     includeWorkspaceRootConfig: false,
 *   },
 *   {
 *     test: {
 *       coverage: {
 *         exclude: ['dist output glob'],
 *         skipFull: true,
 *       },
 *     },
 *   },
 * ))
 * ```
 */
export async function defineMonorepoVitestConfig(
  options: MonorepoVitestConfigOptions = {},
  overrides: MonorepoVitestConfigOverrides = {},
  cwd = process.cwd(),
): Promise<MonorepoVitestConfigResult> {
  const toolingOptions = await loadToolingSection('vitest', cwd)
  return mergeMonorepoVitestConfig(
    createMonorepoVitestConfig({
      ...toolingOptions,
      ...options,
    }),
    overrides,
  )
}

/**
 * 创建项目级 Vitest 配置。
 *
 * 默认值：
 * - `globals`: `true`
 * - `testTimeout`: `60_000`
 * - `environment`: `'node'`
 *
 * @param options 单个 package/app 的 Vitest 配置项
 * @returns 可直接给项目内 `vitest.config.ts` 使用的 `test` 配置片段
 */
export function createMonorepoVitestProjectConfig(options: MonorepoVitestProjectConfigOptions = {}): MonorepoVitestProjectConfigResult {
  return {
    test: {
      ...(options.alias ? { alias: options.alias } : {}),
      globals: options.globals ?? true,
      testTimeout: options.testTimeout ?? 60_000,
      ...(options.environment ? { environment: options.environment } : {}),
    },
  }
}
