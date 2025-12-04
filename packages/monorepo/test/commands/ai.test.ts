import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.restoreAllMocks()
  vi.resetAllMocks()
  vi.useRealTimers()
})

describe('ai create command', () => {
  it('writes markdown template into timestamped folder by default', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-02-14T10:20:30.400Z'))
    const ensureDirMock = vi.fn(async () => {})
    const outputFileMock = vi.fn(async () => {})
    const pathExistsMock = vi.fn(async () => false)
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

    const content = await generateAgenticTemplate({ cwd: '/repo' })

    expect(content).toContain('目标/产物')
    expect(content).toContain('里程碑（根因→设计→实现→验证）')
    expect(ensureDirMock).toHaveBeenCalledWith('/repo/agentic/prompts/20250214-102030')
    expect(pathExistsMock).toHaveBeenCalledWith('/repo/agentic/prompts/20250214-102030/prompt.md')
    expect(outputFileMock).toHaveBeenCalledWith('/repo/agentic/prompts/20250214-102030/prompt.md', expect.stringContaining('目标/产物'), 'utf8')
    expect(successMock).toHaveBeenCalledWith(expect.stringContaining('已生成模板'))
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

  it('accepts custom folder names when provided', async () => {
    const ensureDirMock = vi.fn(async () => {})
    const outputFileMock = vi.fn(async () => {})
    const pathExistsMock = vi.fn(async () => false)

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
        success: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
      },
    }))

    const { generateAgenticTemplate } = await import('@/commands/ai')
    await generateAgenticTemplate({
      cwd: '/repo',
      folderName: 'custom-folder',
    })

    expect(ensureDirMock).toHaveBeenCalledWith('/repo/agentic/prompts/custom-folder')
    expect(pathExistsMock).toHaveBeenCalledWith('/repo/agentic/prompts/custom-folder/prompt.md')
    expect(outputFileMock).toHaveBeenCalledWith('/repo/agentic/prompts/custom-folder/prompt.md', expect.any(String), 'utf8')
  })
})
