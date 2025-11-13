import type { MonorepoConfig } from '../types'
import { loadConfig } from 'c12'
import path from 'pathe'

interface LoadedConfig {
  file: string | null
  config: MonorepoConfig
}

/**
 * 简单的内存缓存，避免同一次命令中重复走磁盘加载配置。
 */
const cache = new Map<string, Promise<LoadedConfig>>()

/**
 * 基于 c12 的通用配置加载逻辑，支持多种配置文件格式。
 */
async function loadConfigInternal(cwd: string): Promise<LoadedConfig> {
  const { config, configFile } = await loadConfig<MonorepoConfig>({
    name: 'monorepo',
    cwd,
    // configFile: ['monorepo.config'],
    rcFile: false,
    defaults: {},
    globalRc: false,
    packageJson: false,
  })

  return {
    file: configFile ? path.resolve(configFile) : null,
    config: config ?? {},
  }
}

/**
 * 提供类型提示的辅助函数，供外部定义配置时使用。
 */
export function defineMonorepoConfig(config: MonorepoConfig) {
  return config
}

/**
 * 加载指定目录的 monorepo 配置，并利用缓存提升性能。
 */
export async function loadMonorepoConfig(cwd: string) {
  const key = path.resolve(cwd)
  if (!cache.has(key)) {
    cache.set(key, loadConfigInternal(key))
  }
  const { config } = await cache.get(key)!
  return config
}

/**
 * 获取命令对应的合并配置，若未配置则返回空对象，保证调用端逻辑简单。
 */
export async function resolveCommandConfig<Name extends keyof NonNullable<MonorepoConfig['commands']>>(
  name: Name,
  cwd: string,
): Promise<NonNullable<MonorepoConfig['commands']>[Name]> {
  const config = await loadMonorepoConfig(cwd)
  const commands = config.commands ?? {}
  const commandConfig = commands[name]
  return (commandConfig ?? {}) as NonNullable<MonorepoConfig['commands']>[Name]
}

export type {
  CleanCommandConfig,
  CliOpts,
  CreateChoiceOption,
  CreateCommandConfig,
  InitCommandConfig,
  MirrorCommandConfig,
  MonorepoConfig,
  SyncCommandConfig,
  UpgradeCommandConfig,
} from '../types'
