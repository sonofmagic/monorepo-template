import type { InitToolingTarget } from '../commands/init'
import type { CleanCommandConfig, CliOpts } from '../types'
import { normalizeInitToolingTargets } from '../commands'

export interface CleanCommandOptions {
  yes?: boolean
  includePrivate?: boolean
  pinnedVersion?: string
}

export interface InitCommandOptions {
  all?: boolean
  force?: boolean
}

export function normalizeCliOpts(cwd: string, opts: CliOpts): CliOpts {
  return {
    ...opts,
    core: opts.core ?? false,
    cwd,
  }
}

export function normalizeCleanOptions(opts: CleanCommandOptions) {
  const overrides: Partial<CleanCommandConfig> = {}
  if (opts.yes) {
    overrides.autoConfirm = true
  }
  if (opts.includePrivate) {
    overrides.includePrivate = true
  }
  if (opts.pinnedVersion) {
    overrides.pinnedVersion = opts.pinnedVersion
  }
  return overrides
}

export function normalizeToolingTargets(tooling: string[]) {
  return tooling.length ? normalizeInitToolingTargets(tooling) : undefined
}

export type NormalizedToolingTargets = InitToolingTarget[] | undefined
