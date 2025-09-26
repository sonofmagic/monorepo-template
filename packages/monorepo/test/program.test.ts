import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
  vi.resetAllMocks()
})

describe('commander program', () => {
  it('wires each command to the corresponding handler', async () => {
    const upgradeMock = vi.fn(async () => {})
    const initMock = vi.fn(async () => {})
    const syncMock = vi.fn(async () => {})
    const cleanMock = vi.fn(async () => {})
    const mirrorMock = vi.fn(async () => {})
    const createMock = vi.fn(async () => {})

    vi.doMock('@/commands', () => ({
      cleanProjects: cleanMock,
      createNewProject: createMock,
      init: initMock,
      setVscodeBinaryMirror: mirrorMock,
      syncNpmMirror: syncMock,
      upgradeMonorepo: upgradeMock,
    }))

    const inputMock = vi.fn(async () => 'my-package')
    const selectMock = vi.fn(async () => 'unbuild')
    vi.doMock('@inquirer/input', () => ({ default: inputMock }))
    vi.doMock('@inquirer/select', () => ({ default: selectMock }))

    vi.doMock('@/commands/create', () => ({
      createChoices: [{ value: 'unbuild', name: 'unbuild template' }],
      defaultTemplate: 'unbuild',
    }))

    const successMock = vi.fn()
    vi.doMock('@/core/logger', () => ({ logger: { success: successMock } }))

    const { default: program } = await import('@/cli/program')

    await program.parseAsync(['node', 'monorepo', 'upgrade'])
    await program.parseAsync(['node', 'monorepo', 'init'])
    await program.parseAsync(['node', 'monorepo', 'sync'])
    await program.parseAsync(['node', 'monorepo', 'clean'])
    await program.parseAsync(['node', 'monorepo', 'mirror'])
    await program.parseAsync(['node', 'monorepo', 'new'])

    expect(upgradeMock).toHaveBeenCalled()
    expect(initMock).toHaveBeenCalled()
    expect(syncMock).toHaveBeenCalled()
    expect(cleanMock).toHaveBeenCalled()
    expect(mirrorMock).toHaveBeenCalled()
    expect(createMock).toHaveBeenCalledWith({
      name: 'my-package',
      cwd: expect.any(String),
      type: 'unbuild',
    })
    expect(successMock).toHaveBeenCalledTimes(6)
  })
})
