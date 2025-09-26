import path from 'pathe'
import { GitClient } from '../git'
import { getWorkspaceData } from '../workspace'
import '@pnpm/types'

export async function createContext(cwd: string) {
  const { packages, workspaceDir } = await getWorkspaceData(cwd)
  const git = new GitClient({
    baseDir: workspaceDir,
  })
  const workspaceFilepath = path.resolve(workspaceDir, 'pnpm-workspace.yaml')
  const gitUrl = await git.getGitUrl()
  const gitUser = await git.getUser()
  return {
    cwd,
    git,
    gitUrl,
    gitUser,
    workspaceDir,
    workspaceFilepath,
    packages,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
