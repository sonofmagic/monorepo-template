import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

describe('commander program templates command', () => {
  it('suggests the closest template key when template detail lookup misses', async () => {
    vi.doMock('@icebreakers/monorepo-templates', async () => {
      const actual = await vi.importActual<typeof import('@icebreakers/monorepo-templates')>('@icebreakers/monorepo-templates')
      return {
        ...actual,
        program: new actual.Command(),
      }
    })

    const errorMock = vi.fn()
    const infoMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        error: errorMock,
        info: infoMock,
        log: vi.fn(),
        success: vi.fn(),
        warn: vi.fn(),
      },
    }))

    const previousExitCode = process.exitCode
    process.exitCode = undefined

    const { default: program } = await import('@/cli/program')
    await program.parseAsync(['node', 'repo', 'templates', 'tsdwon'])

    expect(errorMock).toHaveBeenCalledWith('unknown template: tsdwon')
    expect(infoMock).toHaveBeenCalledWith('did you mean `tsdown`?')
    expect(process.exitCode).toBe(1)

    process.exitCode = previousExitCode
  })
})
