import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
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
    const aiTemplateMock = vi.fn(async () => {})

    vi.doMock('commander', async () => {
      const actual = await vi.importActual<typeof import('commander')>('commander')
      return {
        ...actual,
        program: new actual.Command(),
      }
    })
    const aiBatchMock = vi.fn(async () => {})
    const loadTasksMock = vi.fn(async () => ['config-task'])
    const choices = [{ value: 'unbuild', name: 'unbuild template' }]
    const resolveCommandConfigMock = vi.fn(async (name: string) => {
      if (name === 'ai') {
        return {
          output: 'config-agentic.md',
          format: 'md',
          force: false,
          baseDir: 'agentic',
          tasksFile: 'agentic/tasks.json',
        }
      }
      return { choices }
    })

    vi.doMock('@/commands', () => ({
      generateAgenticTemplate: aiTemplateMock,
      generateAgenticTemplates: aiBatchMock,
      loadAgenticTasks: loadTasksMock,
      cleanProjects: cleanMock,
      createNewProject: createMock,
      getCreateChoices: vi.fn(() => choices),
      init: initMock,
      setVscodeBinaryMirror: mirrorMock,
      syncNpmMirror: syncMock,
      templateMap: { unbuild: 'packages/unbuild-template' },
      upgradeMonorepo: upgradeMock,
    }))

    const inputMock = vi.fn(async () => 'my-package')
    const selectMock = vi.fn(async () => 'unbuild')
    vi.doMock('@inquirer/input', () => ({ default: inputMock }))
    vi.doMock('@inquirer/select', () => ({ default: selectMock }))

    vi.doMock('@/commands/create', () => ({
      defaultTemplate: 'unbuild',
      getTemplateMap: vi.fn(() => ({
        unbuild: 'packages/unbuild-template',
      })),
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: resolveCommandConfigMock,
    }))

    const successMock = vi.fn()
    vi.doMock('@/core/logger', () => ({ logger: { success: successMock } }))

    const { default: program } = await import('@/cli/program')

    await program.parseAsync(['node', 'monorepo', 'upgrade'])
    await program.parseAsync(['node', 'monorepo', 'init'])
    await program.parseAsync(['node', 'monorepo', 'sync'])
    await program.parseAsync(['node', 'monorepo', 'clean'])
    await program.parseAsync(['node', 'monorepo', 'mirror'])
    await program.parseAsync(['node', 'monorepo', 'ai', 'create', '--output', 'agentic.md', '--force', '--format', 'json'])
    await program.parseAsync(['node', 'monorepo', 'ai', 'new'])
    await program.parseAsync(['node', 'monorepo', 'new'])

    expect(upgradeMock).toHaveBeenCalledWith(expect.objectContaining({ cwd: expect.any(String) }))
    expect(initMock).toHaveBeenCalled()
    expect(syncMock).toHaveBeenCalled()
    expect(cleanMock).toHaveBeenCalled()
    expect(mirrorMock).toHaveBeenCalled()
    expect(aiTemplateMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
      cwd: expect.any(String),
      output: 'agentic.md',
      force: true,
      format: 'json',
      baseDir: 'agentic',
    }))
    expect(loadTasksMock).toHaveBeenCalledWith('agentic/tasks.json', expect.any(String))
    expect(aiBatchMock).toHaveBeenCalledWith(['config-task'], expect.objectContaining({
      cwd: expect.any(String),
      baseDir: 'agentic',
      force: false,
      format: 'md',
    }))
    expect(createMock).toHaveBeenCalledWith({
      name: 'my-package',
      cwd: expect.any(String),
      type: 'unbuild',
    })
    expect(successMock).toHaveBeenCalledTimes(6)
  })
})
