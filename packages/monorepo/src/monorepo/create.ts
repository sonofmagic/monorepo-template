import process from 'node:process'
import defu from 'defu'
import fs from 'fs-extra'
import path from 'pathe'
import pc from 'picocolors'
import set from 'set-value'
import { templatesDir } from '../constants'
import { logger } from '../logger'

export type CreateNewProjectType = 'tsup' | 'unbuild' | 'vue-lib' | 'vitepress' | 'hono-server' | 'vue-hono' | 'cli'

export interface CreateNewProjectOptions {
  name?: string
  cwd?: string
  renameJson?: boolean
  type?: CreateNewProjectType
}

export const defaultTemplate = 'unbuild'

export const fromMap: Record<CreateNewProjectType, string> = {
  'tsup': 'packages/tsup-template',
  'unbuild': 'packages/unbuild-template',
  'vue-lib': 'packages/vue-lib-template',
  'hono-server': 'apps/server',
  'vue-hono': 'apps/client',
  'vitepress': 'apps/website',
  'cli': 'apps/cli',
}

interface Choice<Value> {
  value: Value
  name?: string
  description?: string
  short?: string
  disabled?: boolean | string
  type?: never
}

export const createChoices: (Choice<CreateNewProjectType>)[] = [
  { name: 'unbuild 打包', value: 'unbuild' },
  { name: 'tsup 打包', value: 'tsup' },
  { name: 'vue 组件', value: 'vue-lib' },
  { name: 'vue hono 全栈', value: 'vue-hono' },
  { name: 'hono 模板', value: 'hono-server' },
  { name: 'vitepress 文档', value: 'vitepress' },
  { name: 'cli 模板', value: 'cli' },
]

export async function createNewProject(options?: CreateNewProjectOptions) {
  const { name: targetName, renameJson, cwd, type } = defu<Required<CreateNewProjectOptions>, CreateNewProjectOptions[]>(options, {
    cwd: process.cwd(),
    name: fromMap[defaultTemplate],
    renameJson: false,
  })
  const bundlerName = type ?? defaultTemplate
  const from = path.join(templatesDir, fromMap[bundlerName])
  const to = path.join(cwd, targetName)
  const filelist = await fs.readdir(from)
  for (const filename of filelist) {
    if (filename === 'package.json') {
      const sourceJsonPath = path.resolve(from, filename)
      const sourceJson = await fs.readJson(sourceJsonPath)
      set(sourceJson, 'version', '0.0.0')
      set(sourceJson, 'name', path.basename(targetName))
      await fs.outputJson(
        path.resolve(
          to,
          renameJson ? 'package.mock.json' : filename,
        ),
        sourceJson,
        { spaces: 2 },
      )
    }
    else {
      await fs.copy(
        path.resolve(from, filename),
        path.resolve(to, filename === 'gitignore' ? '.gitignore' : filename),
      )
    }
  }

  logger.success(`${pc.bgGreenBright(pc.white(`[${bundlerName}]`))} ${targetName} 项目创建成功！`)
}
