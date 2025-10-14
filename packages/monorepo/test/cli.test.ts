import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

describe('CLI entrypoint', () => {
  it('invokes program.parse on startup', async () => {
    const parseMock = vi.fn()
    vi.doMock('@/cli/program', () => ({ default: { parse: parseMock } }))

    await import('@/cli')

    expect(parseMock).toHaveBeenCalledTimes(1)
  })
})
