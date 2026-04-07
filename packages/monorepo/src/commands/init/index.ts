import type { InitToolingTarget } from './tooling/types'
import { createContext } from '../../core/context'
import setChangeset from './setChangeset'
import setIssueTemplateConfig from './setIssueTemplateConfig'
import setPkgJson from './setPkgJson'
import setReadme from './setReadme'
import { initTooling, initToolingTargets, normalizeInitToolingTargets } from './tooling'

export { initTooling, initToolingTargets } from './tooling'
export { normalizeInitToolingTargets } from './tooling'
export type { InitToolingExecutionOptions, InitToolingResult, InitToolingTarget } from './tooling/types'

export type InitPreset = 'minimal' | 'standard'

export interface InitCommandRuntimeOptions {
  tooling?: readonly InitToolingTarget[]
  all?: boolean
  force?: boolean
  preset?: InitPreset
}

const presetToolingMap: Record<InitPreset, InitToolingTarget[]> = {
  minimal: ['tsconfig'],
  standard: [...initToolingTargets],
}

async function runInitMetadata(cwd: string) {
  const ctx = await createContext(cwd)
  const initConfig = ctx.config.commands?.init ?? {}

  if (!initConfig.skipChangeset) {
    await setChangeset(ctx)
  }
  if (!initConfig.skipPkgJson) {
    await setPkgJson(ctx)
  }
  if (!initConfig.skipReadme) {
    await setReadme(ctx)
  }
  if (!initConfig.skipIssueTemplateConfig) {
    await setIssueTemplateConfig(ctx)
  }

  return { ctx, initConfig }
}

export async function initMetadata(cwd: string) {
  await runInitMetadata(cwd)
}

/**
 * 初始化命令入口，根据配置逐步生成基础文件。
 */
export async function init(cwd: string, options: InitCommandRuntimeOptions = {}) {
  const { initConfig } = await runInitMetadata(cwd)

  const preset = options.preset ?? initConfig.preset
  const presetTargets = preset ? presetToolingMap[preset] : undefined
  const configuredTargets = initConfig.tooling ?? []
  const runtimeTargets = options.tooling?.length
    ? [...options.tooling]
    : presetTargets ?? configuredTargets
  const targets = options.all
    ? [...initToolingTargets]
    : normalizeInitToolingTargets(runtimeTargets)

  await initTooling(cwd, {
    targets,
    force: options.force ?? initConfig.force ?? false,
    ...(options.all !== undefined ? { all: options.all } : {}),
  })
}
