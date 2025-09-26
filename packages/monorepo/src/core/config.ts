import type { CreateNewProjectOptions } from '../commands/create'
import type { CliOpts } from '../types'
import type { GetWorkspacePackagesOptions } from './workspace'
import { loadConfig } from 'c12'
import path from 'pathe'

export interface CreateCommandConfig extends Partial<Omit<CreateNewProjectOptions, 'cwd'>> {
  templatesDir?: string
  templateMap?: Record<string, string>
  choices?: CreateChoiceOption[]
  defaultTemplate?: CreateNewProjectOptions['type']
}

export interface CreateChoiceOption {
  value: string
  name?: string
  description?: string
  short?: string
  disabled?: boolean | string
}

export interface CleanCommandConfig {
  autoConfirm?: boolean
  ignorePackages?: string[]
  includePrivate?: boolean
  pinnedVersion?: string
}

export interface SyncCommandConfig extends Partial<GetWorkspacePackagesOptions> {
  concurrency?: number
  command?: string
  packages?: string[]
}

export interface UpgradeCommandConfig extends Partial<CliOpts> {
  targets?: string[]
  mergeTargets?: boolean
  scripts?: Record<string, string>
  skipChangesetMarkdown?: boolean
}

export interface InitCommandConfig {
  skipReadme?: boolean
  skipPkgJson?: boolean
  skipChangeset?: boolean
}

export interface MirrorCommandConfig {
  env?: Record<string, string>
}

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

const cache = new Map<string, Promise<LoadedConfig>>()

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

export function defineMonorepoConfig(config: MonorepoConfig) {
  return config
}

export async function loadMonorepoConfig(cwd: string) {
  const key = path.resolve(cwd)
  if (!cache.has(key)) {
    cache.set(key, loadConfigInternal(key))
  }
  const { config } = await cache.get(key)!
  return config
}

export async function resolveCommandConfig<Name extends keyof NonNullable<MonorepoConfig['commands']>>(
  name: Name,
  cwd: string,
): Promise<NonNullable<MonorepoConfig['commands']>[Name]> {
  const config = await loadMonorepoConfig(cwd)
  const commands = config.commands ?? {}
  const commandConfig = commands[name]
  return (commandConfig ?? {}) as NonNullable<MonorepoConfig['commands']>[Name]
}
