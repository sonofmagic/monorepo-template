import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const inputMock = vi.fn(async () => 'demo')
const selectMock = vi.fn(async () => 'library')
const createNewProjectMock = vi.fn(async () => {})
const getCreateChoicesMock = vi.fn(() => [])
const resolveCommandConfigMock = vi.fn(async () => ({}))

beforeEach(async () => {
  await vi.resetModules()
  inputMock.mockReset()
  selectMock.mockReset()
  createNewProjectMock.mockReset()
  getCreateChoicesMock.mockReset()
  resolveCommandConfigMock.mockReset()

  inputMock.mockResolvedValue('demo')
  getCreateChoicesMock.mockReturnValue([])
  resolveCommandConfigMock.mockResolvedValue({})

  vi.doMock('@icebreakers/monorepo-templates', async () => {
    const actual = await vi.importActual<typeof import('@icebreakers/monorepo-templates')>('@icebreakers/monorepo-templates')
    return {
      ...actual,
      input: inputMock,
      select: selectMock,
    }
  })

  vi.doMock('@/commands', async () => {
    const actual = await vi.importActual<typeof import('@/commands')>('@/commands')
    return {
      ...actual,
      createNewProject: createNewProjectMock,
      getCreateChoices: getCreateChoicesMock,
    }
  })

  vi.doMock('@/core/config', () => ({
    resolveCommandConfig: resolveCommandConfigMock,
  }))
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('runCreateFlow', () => {
  it('uses intent flow for library creation by default', async () => {
    selectMock
      .mockResolvedValueOnce('library')
      .mockResolvedValueOnce('tsdown')

    const { runCreateFlow } = await import('@/cli/commands/package/create-flow')
    await runCreateFlow('/repo', '')

    expect(createNewProjectMock).toHaveBeenCalledWith({
      name: 'packages/demo',
      cwd: '/repo',
      type: 'tsdown',
    })
  })

  it('maps web-app intent to apps directory', async () => {
    selectMock.mockResolvedValueOnce('web-app')

    const { runCreateFlow } = await import('@/cli/commands/package/create-flow')
    await runCreateFlow('/repo', 'portal')

    expect(createNewProjectMock).toHaveBeenCalledWith({
      name: 'apps/portal',
      cwd: '/repo',
      type: 'vue-hono',
    })
  })

  it('keeps explicit nested paths unchanged in intent flow', async () => {
    selectMock.mockResolvedValueOnce('api-service')

    const { runCreateFlow } = await import('@/cli/commands/package/create-flow')
    await runCreateFlow('/repo', 'apps/custom-api')

    expect(createNewProjectMock).toHaveBeenCalledWith({
      name: 'apps/custom-api',
      cwd: '/repo',
      type: 'hono-server',
    })
  })

  it('falls back to template flow when default template is configured', async () => {
    resolveCommandConfigMock.mockResolvedValueOnce({
      defaultTemplate: 'cli',
      choices: [{ name: 'CLI', value: 'cli' }],
    })
    selectMock.mockResolvedValueOnce('cli')

    const { runCreateFlow } = await import('@/cli/commands/package/create-flow')
    await runCreateFlow('/repo', '')

    expect(getCreateChoicesMock).toHaveBeenCalledWith([{ name: 'CLI', value: 'cli' }])
    expect(createNewProjectMock).toHaveBeenCalledWith({
      name: 'demo',
      cwd: '/repo',
      type: 'cli',
    })
  })
})
