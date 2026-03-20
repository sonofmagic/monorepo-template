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

export interface MonorepoLintStagedConfig {
  [pattern: string]: string[] | ((files: string[]) => string | string[])
}

export interface MonorepoLintStagedConfigOptions extends LintStagedToolingConfig {}

export interface MonorepoVitestConfigOptions extends VitestToolingConfig {}

export interface MonorepoVitestProjectConfigOptions extends VitestProjectToolingConfig {}

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

export async function loadMonorepoToolingConfig(cwd = process.cwd()): Promise<NonNullable<ToolingConfig>> {
  const config = await loadMonorepoConfig(cwd)
  return config.tooling ?? {}
}

async function loadToolingSection<K extends keyof NonNullable<ToolingConfig>>(key: K, cwd = process.cwd()) {
  const config = await loadMonorepoToolingConfig(cwd)
  return config[key]
}

export function createMonorepoCommitlintConfig(options: CommitlintToolingConfig = {}): object {
  return {
    ...createCommitlint(),
    ...options,
  }
}

export async function defineMonorepoCommitlintConfig(cwd = process.cwd()) {
  return createMonorepoCommitlintConfig(await loadToolingSection('commitlint', cwd))
}

export function createMonorepoEslintConfig(options: EslintToolingConfig = {}): object {
  const { ignores = ['**/fixtures/**'], ...rest } = options
  return createEslint({
    ignores,
    ...rest,
  })
}

export async function defineMonorepoEslintConfig(cwd = process.cwd()) {
  return createMonorepoEslintConfig(await loadToolingSection('eslint', cwd))
}

export function createMonorepoStylelintConfig(options: StylelintToolingConfig = {}): object {
  return {
    ...createStylelint(),
    ...options,
  }
}

export async function defineMonorepoStylelintConfig(cwd = process.cwd()) {
  return createMonorepoStylelintConfig(await loadToolingSection('stylelint', cwd))
}

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

export async function defineMonorepoLintStagedConfig(cwd = process.cwd()) {
  return createMonorepoLintStagedConfig(await loadToolingSection('lintStaged', cwd))
}

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

export async function defineMonorepoVitestConfig(
  options: MonorepoVitestConfigOptions = {},
  overrides: MonorepoVitestConfigOverrides = {},
  cwd = process.cwd(),
) {
  const toolingOptions = await loadToolingSection('vitest', cwd)
  return mergeMonorepoVitestConfig(
    createMonorepoVitestConfig({
      ...toolingOptions,
      ...options,
    }),
    overrides,
  )
}

export function createMonorepoVitestProjectConfig(options: MonorepoVitestProjectConfigOptions = {}): {
  test: {
    alias?: Array<{
      find: string | RegExp
      replacement: string
    }>
    globals: boolean
    testTimeout: number
    environment?: string
  }
} {
  return {
    test: {
      ...(options.alias ? { alias: options.alias } : {}),
      globals: options.globals ?? true,
      testTimeout: options.testTimeout ?? 60_000,
      ...(options.environment ? { environment: options.environment } : {}),
    },
  }
}
