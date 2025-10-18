import { describe, expect, it, vi } from 'vitest'

describe('core module coverage', () => {
  it('caches configuration, gathers workspace data and builds context', async () => {
    const loadConfigMock = vi.fn(async () => ({
      config: {
        commands: {
          clean: { autoConfirm: true },
        },
      },
      configFile: '/repo/monorepo.config.ts',
    }))
    const findWorkspacePackagesMock = vi.fn(async () => [
      { rootDir: '/repo', manifest: { name: 'root', private: false }, rootDirRealPath: '/repo' },
      { rootDir: '/repo/packages/a', manifest: { name: 'pkg-a', private: false }, rootDirRealPath: '/repo/packages/a' },
      { rootDir: '/repo/packages/b', manifest: { name: 'pkg-b', private: true }, rootDirRealPath: '/repo/packages/b' },
    ])
    const readWorkspaceManifestMock = vi.fn(async () => ({ packages: ['packages/*'] }))
    const findWorkspaceDirMock = vi.fn(async () => '/repo')

    await vi.resetModules()
    vi.doMock('c12', () => ({ loadConfig: loadConfigMock }))
    vi.doMock('@pnpm/workspace.find-packages', () => ({ findWorkspacePackages: findWorkspacePackagesMock }))
    vi.doMock('@pnpm/workspace.read-manifest', () => ({ readWorkspaceManifest: readWorkspaceManifestMock }))
    vi.doMock('@pnpm/find-workspace-dir', () => ({ findWorkspaceDir: findWorkspaceDirMock }))

    const workspaceModule = await import('@/core/workspace')
    const filtered = await workspaceModule.getWorkspacePackages('/repo')
    expect(filtered.map(pkg => pkg.manifest.name)).toEqual(['pkg-a'])

    const inclusive = await workspaceModule.getWorkspacePackages('/repo', {
      ignoreRootPackage: false,
      ignorePrivatePackage: false,
      patterns: ['apps/*'],
    })
    expect(findWorkspacePackagesMock).toHaveBeenLastCalledWith('/repo', { patterns: ['apps/*'] })
    expect(inclusive.map(pkg => pkg.manifest.name)).toEqual(['root', 'pkg-a', 'pkg-b'])

    findWorkspaceDirMock.mockResolvedValueOnce(undefined)
    const workspaceData = await workspaceModule.getWorkspaceData('/repo/sub')
    expect(workspaceData.workspaceDir).toBe('/repo/sub')

    const configModule = await import('@/core/config')
    const definition = configModule.defineMonorepoConfig({ commands: { sync: { concurrency: 4 } } })
    expect(definition.commands?.sync?.concurrency).toBe(4)

    const config = await configModule.loadMonorepoConfig('/repo')
    expect(config.commands?.clean?.autoConfirm).toBe(true)
    expect(await configModule.loadMonorepoConfig('/repo')).toBe(config)

    const resolvedClean = await configModule.resolveCommandConfig('clean', '/repo')
    const resolvedMirror = await configModule.resolveCommandConfig('mirror', '/repo')
    expect(resolvedClean.autoConfirm).toBe(true)
    expect(resolvedMirror).toEqual({})

    const gitClientMock = vi.fn(() => ({
      getGitUrl: vi.fn(async () => ({ full_name: 'ice/awesome', name: 'awesome' })),
      getUser: vi.fn(async () => ({ name: 'Dev Example', email: 'dev@example.com' })),
    }))

    vi.doMock('@/core/git', () => ({
      GitClient: gitClientMock,
    }))

    const contextModule = await import('@/core/context')
    const ctx = await contextModule.createContext('/repo')
    expect(ctx.gitUrl?.full_name).toBe('ice/awesome')
    expect(ctx.packages).toHaveLength(1)

    const coreIndex = await import('@/core')
    expect(coreIndex).toHaveProperty('createContext')
    expect(coreIndex).toHaveProperty('loadMonorepoConfig')
  })
})
