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

    await vi.resetModules()
    const execaCommandMock = vi.fn(async (command: string) => {
      commands.push(command.trim())
      return { stdout: '' }
    })
    vi.doMock('execa', () => ({ execaCommand: execaCommandMock }))
    vi.doMock('@/core/workspace', () => ({
      getWorkspaceData: vi.fn(async () => ({ packages, workspaceDir: '/repo' })),
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: vi.fn(async () => ({})),
    }))

    const { syncNpmMirror } = await import('@/commands/sync')
    await syncNpmMirror('/repo')

    expect(execaCommandMock).toHaveBeenCalledTimes(2)
    expect(commands).toEqual(['cnpm sync pkg-a', 'cnpm sync pkg-b'])
    await vi.resetModules()
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

    const execaCommandMock = vi.fn(async () => ({}))

    await vi.resetModules()
    vi.doMock('execa', () => ({ execaCommand: execaCommandMock }))
    vi.doMock('@/core/workspace', () => ({
      getWorkspaceData: vi.fn(async () => ({ packages, workspaceDir: '/repo' })),
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: vi.fn(async () => ({})),
    }))

    const { syncNpmMirror } = await import('@/commands/sync')
    await syncNpmMirror('/repo')

    expect(execaCommandMock).toHaveBeenCalledTimes(1)
    expect(execaCommandMock).toHaveBeenCalledWith('cnpm sync pkg-a', expect.objectContaining({ stdio: 'inherit' }))
  })

  it('uses configured command template and package filters', async () => {
    const packages = [
      {
        manifest: { name: 'pkg-a' },
        rootDir: '/repo/packages/a',
      },
      {
        manifest: { name: 'pkg-b' },
        rootDir: '/repo/packages/b',
      },
    ]
    const executed: string[] = []
    const queueCtorMock = vi.fn()
    const addMock = vi.fn(async (task: () => Promise<unknown>) => task())
    class MockQueue {
      constructor(options: { concurrency: number }) {
        queueCtorMock(options)
      }

      add(task: () => Promise<unknown>) {
        return addMock(task)
      }
    }
    const execaCommandMock = vi.fn(async (command: string) => {
      executed.push(command)
      return {}
    })

    await vi.resetModules()
    vi.doMock('p-queue', () => ({
      __esModule: true,
      default: MockQueue,
    }))
    vi.doMock('execa', () => ({ execaCommand: execaCommandMock }))
    vi.doMock('@/core/workspace', () => ({
      getWorkspaceData: vi.fn(async () => ({ packages, workspaceDir: '/repo' })),
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: vi.fn(async () => ({
        concurrency: 5,
        command: 'custom {name}',
        packages: ['pkg-b'],
      })),
    }))
    vi.doMock('@/core/logger', () => ({ logger: { info: vi.fn() } }))

    const { syncNpmMirror } = await import('@/commands/sync')
    await syncNpmMirror('/repo')

    expect(queueCtorMock).toHaveBeenCalledWith({ concurrency: 5 })
    expect(addMock).toHaveBeenCalledTimes(1)
    expect(executed).toEqual(['custom pkg-b'])
  })
})
