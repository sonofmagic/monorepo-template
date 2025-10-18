import { describe, expect, it, vi } from 'vitest'

describe('vitest setup coverage', () => {
  it('prepares assets when license is missing and skips otherwise', async () => {
    const pathExistsMock = vi.fn()
    const prepareAssetsMock = vi.fn(async () => {})

    await vi.resetModules()
    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
      },
      pathExists: pathExistsMock,
    }))
    vi.doMock('../scripts/prepublish', () => ({
      prepareAssets: prepareAssetsMock,
    }))
    pathExistsMock.mockResolvedValueOnce(false)
    await import('../vitest.setup')
    expect(prepareAssetsMock).toHaveBeenCalledWith({ silent: true })

    await vi.resetModules()
    pathExistsMock.mockReset()
    prepareAssetsMock.mockReset()
    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
      },
      pathExists: pathExistsMock,
    }))
    vi.doMock('../scripts/prepublish', () => ({
      prepareAssets: prepareAssetsMock,
    }))
    pathExistsMock.mockResolvedValueOnce(true)
    await import('../vitest.setup')
    expect(prepareAssetsMock).not.toHaveBeenCalled()
  })
})
