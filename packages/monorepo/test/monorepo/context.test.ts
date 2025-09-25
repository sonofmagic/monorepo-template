import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
  vi.resetAllMocks()
})

describe('createContext', () => {
  it('collects git metadata and workspace info', async () => {
    const fakePackages = [
      { manifest: { name: 'pkg-a' }, rootDir: '/repo/packages/a', pkgJsonPath: '/repo/packages/a/package.json' },
    ]
    const gitInstance = {
      getGitUrl: vi.fn(async () => ({ full_name: 'ice/awesome', name: 'awesome' })),
      getUser: vi.fn(async () => ({ name: 'Dev Example', email: 'dev@example.com' })),
    }

    vi.resetModules()
    vi.doMock('@/monorepo/workspace', () => ({
      getWorkspaceData: vi.fn(async () => ({ packages: fakePackages, workspaceDir: '/repo' })),
    }))
    vi.doMock('@/monorepo/git', () => ({
      GitClient: vi.fn(() => gitInstance),
    }))

    const { createContext } = await import('@/monorepo/context')
    const ctx = await createContext('/repo')

    expect(ctx.gitUrl?.full_name).toBe('ice/awesome')
    expect(ctx.gitUser?.email).toBe('dev@example.com')
    expect(ctx.packages).toBe(fakePackages)
    expect(ctx.workspaceFilepath.endsWith('pnpm-workspace.yaml')).toBe(true)
  })
})

describe('init', () => {
  it('executes setup pipeline', async () => {
    const ctx = { cwd: '/repo' }
    const createContextMock = vi.fn(async () => ctx)
    const setChangesetMock = vi.fn(async () => {})
    const setPkgJsonMock = vi.fn(async () => {})
    const setReadmeMock = vi.fn(async () => {})

    vi.resetModules()
    vi.doMock('@/monorepo/context', () => ({ createContext: createContextMock }))
    vi.doMock('@/monorepo/init/setChangeset', () => ({ default: setChangesetMock }))
    vi.doMock('@/monorepo/init/setPkgJson', () => ({ default: setPkgJsonMock }))
    vi.doMock('@/monorepo/init/setReadme', () => ({ default: setReadmeMock }))

    const { init } = await import('@/monorepo/init')
    await init('/repo')

    expect(createContextMock).toHaveBeenCalledWith('/repo')
    expect(setChangesetMock).toHaveBeenCalledWith(ctx)
    expect(setPkgJsonMock).toHaveBeenCalledWith(ctx)
    expect(setReadmeMock).toHaveBeenCalledWith(ctx)
  })
})
