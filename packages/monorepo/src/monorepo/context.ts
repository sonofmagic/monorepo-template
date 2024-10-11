import path from 'pathe'
import { GitClient } from './git'
import { getWorkspacePackages } from './workspace'
import '@pnpm/types'

export async function createContext(cwd: string) {
  const git = new GitClient()
  const workspaceFilepath = path.resolve(cwd, 'pnpm-workspace.yaml')
  const projects = await getWorkspacePackages(cwd)
  return {
    cwd,
    git,
    workspaceFilepath,
    projects,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
