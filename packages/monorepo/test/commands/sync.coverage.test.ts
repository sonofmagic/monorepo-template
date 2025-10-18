import { afterEach, describe, expect, it, vi } from 'vitest'

const resolveCommandConfigMock = vi.fn()
const getWorkspaceDataMock = vi.fn()
const execaCommandMock = vi.fn()
const queueCtorMock = vi.fn()
const queueAddMock = vi.fn()
const loggerInfoMock = vi.fn()

vi.mock('p-queue', () => ({
  __esModule: true,
  default: class FakeQueue<T> {
    constructor(options: T) {
      queueCtorMock(options)
    }

    add(task: () => Promise<unknown>) {
      queueAddMock(task)
      return task()
    }
  },
}))

vi.mock('execa', () => ({
  execaCommand: execaCommandMock,
}))

vi.mock('@/core/workspace', () => ({
  getWorkspaceData: getWorkspaceDataMock,
}))

vi.mock('@/core/config', () => ({
  resolveCommandConfig: resolveCommandConfigMock,
}))

vi.mock('@/core/logger', () => ({
  logger: {
    info: loggerInfoMock,
  },
}))

afterEach(() => {
  resolveCommandConfigMock.mockReset()
  getWorkspaceDataMock.mockReset()
  execaCommandMock.mockReset()
  queueCtorMock.mockReset()
  queueAddMock.mockReset()
  loggerInfoMock.mockReset()
})

describe('sync coverage', () => {
  it('covers default and custom sync flows', async () => {
    resolveCommandConfigMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        concurrency: 2,
        command: 'mirror {name}',
        packages: ['pkg-b'],
        ignorePrivatePackage: false,
      })

    getWorkspaceDataMock
      .mockResolvedValueOnce({
        workspaceDir: '/repo',
        packages: [
          { manifest: { name: 'pkg-a' }, rootDir: '/repo/packages/a' },
          { manifest: { name: 'pkg-b' }, rootDir: '/repo/packages/b' },
          { manifest: { name: '' }, rootDir: '/repo/packages/empty' },
        ],
      })
      .mockResolvedValueOnce({
        workspaceDir: '/repo',
        packages: [
          { manifest: { name: 'pkg-a' }, rootDir: '/repo/packages/a' },
          { manifest: { name: 'pkg-b' }, rootDir: '/repo/packages/b' },
        ],
      })

    const { syncNpmMirror } = await import('@/commands/sync')

    execaCommandMock.mockImplementation(async () => ({ stdout: '' }))
    queueAddMock.mockImplementation(async (task: () => Promise<unknown>) => task())

    // default configuration should deduplicate and skip unnamed packages
    await syncNpmMirror('/repo')
    expect(loggerInfoMock).toHaveBeenCalledTimes(2)
    const firstRunCommands = execaCommandMock.mock.calls.map(args => args[0])
    expect(firstRunCommands).toContain('cnpm sync pkg-a')
    expect(firstRunCommands).toContain('cnpm sync pkg-b')

    // custom configuration should honour concurrency, command template and package filter
    queueCtorMock.mockClear()
    queueAddMock.mockClear()
    execaCommandMock.mockClear()
    loggerInfoMock.mockClear()

    await syncNpmMirror('/repo')

    expect(queueCtorMock).toHaveBeenCalledWith({ concurrency: 2 })
    expect(queueAddMock).toHaveBeenCalledTimes(1)
    const secondRunCommands = execaCommandMock.mock.calls.map(args => args[0])
    expect(secondRunCommands.length).toBeGreaterThanOrEqual(1)
    expect(secondRunCommands.every(cmd => cmd === 'mirror pkg-b')).toBe(true)
  })
})
