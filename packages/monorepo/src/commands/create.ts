import process from 'node:process'
import defu from 'defu'
import fs from 'fs-extra'
import path from 'pathe'
import pc from 'picocolors'
import set from 'set-value'
import { templatesDir as defaultTemplatesDir } from '../constants'
import { resolveCommandConfig } from '../core/config'
import { logger } from '../core/logger'

export const templateMap = {
  'tsup': 'packages/tsup-template',
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

const baseChoices = [
  { name: 'unbuild 打包', value: 'unbuild' },
  { name: 'tsup 打包', value: 'tsup' },
  { name: 'vue 组件', value: 'vue-lib' },
  { name: 'vue hono 全栈', value: 'vue-hono' },
  { name: 'hono 模板', value: 'hono-server' },
  { name: 'vitepress 文档', value: 'vitepress' },
  { name: 'cli 模板', value: 'cli' },
] as const

export function getCreateChoices(choices?: import('../core/config').CreateChoiceOption[]) {
  if (choices?.length) {
    return choices
  }
  return [...baseChoices]
}

export function getTemplateMap(extra?: Record<string, string>) {
  if (extra && Object.keys(extra).length) {
    return {
      ...templateMap,
      ...extra,
    }
  }
  return { ...templateMap }
}

export async function createNewProject(options?: CreateNewProjectOptions) {
  const cwd = options?.cwd ?? process.cwd()
  const createConfig = await resolveCommandConfig('create', cwd)
  const mergedOptions = defu<Required<CreateNewProjectOptions>, CreateNewProjectOptions[]>(options, {
    cwd,
    renameJson: createConfig?.renameJson ?? false,
    type: (createConfig?.type ?? createConfig?.defaultTemplate ?? defaultTemplate) as string,
    name: createConfig?.name ?? undefined,
  })

  const templateDefinitions = getTemplateMap(createConfig?.templateMap)
  const templatesRoot = createConfig?.templatesDir ? path.resolve(cwd, createConfig.templatesDir) : defaultTemplatesDir

  const bundlerName = mergedOptions.type ?? createConfig?.defaultTemplate ?? defaultTemplate
  const sourceRelative = templateDefinitions[bundlerName] ?? templateDefinitions[createConfig?.defaultTemplate ?? defaultTemplate]

  if (!sourceRelative) {
    throw new Error(`未找到名为 ${bundlerName} 的模板，请检查 monorepo.config.ts`)
  }

  const from = path.join(templatesRoot, sourceRelative)
  const targetName = mergedOptions.name ?? sourceRelative
  const to = path.join(mergedOptions.cwd, targetName)
  if (await fs.pathExists(to)) {
    throw new Error(`${pc.red('目标目录已存在')}: ${path.relative(mergedOptions.cwd, to)}`)
  }

  await fs.ensureDir(to)

  const filelist = await fs.readdir(from)
  const shouldSkip = (src: string) => path.basename(src) === '.DS_Store'
  const copyTasks = filelist
    .filter(filename => filename !== 'package.json')
    .map(async (filename) => {
      const sourcePath = path.resolve(from, filename)
      const targetPath = path.resolve(to, filename === 'gitignore' ? '.gitignore' : filename)
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
    const sourceJson = await fs.readJson(sourceJsonPath)
    set(sourceJson, 'version', '0.0.0')
    set(sourceJson, 'name', path.basename(targetName))
    await fs.outputJson(
      path.resolve(
        to,
        mergedOptions.renameJson ? 'package.mock.json' : 'package.json',
      ),
      sourceJson,
      { spaces: 2 },
    )
  }

  logger.success(`${pc.bgGreenBright(pc.white(`[${bundlerName}]`))} ${targetName} 项目创建成功！`)
}
