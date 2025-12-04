import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

describe('ai template command', () => {
  it('prints markdown template to stdout by default', async () => {
    vi.doMock('@/core/logger', () => ({
      logger: {
        success: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
      },
    }))

    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    const { generateAgenticTemplate } = await import('@/commands/ai')

    const content = await generateAgenticTemplate({ cwd: '/repo' })

    expect(content).toContain('目标/产物')
    expect(content).toContain('里程碑（根因→设计→实现→验证）')
    expect(writeSpy).toHaveBeenCalledTimes(1)
    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('目标/产物'))

    writeSpy.mockRestore()
  })

  it('writes template with name/baseDir and reports overwrite', async () => {
    const ensureDirMock = vi.fn(async () => {})
    const outputFileMock = vi.fn(async () => {})
    const pathExistsMock = vi.fn(async () => true)
    const successMock = vi.fn()

    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        ensureDir: ensureDirMock,
        outputFile: outputFileMock,
        pathExists: pathExistsMock,
      },
      ensureDir: ensureDirMock,
      outputFile: outputFileMock,
      pathExists: pathExistsMock,
    }))

    vi.doMock('@/core/logger', () => ({
      logger: {
        success: successMock,
        info: vi.fn(),
        error: vi.fn(),
      },
    }))

    const { generateAgenticTemplate } = await import('@/commands/ai')
    const content = await generateAgenticTemplate({
      cwd: '/repo',
      name: 'checkout',
      baseDir: 'agentic',
      force: true,
      format: 'json',
    })

    expect(ensureDirMock).toHaveBeenCalledWith('/repo/agentic')
    expect(pathExistsMock).toHaveBeenCalledWith('/repo/agentic/checkout.json')
    expect(outputFileMock).toHaveBeenCalledWith('/repo/agentic/checkout.json', expect.stringContaining('"目标/产物"'), 'utf8')
    expect(successMock).toHaveBeenCalledWith(expect.stringContaining('已覆盖模板'))
    expect(content.trim().startsWith('{')).toBe(true)
  })

  it('generates batch templates from tasks file', async () => {
    const ensureDirMock = vi.fn(async () => {})
    const outputFileMock = vi.fn(async () => {})
    const pathExistsMock = vi.fn(async () => false)
    const readJsonMock = vi.fn(async () => ['checkout', { name: 'payments', format: 'json', force: true }])
    const successMock = vi.fn()

    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        ensureDir: ensureDirMock,
        outputFile: outputFileMock,
        pathExists: pathExistsMock,
        readJson: readJsonMock,
      },
      ensureDir: ensureDirMock,
      outputFile: outputFileMock,
      pathExists: pathExistsMock,
      readJson: readJsonMock,
    }))

    vi.doMock('@/core/logger', () => ({
      logger: {
        success: successMock,
        info: vi.fn(),
        error: vi.fn(),
      },
    }))

    const { loadAgenticTasks, generateAgenticTemplates } = await import('@/commands/ai')
    const tasks = await loadAgenticTasks('agentic/tasks.json', '/repo')
    await generateAgenticTemplates(tasks, { cwd: '/repo', baseDir: 'agentic' })

    expect(readJsonMock).toHaveBeenCalledWith('/repo/agentic/tasks.json')
    expect(ensureDirMock).toHaveBeenCalledWith('/repo/agentic')
    expect(pathExistsMock).toHaveBeenCalledWith('/repo/agentic/checkout.md')
    expect(outputFileMock).toHaveBeenCalledWith('/repo/agentic/checkout.md', expect.stringContaining('目标/产物'), 'utf8')
    expect(outputFileMock).toHaveBeenCalledWith('/repo/agentic/payments.json', expect.stringContaining('"目标/产物"'), 'utf8')
    expect(successMock).toHaveBeenCalledTimes(2)
  })
})
