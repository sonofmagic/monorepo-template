export type SourceType = 'npm' | 'git'

export interface CliOptions {
  targetDir: string
  repo: string
  branch: string
  source: SourceType
  force: boolean
  templates?: string
  help?: boolean
}
