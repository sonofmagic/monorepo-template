import type { spawnSync } from 'node:child_process'
import type { ReleaseCommandConfig } from '../../types/config'
import type { GitHubOperations } from './github'

export const prereleaseBranches = new Set(['alpha', 'beta', 'rc', 'next'])

export type ReleaseMode = 'auto' | 'prepare' | 'publish' | 'publish-unpublished'

export interface ReleaseOptions {
  cwd: string
  branch?: string
  spawn?: typeof spawnSync
  env?: NodeJS.ProcessEnv
  hooks?: ReleaseCommandConfig['hooks']
}

export interface ReleaseCiOptions extends ReleaseOptions {
  mode?: ReleaseMode
  packageName?: string
  packageVersion?: string
  github?: GitHubOperations
}

export interface PublishedPackage {
  name: string
  version: string
}
