import type { TemplateDefinition } from '@icebreakers/monorepo-templates'
import type { CreateChoiceOption, PackageJson } from '@/types'
import process from 'node:process'
import { scaffoldTemplate } from '@icebreakers/monorepo-templates'
import path from 'pathe'
import pc from 'picocolors'
import { setByPath } from '@/utils'
import fs from '@/utils/fs'
import { templatesDir as defaultTemplatesDir } from '../constants'
import { resolveCommandConfig } from '../core/config'
import { GitClient } from '../core/git'
import { logger } from '../core/logger'

/**
 * 内置模板映射表，source 指向 templates 根目录下的来源目录，target 为生成路径。
 */
export const templateMap = {
  'tsdown': { source: 'tsdown', target: 'packages/tsdown' },
  'vue-lib': { source: 'vue-lib', target: 'packages/vue-lib' },
  'hono-server': { source: 'server', target: 'apps/server' },
  'vue-hono': { source: 'client', target: 'apps/client' },
  'vitepress': { source: 'vitepress', target: 'apps/website' },
  'cli': { source: 'cli', target: 'apps/cli' },
} as const

export type CreateNewProjectType = keyof typeof templateMap

function normalizeTemplateDefinition(value: string | TemplateDefinition) {
  if (typeof value === 'string') {
    return { source: value, target: value }
  }
  return value
}

export interface CreateNewProjectOptions {
  /**
   * 目标项目名。
   * 未提供时使用模板映射中的 `target`。
   * @default undefined
   */
  name?: string
  /**
   * 生成目标的工作目录。
   * @default process.cwd()
   */
  cwd?: string
  /**
   * 是否把模板里的 `package.json` 输出为 `package.mock.json`。
   * @default false
   */
  renameJson?: boolean
  /**
   * 模板类型。
   * 未提供时优先读取 `commands.create.defaultTemplate`，最后回退到 `'tsdown'`。
   * @default 'tsdown'
   */
  type?: CreateNewProjectType | string
}

/**
 * `createNewProject()` 默认使用的模板类型。
 * @default 'tsdown'
 */
export const defaultTemplate: CreateNewProjectType = 'tsdown'

/**
 * 交互式选择模板时的默认选项列表。
 */
const baseChoices = [
  { name: 'tsdown 打包', value: 'tsdown' },
  { name: 'vue 组件', value: 'vue-lib' },
  { name: 'vue hono 全栈', value: 'vue-hono' },
  { name: 'hono 模板', value: 'hono-server' },
  { name: 'vitepress 文档', value: 'vitepress' },
  { name: 'cli 模板', value: 'cli' },
] as const

/**
 * 获取 `monorepo new` 的交互式模板选项。
 *
 * @param choices 外部自定义选项；传入非空数组时直接返回
 * @returns 最终用于 CLI 交互的模板选项列表
 */
export function getCreateChoices(choices?: CreateChoiceOption[]) {
  if (choices?.length) {
    return choices
  }
  return [...baseChoices]
}

/**
 * 获取最终模板映射表。
 *
 * @param extra 额外模板定义；同名 key 会覆盖内置模板
 * @returns 合并后的模板映射
 *
 * @example
 * ```ts
 * import { getTemplateMap } from '@icebreakers/monorepo'
 *
 * const templates = getTemplateMap({
 *   docs: { source: 'vitepress', target: 'apps/docs' },
 * })
 * ```
 */
export function getTemplateMap(extra?: Record<string, string | TemplateDefinition>) {
  const base: Record<string, TemplateDefinition> = Object.fromEntries(
    Object.entries(templateMap).map(([key, value]) => [key, normalizeTemplateDefinition(value)]),
  )
  if (extra && Object.keys(extra).length) {
    for (const [key, value] of Object.entries(extra)) {
      base[key] = normalizeTemplateDefinition(value)
    }
  }
  return base
}

