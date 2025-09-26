import path from 'pathe'
import { vi } from 'vitest'
// import { syncNpmMirror } from '@/commands/sync'
import { getWorkspacePackages } from '@/core/workspace'

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

  it('syncNpmMirror deduplicates packages and awaits all jobs', async () => {
    const commands: string[] = []
    const packages = [
      {
        manifest: { name: 'pkg-a' },
        rootDir: '/repo/packages/a',
      },
      {
        manifest: { name: 'pkg-b' },
        rootDir: '/repo/packages/b',
      },
      {
        manifest: { name: 'pkg-a' },
        rootDir: '/repo/packages/a-copy',
      },
    ]

    vi.resetModules()
    const execaTag = vi.fn(async (strings: TemplateStringsArray, pkgName: string) => {
      const merged = strings.reduce((acc, chunk, idx) => acc + chunk + (idx < strings.length - 1 ? pkgName : ''), '')
      commands.push(merged.trim())
      return { stdout: '' }
    })
    const execaMock = vi.fn(() => execaTag)
    vi.doMock('execa', () => ({ execa: execaMock }))
    vi.doMock('@/core/workspace', () => ({
      getWorkspaceData: vi.fn(async () => ({ packages, workspaceDir: '/repo' })),
    }))

    const { syncNpmMirror } = await import('@/commands/sync')
    await syncNpmMirror('/repo')

    expect(execaMock).toHaveBeenCalledTimes(2)
    expect(commands).toEqual(['cnpm sync pkg-a', 'cnpm sync pkg-b'])
    vi.resetModules()
  })

  it('skips workspaces without names', async () => {
    const packages = [
      {
        manifest: { name: '' },
        rootDir: '/repo/packages/unnamed',
      },
      {
        manifest: { name: 'pkg-a' },
        rootDir: '/repo/packages/a',
      },
    ]

    const execaTag = vi.fn(async () => ({}))
    const execaMock = vi.fn(() => execaTag)

    vi.resetModules()
    vi.doMock('execa', () => ({ execa: execaMock }))
    vi.doMock('@/core/workspace', () => ({
      getWorkspaceData: vi.fn(async () => ({ packages, workspaceDir: '/repo' })),
    }))

    const { syncNpmMirror } = await import('@/commands/sync')
    await syncNpmMirror('/repo')

    expect(execaMock).toHaveBeenCalledTimes(1)
    expect(execaTag).toHaveBeenCalledWith(expect.any(Array), 'pkg-a')
  })
})
