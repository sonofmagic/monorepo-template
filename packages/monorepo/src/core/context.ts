import path from 'pathe'
import { loadMonorepoConfig } from './config'
import { GitClient } from './git'
import { getWorkspaceData } from './workspace'

export interface Context {
  cwd: string
  git: GitClient
  gitUrl: Awaited<ReturnType<GitClient['getGitUrl']>>
  gitUser: Awaited<ReturnType<GitClient['getUser']>>
  workspaceDir: string
  workspaceFilepath: string
  packages: Awaited<ReturnType<typeof getWorkspaceData>>['packages']
  config: Awaited<ReturnType<typeof loadMonorepoConfig>>
}

/**
 * 构建命令执行上下文，封装常用的工作区、Git、配置等信息。
 */
export async function createContext(cwd: string): Promise<Context> {
  const { packages, workspaceDir } = await getWorkspaceData(cwd)
  const git = new GitClient({
    baseDir: workspaceDir,
  })
  const workspaceFilepath = path.resolve(workspaceDir, 'pnpm-workspace.yaml')
  const gitUrl = await git.getGitUrl()
  const gitUser = await git.getUser()
  const config = await loadMonorepoConfig(workspaceDir)
  return {
    cwd,
    git,
    gitUrl,
    gitUser,
    workspaceDir,
    workspaceFilepath,
    packages,
    config,
  }
}