async function applyGitMetadata(pkgJson: PackageJson, repoDir: string, targetDir: string) {
  try {
    const git = new GitClient({ baseDir: repoDir })
    const repoName = await git.getRepoName()
    if (!repoName) {
      return
    }

    setByPath(pkgJson, ['bugs', 'url'], `https://github.com/${repoName}/issues`)

    const repository: PackageJson['repository'] = {
      type: 'git',
      url: `git+https://github.com/${repoName}.git`,
    }

    const repoRoot = await git.getRepoRoot()
    const directoryBase = repoRoot ?? repoDir
    const relative = path.relative(directoryBase, targetDir)
    if (relative && relative !== '.') {
      repository.directory = relative.split(path.sep).join('/')
    }

    setByPath(pkgJson, 'repository', repository)

    const gitUser = await git.getUser()
    if (gitUser?.name && gitUser?.email) {
      setByPath(pkgJson, 'author', `${gitUser.name} <${gitUser.email}>`)
    }
  }
  catch {
    // 忽略 Git 仓库缺失或配置错误，确保脚手架流程不受影响。
  }
}

/**
 * 根据模板生成一个新项目目录，并自动补写 `package.json` 常用字段。
 *
 * 默认行为：
 * - 优先读取 `repoctl.config.ts -> commands.create`，兼容 `monorepo.config.ts`
 * - 模板类型默认回退到 `'tsdown'`
 * - 若目标目录已存在则直接抛错
 * - 若模板包含 `package.json`，会自动写入 `name`、`version` 与 Git 仓库信息
 *
 * @param options 运行时覆盖项
 * @returns Promise<void>
 */
export async function createNewProject(options?: CreateNewProjectOptions) {
  const cwd = options?.cwd ?? process.cwd()
  const createConfig = await resolveCommandConfig('create', cwd)

  const renameJson = options?.renameJson ?? createConfig?.renameJson ?? false
  const rawName = options?.name ?? createConfig?.name
  const name = typeof rawName === 'string' ? rawName.trim() : undefined
  const requestedTemplate = options?.type ?? createConfig?.type ?? createConfig?.defaultTemplate ?? defaultTemplate

  const templateDefinitions = getTemplateMap(createConfig?.templateMap)
  const templatesRoot = createConfig?.templatesDir
    ? path.resolve(cwd, createConfig.templatesDir)
    : defaultTemplatesDir

  // 如果用户输入的模板未在映射表里，则回退到默认模板，以保证命令不会中断。
  const fallbackTemplate = (createConfig?.defaultTemplate as string | undefined) ?? defaultTemplate
  const bundlerName = (typeof requestedTemplate === 'string' && templateDefinitions[requestedTemplate])
    ? requestedTemplate
    : fallbackTemplate
  const templateDefinition = templateDefinitions[bundlerName]

  if (!templateDefinition) {
    throw new Error(`未找到名为 ${bundlerName} 的模板，请检查 repoctl.config.ts 或 monorepo.config.ts`)
  }

  const from = path.join(templatesRoot, templateDefinition.source)
  const targetName = name && name.length > 0 ? name : templateDefinition.target
  const to = path.join(cwd, targetName)
  if (await fs.pathExists(to)) {
    throw new Error(`${pc.red('目标目录已存在')}: ${path.relative(cwd, to)}`)
  }

  await fs.ensureDir(to)

  const sourceJsonPath = path.resolve(from, 'package.json')
  const hasPackageJson = await fs.pathExists(sourceJsonPath)

  await scaffoldTemplate({
    sourceDir: from,
    targetDir: to,
    skipRootBasenames: ['package.json'],
  })

  if (hasPackageJson) {
    const sourceJson = await fs.readJson(sourceJsonPath) as PackageJson
    setByPath(sourceJson, 'version', '0.0.0')
    const packageName = name?.startsWith('@') ? name : path.basename(targetName)
    setByPath(sourceJson, 'name', packageName)
    await applyGitMetadata(sourceJson, cwd, to)
    // renameJson 可将 package.json 暂存为 package.mock.json，满足某些仓库需要自定义命名的情景。
    await fs.outputJson(
      path.resolve(
        to,
        renameJson ? 'package.mock.json' : 'package.json',
      ),
      sourceJson,
      { spaces: 2 },
    )
  }

  logger.success(`${pc.bgGreenBright(pc.white(`[${bundlerName}]`))} ${targetName} 项目创建成功！`)
}
