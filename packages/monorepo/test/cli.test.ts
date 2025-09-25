import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
  vi.resetAllMocks()
})

describe('CLI entrypoint', () => {
  it('invokes program.parse on startup', async () => {
    const parseMock = vi.fn()
    vi.doMock('@/program', () => ({ default: { parse: parseMock } }))

    await import('@/cli')

    expect(parseMock).toHaveBeenCalledTimes(1)
  })
})
