import path from 'pathe'
import { loadMonorepoConfig } from './config'
import { GitClient } from './git'
import { getWorkspaceData } from './workspace'
import '@pnpm/types'

/**
 * 构建命令执行上下文，封装常用的工作区、Git、配置等信息。
 */
export async function createContext(cwd: string) {
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

/**
 * 统一导出的上下文类型，方便下游函数准确获知可用字段。
 */
export type Context = Awaited<ReturnType<typeof createContext>>
