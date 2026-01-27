import { describe, expect, it, vi } from 'vitest'

describe('vitest setup coverage', () => {
  it('prepares assets when license is missing and skips otherwise', async () => {
    const pathExistsMock = vi.fn()
    const prepareAssetsMock = vi.fn(async () => {})
    const lockCloseMock = vi.fn(async () => {})
    const openMock = vi.fn(async () => ({ close: lockCloseMock }))
    const rmMock = vi.fn(async () => {})

    await vi.resetModules()
    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
      },
      pathExists: pathExistsMock,
    }))
    vi.doMock('node:fs/promises', () => ({
      open: openMock,
      rm: rmMock,
    }))
    vi.doMock('@icebreakers/monorepo-templates', () => ({
      assetsDir: '/assets',
      prepareAssets: prepareAssetsMock,
    }))
    pathExistsMock.mockResolvedValueOnce(false)
    await import('../vitest.setup')
    expect(prepareAssetsMock).toHaveBeenCalledWith({ silent: true, overwriteExisting: false })

    await vi.resetModules()
    pathExistsMock.mockReset()
    prepareAssetsMock.mockReset()
    lockCloseMock.mockReset()
    openMock.mockReset()
    rmMock.mockReset()
    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
      },
      pathExists: pathExistsMock,
    }))
    vi.doMock('node:fs/promises', () => ({
      open: openMock,
      rm: rmMock,
    }))
    vi.doMock('@icebreakers/monorepo-templates', () => ({
      assetsDir: '/assets',
      prepareAssets: prepareAssetsMock,
    }))
    pathExistsMock.mockResolvedValueOnce(true)
    await import('../vitest.setup')
    expect(prepareAssetsMock).not.toHaveBeenCalled()
  })
})
