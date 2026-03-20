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
 * 为 `monorepo.config.ts` 提供类型提示的辅助函数。
 *
 * 推荐在用户项目中这样写：
 *
 * @example
 * ```ts
 * import { defineMonorepoConfig } from '@icebreakers/monorepo'
 *
 * export default defineMonorepoConfig({
 *   tooling: {
 *     vitest: {
 *       includeWorkspaceRootConfig: false,
 *     },
 *   },
 * })
 * ```
 */
export function defineMonorepoConfig(config: MonorepoConfig) {
  return config
}

/**
 * 加载指定目录的 `monorepo.config.*`，并在当前进程内做内存缓存。
 *
 * @param cwd 配置文件解析起点
 * @returns 解析后的配置对象；未找到时返回空对象
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
 * 获取单个命令对应的配置块。
 *
 * @param name 命令名称，对应 `monorepo.config.ts -> commands.<name>`
 * @param cwd 配置文件解析起点
 * @returns 对应命令配置；未配置时返回空对象
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

/**
 * 获取 `monorepo.config.ts` 中完整的 `tooling` 配置块。
 *
 * @param cwd 配置文件解析起点
 * @returns `tooling` 配置；未配置时返回空对象
 */
export async function resolveToolingConfig(cwd: string): Promise<NonNullable<MonorepoConfig['tooling']>> {
  const config = await loadMonorepoConfig(cwd)
  return (config.tooling ?? {}) as NonNullable<MonorepoConfig['tooling']>
}

export type {
  AiCommandConfig,
  CleanCommandConfig,
  CliOpts,
  CommitlintToolingConfig,
  CreateChoiceOption,
  CreateCommandConfig,
  EslintToolingConfig,
  HuskyToolingConfig,
  InitCommandConfig,
  LintStagedToolingConfig,
  MirrorCommandConfig,
  MonorepoConfig,
  StylelintToolingConfig,
  SyncCommandConfig,
  ToolingConfig,
  UpgradeCommandConfig,
  VitestProjectToolingConfig,
  VitestToolingConfig,
} from '../types'
