import { beforeEach, describe, expect, it, vi } from 'vitest'

const ensureDirMock = vi.fn(async () => {})
const copyMock = vi.fn(async () => {})
const readdirMock = vi.fn(async () => ['package.json'])
const readJsonMock = vi.fn(async () => ({ name: 'template', version: '1.0.0' }))
const outputJsonMock = vi.fn(async () => {})
const pathExistsMock = vi.fn(async () => false)
const resolveCommandConfigMock = vi.fn(async () => ({}))
const successMock = vi.fn()

beforeEach(async () => {
  await vi.resetModules()
  ensureDirMock.mockClear()
  copyMock.mockClear()
  readdirMock.mockReset()
  readJsonMock.mockReset()
  outputJsonMock.mockClear()
  pathExistsMock.mockReset()
  resolveCommandConfigMock.mockReset()
  successMock.mockClear()

  readdirMock.mockResolvedValue(['package.json', 'README.md', 'gitignore', '.DS_Store'])
  readJsonMock.mockResolvedValue({ name: 'template', version: '1.0.0' })
  pathExistsMock.mockImplementation(async () => false)

  vi.doMock('fs-extra', () => ({
    __esModule: true,
    default: {
      ensureDir: ensureDirMock,
      copy: copyMock,
      readdir: readdirMock,
      readJson: readJsonMock,
      outputJson: outputJsonMock,
      pathExists: pathExistsMock,
    },
    ensureDir: ensureDirMock,
    copy: copyMock,
    readdir: readdirMock,
    readJson: readJsonMock,
    outputJson: outputJsonMock,
    pathExists: pathExistsMock,
  }))

  vi.doMock('@/core/config', () => ({
    resolveCommandConfig: resolveCommandConfigMock,
  }))

  vi.doMock('@/core/logger', () => ({
    logger: {
      success: successMock,
      info: vi.fn(),
      error: vi.fn(),
    },
  }))
})

describe('createNewProject unit scenarios', () => {
  it('getCreateChoices returns defaults when override omitted', async () => {
    const { getCreateChoices } = await import('@/commands/create')
    expect(getCreateChoices()).toHaveLength(7)
    const customChoices = [{ name: 'custom', value: 'custom' }]
    expect(getCreateChoices(customChoices)).toBe(customChoices)
  })

  it('getTemplateMap merges extra entries', async () => {
    const { getTemplateMap } = await import('@/commands/create')
    const merged = getTemplateMap({ custom: 'templates/custom-template' })
    expect(merged.custom).toBe('templates/custom-template')
    expect(merged.unbuild).toBe('packages/unbuild-template')
  })

  it('throws when target directory already exists', async () => {
    pathExistsMock.mockResolvedValue(true)
    const { createNewProject } = await import('@/commands/create')

    await expect(createNewProject({ cwd: '/repo', name: 'demo' })).rejects.toThrow('目标目录已存在')
    expect(ensureDirMock).not.toHaveBeenCalled()
  })

  it('falls back to default template when requested type is unknown', async () => {
    readdirMock.mockResolvedValue(['package.json', 'README.md', 'gitignore', '.DS_Store'])
    resolveCommandConfigMock.mockResolvedValue({
      defaultTemplate: 'tsup',
      renameJson: false,
    })

    const { createNewProject } = await import('@/commands/create')
    await createNewProject({ cwd: '/repo', name: 'demo-app', type: 'unknown-template' })

    expect(successMock).toHaveBeenCalledWith(expect.stringContaining('[tsup]'))
    const outputCall = outputJsonMock.mock.calls.find(args => args[0].endsWith('package.json'))
    expect(outputCall).toBeDefined()
    const pkgJson = outputCall?.[1] as Record<string, unknown> | undefined
    expect(pkgJson?.name).toBe('demo-app')
    const copyTargets = copyMock.mock.calls.map(args => args[0])
    expect(copyTargets.some(target => target.includes('README.md'))).toBe(true)
    const filter = copyMock.mock.calls[0]?.[2]?.filter as ((src: string) => boolean) | undefined
    expect(filter?.('/repo/templates/.DS_Store')).toBe(false)
  })

  it('writes package.mock.json when renameJson option is enabled', async () => {
    readdirMock.mockResolvedValue(['package.json'])
    const { createNewProject } = await import('@/commands/create')
    await createNewProject({ cwd: '/repo', name: '@scope/demo', renameJson: true, type: 'tsup' })

    const outputCall = outputJsonMock.mock.calls.find(args => args[0].endsWith('package.mock.json'))
    expect(outputCall).toBeDefined()
    const pkgJson = outputCall?.[1] as Record<string, unknown> | undefined
    expect(pkgJson?.name).toBe('@scope/demo')
  })
})
