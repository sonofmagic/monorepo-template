import type { CreateChoiceOption, PackageJson } from '@/types'
import process from 'node:process'
import fs from 'fs-extra'
import path from 'pathe'
import pc from 'picocolors'
import set from 'set-value'
import { templatesDir as defaultTemplatesDir } from '../constants'
import { resolveCommandConfig } from '../core/config'
import { GitClient } from '../core/git'
import { logger } from '../core/logger'
import { toWorkspaceGitignorePath } from '../utils'

/**
 * 内置模板映射表，value 指向仓库中对应模板所在路径。
 */
export const templateMap = {
  'tsup': 'packages/tsup-template',
  'tsdown': 'packages/tsdown-template',
  'unbuild': 'packages/unbuild-template',
  'vue-lib': 'packages/vue-lib-template',
  'hono-server': 'apps/server',
  'vue-hono': 'apps/client',
  'vitepress': 'apps/website',
  'cli': 'apps/cli',
} as const

export type CreateNewProjectType = keyof typeof templateMap

export interface CreateNewProjectOptions {
  name?: string
  cwd?: string
  renameJson?: boolean
  type?: CreateNewProjectType | string
}

export const defaultTemplate: CreateNewProjectType = 'unbuild'

/**
 * 交互式选择模板时的默认选项列表。
 */
const baseChoices = [
  { name: 'unbuild 打包', value: 'unbuild' },
  { name: 'tsup 打包', value: 'tsup' },
  { name: 'tsdown 打包', value: 'tsdown' },
  { name: 'vue 组件', value: 'vue-lib' },
  { name: 'vue hono 全栈', value: 'vue-hono' },
  { name: 'hono 模板', value: 'hono-server' },
  { name: 'vitepress 文档', value: 'vitepress' },
  { name: 'cli 模板', value: 'cli' },
] as const

/**
 * 若配置中提供 choices 则优先使用，否则退回默认预设。
 */
export function getCreateChoices(choices?: CreateChoiceOption[]) {
  if (choices?.length) {
    return choices
  }
  return [...baseChoices]
}

/**
 * 合并内置与自定义模板映射，允许扩展新的模板类型。
 */
export function getTemplateMap(extra?: Record<string, string>) {
  const base: Record<string, string> = { ...templateMap }
  if (extra && Object.keys(extra).length) {
    Object.assign(base, extra)
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

    set(pkgJson, ['bugs', 'url'], `https://github.com/${repoName}/issues`)

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

    set(pkgJson, 'repository', repository)

    const gitUser = await git.getUser()
    if (gitUser?.name && gitUser?.email) {
      set(pkgJson, 'author', `${gitUser.name} <${gitUser.email}>`)
    }
  }
  catch {
    // 忽略 Git 仓库缺失或配置错误，确保脚手架流程不受影响。
  }
}

/**
 * 根据提供的参数或配置生成新工程目录，并可自动改写 package.json。
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
  const sourceRelative = templateDefinitions[bundlerName]

  if (!sourceRelative) {
    throw new Error(`未找到名为 ${bundlerName} 的模板，请检查 monorepo.config.ts`)
  }

  const from = path.join(templatesRoot, sourceRelative)
  const targetName = name && name.length > 0 ? name : sourceRelative
  const to = path.join(cwd, targetName)
  if (await fs.pathExists(to)) {
    throw new Error(`${pc.red('目标目录已存在')}: ${path.relative(cwd, to)}`)
  }

  await fs.ensureDir(to)

  const filelist = await fs.readdir(from)
  // 跳过 macOS 生成的临时文件，避免污染模板。
  const shouldSkip = (src: string) => path.basename(src) === '.DS_Store'
  const copyTasks = filelist
    .filter(filename => filename !== 'package.json')
    .map(async (filename) => {
      const sourcePath = path.resolve(from, filename)
      const targetPath = path.resolve(to, toWorkspaceGitignorePath(filename))
      await fs.copy(sourcePath, targetPath, {
        filter(src) {
          if (shouldSkip(src)) {
            return false
          }
          return true
        },
      })
    })

  await Promise.all(copyTasks)

  if (filelist.includes('package.json')) {
    const sourceJsonPath = path.resolve(from, 'package.json')
    const sourceJson = await fs.readJson(sourceJsonPath) as PackageJson
    set(sourceJson, 'version', '0.0.0')
    const packageName = name?.startsWith('@') ? name : path.basename(targetName)
    set(sourceJson, 'name', packageName)
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
