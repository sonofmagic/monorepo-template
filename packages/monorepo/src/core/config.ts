import type { CreateNewProjectOptions } from '../commands/create'
import type { CliOpts } from '../types'
import type { GetWorkspacePackagesOptions } from './workspace'
import { loadConfig } from 'c12'
import path from 'pathe'

/**
 * `monorepo new` 命令的配置项，允许外部覆写模板目录、模板清单等。
 */
export interface CreateCommandConfig extends Partial<Omit<CreateNewProjectOptions, 'cwd'>> {
  /** 自定义模板根目录（默认为包内置模板） */
  templatesDir?: string
  /** 扩展模板映射表，key 为类型，value 为模板相对路径 */
  templateMap?: Record<string, string>
  /** 自定义交互提示的选项列表 */
  choices?: CreateChoiceOption[]
  /** 当未选择模板时使用的默认模板 */
  defaultTemplate?: CreateNewProjectOptions['type']
}

/**
 * CLI 交互式选择框的选项结构。
 */
export interface CreateChoiceOption {
  value: string
  name?: string
  description?: string
  short?: string
  disabled?: boolean | string
}

/**
 * `monorepo clean` 命令配置，可控制自动选择、排除包等行为。
 */
export interface CleanCommandConfig {
  /** 是否跳过交互直接清理全部 */
  autoConfirm?: boolean
  /** 不允许被清理的包名列表 */
  ignorePackages?: string[]
  /** 是否包含 private 包 */
  includePrivate?: boolean
  /** 强制写回的 @icebreakers/monorepo 版本 */
  pinnedVersion?: string
}

/**
 * `monorepo sync` 命令配置，可覆盖 workspace 过滤规则或同步命令模板。
 */
export interface SyncCommandConfig extends Partial<GetWorkspacePackagesOptions> {
  /** 并发执行同步命令的最大数量 */
  concurrency?: number
  /** 自定义执行的同步命令模板，使用 {name} 占位 */
  command?: string
  /** 仅同步指定的包（按名称过滤） */
  packages?: string[]
}

/**
 * `monorepo upgrade` 命令配置，覆盖脚本、目标文件等能力。
 */
export interface UpgradeCommandConfig extends Partial<CliOpts> {
  /** 额外需要写入的目标文件列表 */
  targets?: string[]
  /** 是否与默认目标合并，false 表示完全覆盖 */
  mergeTargets?: boolean
  /** 需要写入 package.json 的脚本集合 */
  scripts?: Record<string, string>
  /** 是否跳过生成 changeset markdown */
  skipChangesetMarkdown?: boolean
}

/**
 * `monorepo init` 命令配置，用于跳过部分初始化步骤。
 */
export interface InitCommandConfig {
  skipReadme?: boolean
  skipPkgJson?: boolean
  skipChangeset?: boolean
}

/**
 * `monorepo mirror` 命令配置，可增加额外的环境变量镜像。
 */
export interface MirrorCommandConfig {
  env?: Record<string, string>
}

/**
 * 项目级配置入口，按命令划分可插拔的配置块。
 */
export interface MonorepoConfig {
  commands?: {
    create?: CreateCommandConfig
    clean?: CleanCommandConfig
    sync?: SyncCommandConfig
    upgrade?: UpgradeCommandConfig
    init?: InitCommandConfig
    mirror?: MirrorCommandConfig
  }
}

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
