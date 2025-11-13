import type { CreateNewProjectOptions } from '../commands/create'
import type { CliOpts } from './cli'
import type { GetWorkspacePackagesOptions } from './workspace'

/**
 * `monorepo new` 命令的配置项，允许外部覆写模板目录、模板清单等。
 */
export interface CreateCommandConfig extends Partial<Omit<CreateNewProjectOptions, 'cwd'>> {
  /**
   * 自定义模板根目录。
   * @default 内置模板所在的 `packages/monorepo/templates`
   */
  templatesDir?: string
  /**
   * 扩展模板映射表，key 为类型，value 为模板相对路径。
   * @default 内置 `templateMap`
   */
  templateMap?: Record<string, string>
  /**
   * 自定义交互提示的选项列表。
   * @default 内置 `baseChoices`
   */
  choices?: CreateChoiceOption[]
  /**
   * 当未选择模板时使用的默认模板。
   * @default 'unbuild'
   */
  defaultTemplate?: CreateNewProjectOptions['type']
}

/**
 * CLI 交互式选择框的选项结构。
 */
export interface CreateChoiceOption {
  /**
   * 唯一值，将回传给命令逻辑使用。
   * @default undefined
   */
  value: string
  /**
   * 选项展示名称。
   * @default value
   */
  name?: string
  /**
   * 选项描述信息。
   * @default undefined
   */
  description?: string
  /**
   * 短名称，用于命令行紧凑展示。
   * @default undefined
   */
  short?: string
  /**
   * 设置为 true 或字符串即可禁用该选项并显示原因。
   * @default false
   */
  disabled?: boolean | string
}

/**
 * `monorepo clean` 命令配置，可控制自动选择、排除包等行为。
 */
export interface CleanCommandConfig {
  /**
   * 是否跳过交互直接清理全部。
   * @default false
   */
  autoConfirm?: boolean
  /**
   * 不允许被清理的包名列表。
   * @default []
   */
  ignorePackages?: string[]
  /**
   * 是否包含 private 包。
   * @default false
   */
  includePrivate?: boolean
  /**
   * 强制写回的 @icebreakers/monorepo 版本。
   * @default 当前依赖版本
   */
  pinnedVersion?: string
}

/**
 * `monorepo sync` 命令配置，可覆盖 workspace 过滤规则或同步命令模板。
 */
export interface SyncCommandConfig extends Partial<GetWorkspacePackagesOptions> {
  /**
   * 并发执行同步命令的最大数量。
   * @default os.cpus().length
   */
  concurrency?: number
  /**
   * 自定义执行的同步命令模板，使用 {name} 占位。
   * @default 'cnpm sync {name}'
   */
  command?: string
  /**
   * 仅同步指定的包（按名称过滤）。
   * @default 同步全部可见包
   */
  packages?: string[]
}

/**
 * `monorepo upgrade` 命令配置，覆盖脚本、目标文件等能力。
 */
export interface UpgradeCommandConfig extends Partial<CliOpts> {
  /**
   * 额外需要写入的目标文件列表。
   * @default []
   */
  targets?: string[]
  /**
   * 是否与默认目标合并，false 表示完全覆盖。
   * @default true
   */
  mergeTargets?: boolean
  /**
   * 需要写入 package.json 的脚本集合。
   * @default {}
   */
  scripts?: Record<string, string>
  /**
   * 是否跳过生成 changeset markdown。
   * @default true
   */
  skipChangesetMarkdown?: boolean
}

/**
 * `monorepo init` 命令配置，用于跳过部分初始化步骤。
 */
export interface InitCommandConfig {
  /**
   * 是否跳过 README 生成。
   * @default false
   */
  skipReadme?: boolean
  /**
   * 是否跳过 package.json 写入。
   * @default false
   */
  skipPkgJson?: boolean
  /**
   * 是否跳过 changeset 的更新。
   * @default false
   */
  skipChangeset?: boolean
}

/**
 * `monorepo mirror` 命令配置，可增加额外的环境变量镜像。
 */
export interface MirrorCommandConfig {
  /**
   * 需要注入的环境变量键值对。
   * @default {}
   */
  env?: Record<string, string>
}

/**
 * 项目级配置入口，按命令划分可插拔的配置块。
 */
export interface MonorepoConfig {
  /**
   * 按命令分类的可选配置。
   * @default {}
   */
  commands?: {
    create?: CreateCommandConfig
    clean?: CleanCommandConfig
    sync?: SyncCommandConfig
    upgrade?: UpgradeCommandConfig
    init?: InitCommandConfig
    mirror?: MirrorCommandConfig
  }
}
