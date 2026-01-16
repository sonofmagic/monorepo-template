import { assetTargets as rawAssetTargets, getAssetTargets as rawGetAssetTargets } from '../assets-data.mjs'
import { templateChoices as rawTemplateChoices } from '../template-data.mjs'
import { assetsDir, packageDir, skeletonDir, templatesDir } from './paths'
import { prepareAssets } from './prepare'
import { runCommand } from './utils/command'
import { isGitignoreFile, toPublishGitignorePath, toWorkspaceGitignorePath } from './utils/gitignore'
import { createTemplateCopyFilter, shouldSkipTemplatePath } from './utils/template-filter'

export interface TemplateChoice {
  key: string
  label: string
  source: string
  target: string
}

export const templateChoices = rawTemplateChoices as TemplateChoice[]
export const assetTargets = rawAssetTargets as string[]
export const getAssetTargets = rawGetAssetTargets as (core?: boolean) => string[]

export { assetsDir, packageDir, skeletonDir, templatesDir }

export const templateSourceMap = Object.fromEntries(
  templateChoices.map(item => [item.key, item.source]),
) as Record<string, string>

export const templateTargetMap = Object.fromEntries(
  templateChoices.map(item => [item.key, item.target]),
) as Record<string, string>

export const templateMap = templateSourceMap

export { prepareAssets }
export {
  createTemplateCopyFilter,
  isGitignoreFile,
  runCommand,
  shouldSkipTemplatePath,
  toPublishGitignorePath,
  toWorkspaceGitignorePath,
}
export { default as checkbox } from '@inquirer/checkbox'
export { default as input } from '@inquirer/input'
export { default as select } from '@inquirer/select'
export { Command, program } from 'commander'
export { execaCommand } from 'execa'
