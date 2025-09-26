export type { MonorepoConfig } from './core/config'
export { defineMonorepoConfig } from './core/config'
export type { PackageJson } from 'pkg-types'
export type { ConfigValues, SimpleGit, SimpleGitOptions } from 'simple-git'

/**
 * CLI 命令通用参数，便于在各个子命令之间复用。
 */
export interface CliOpts {
  interactive?: boolean
  raw?: boolean
  outDir?: string
  cwd?: string
  skipOverwrite?: boolean
}
