import path from 'pathe'
// import { syncNpmMirror } from '@/monorepo/sync'
import { getWorkspacePackages } from '@/monorepo/workspace'

describe('sync', () => {
  it('syncNpmMirror case 0', async () => {
    const cwd = path.resolve(__dirname, '../../../../')
    const workspaceRepos = await getWorkspacePackages(
      cwd,
    )

    expect(workspaceRepos.some(x => path.normalize(x.rootDir) === path.normalize(cwd))).toBe(false)
  })

  it('syncNpmMirror case 1', async () => {
    const cwd = path.resolve(__dirname, '../../../../')
    const workspaceRepos = await getWorkspacePackages(
      cwd,
      {
        ignoreRootPackage: false,
        ignorePrivatePackage: false,
      },
    )

    expect(workspaceRepos.some(x => path.normalize(x.rootDir) === path.normalize(cwd))).toBe(true)
  })
})
