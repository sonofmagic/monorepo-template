export type { PackageJson } from 'pkg-types'
export type { ConfigValues, SimpleGit, SimpleGitOptions } from 'simple-git'
export interface CliOpts {
  interactive?: boolean
  raw?: boolean
  outDir?: string
  cwd?: string
}
