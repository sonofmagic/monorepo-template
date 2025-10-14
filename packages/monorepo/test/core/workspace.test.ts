import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

describe('workspace helpers', () => {
  it('filters out root and private packages by default', async () => {
    const findWorkspacePackagesMock = vi.fn(async () => [
      { rootDir: '/repo', manifest: { name: 'root', private: false }, rootDirRealPath: '/repo' },
      { rootDir: '/repo/packages/a', manifest: { name: 'pkg-a', private: false }, rootDirRealPath: '/repo/packages/a' },
      { rootDir: '/repo/packages/b', manifest: { name: 'pkg-b', private: true }, rootDirRealPath: '/repo/packages/b' },
    ])
    const readManifestMock = vi.fn(async () => ({ packages: ['packages/*'] }))

    vi.doMock('@pnpm/workspace.find-packages', () => ({ findWorkspacePackages: findWorkspacePackagesMock }))
    vi.doMock('@pnpm/workspace.read-manifest', () => ({ readWorkspaceManifest: readManifestMock }))
    vi.doMock('@pnpm/find-workspace-dir', () => ({ findWorkspaceDir: vi.fn(async () => '/repo') }))

    const { getWorkspacePackages } = await import('@/core/workspace')
    const result = await getWorkspacePackages('/repo')

    expect(result.map(pkg => pkg.manifest.name)).toEqual(['pkg-a'])
    expect(result[0].pkgJsonPath).toBe('/repo/packages/a/package.json')
    expect(readManifestMock).toHaveBeenCalledWith('/repo')
    expect(findWorkspacePackagesMock).toHaveBeenCalledWith('/repo', { patterns: ['packages/*'] })
  })

  it('keeps root and private packages when options request them', async () => {
    const findWorkspacePackagesMock = vi.fn(async () => [
      { rootDir: '/repo', manifest: { name: 'root', private: false }, rootDirRealPath: '/repo' },
      { rootDir: '/repo/apps/site', manifest: { name: 'site', private: true }, rootDirRealPath: '/repo/apps/site' },
    ])

    vi.doMock('@pnpm/workspace.find-packages', () => ({ findWorkspacePackages: findWorkspacePackagesMock }))
    vi.doMock('@pnpm/workspace.read-manifest', () => ({ readWorkspaceManifest: vi.fn(async () => null) }))
    vi.doMock('@pnpm/find-workspace-dir', () => ({ findWorkspaceDir: vi.fn(async () => '/repo') }))

    const { getWorkspacePackages } = await import('@/core/workspace')
    const result = await getWorkspacePackages('/repo', {
      ignoreRootPackage: false,
      ignorePrivatePackage: false,
      patterns: ['apps/*'],
    })

    expect(findWorkspacePackagesMock).toHaveBeenCalledWith('/repo', { patterns: ['apps/*'] })
    expect(result.map(pkg => pkg.manifest.name)).toEqual(['root', 'site'])
  })

  it('falls back to cwd when workspace directory is not found', async () => {
    const findWorkspacePackagesMock = vi.fn(async () => [])

    vi.doMock('@pnpm/find-workspace-dir', () => ({ findWorkspaceDir: vi.fn(async () => undefined) }))
    vi.doMock('@pnpm/workspace.find-packages', () => ({ findWorkspacePackages: findWorkspacePackagesMock }))
    vi.doMock('@pnpm/workspace.read-manifest', () => ({ readWorkspaceManifest: vi.fn(async () => null) }))

    const { getWorkspaceData } = await import('@/core/workspace')
    const data = await getWorkspaceData('/repo/sub')

    expect(data.workspaceDir).toBe('/repo/sub')
    expect(findWorkspacePackagesMock).toHaveBeenCalledWith('/repo/sub', { patterns: undefined })
    expect(data.packages).toEqual([])
  })
})
