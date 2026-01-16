import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { templateChoices as rawTemplateChoices } from '../template-data.mjs'

export interface TemplateChoice {
  key: string
  label: string
  source: string
  target: string
}

export const templateChoices = rawTemplateChoices as TemplateChoice[]

const packageDir = path.resolve(fileURLToPath(new URL('../', import.meta.url)))

export const templatesDir = path.join(packageDir, 'templates')
export const skeletonDir = path.join(packageDir, 'skeleton')

export const templateSourceMap = Object.fromEntries(
  templateChoices.map(item => [item.key, item.source]),
) as Record<string, string>

export const templateTargetMap = Object.fromEntries(
  templateChoices.map(item => [item.key, item.target]),
) as Record<string, string>

export const templateMap = templateSourceMap
