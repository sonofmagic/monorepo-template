import path from 'pathe'
import { GitClient } from './git'
import { getWorkspacePackages } from './workspace'
import '@pnpm/types'

export async function createContext(cwd: string) {
  const git = new GitClient()
  const workspaceFilepath = path.resolve(cwd, 'pnpm-workspace.yaml')
  const projects = await getWorkspacePackages(cwd)
  const gitUrl = await git.getGitUrl()
  const gitUser = await git.getUser()
  return {
    cwd,
    git,
    gitUrl,
    gitUser,
    workspaceFilepath,
    projects,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
