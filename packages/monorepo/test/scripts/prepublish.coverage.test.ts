import { describe, expect, it, vi } from 'vitest'

describe('prepublish script coverage', () => {
  it('handles copy errors gracefully and propagates unknown failures', async () => {
    const ensureDirMock = vi.fn(async () => {})
    const copyMock = vi.fn()
    const pathExistsMock = vi.fn()
    const getAssetTargetsMock = vi.fn(() => ['.husky', 'docs/.gitignore'])
    const getTemplateTargetsMock = vi.fn(async () => ['packages/template/gitignore'])
    const successMock = vi.fn()
    const errorMock = vi.fn()

    await vi.resetModules()
    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        ensureDir: ensureDirMock,
        copy: copyMock,
        pathExists: pathExistsMock,
      },
      ensureDir: ensureDirMock,
      copy: copyMock,
      pathExists: pathExistsMock,
    }))
    vi.doMock('../../src/constants', () => ({
      assetsDir: '/assets',
      rootDir: '/repo',
      templatesDir: '/templates',
    }))
    vi.doMock('../../src/commands/upgrade/targets', () => ({
      getAssetTargets: getAssetTargetsMock,
    }))
    vi.doMock('../../scripts/getTemplateTargets', () => ({
      getTemplateTargets: getTemplateTargetsMock,
    }))
    vi.doMock('../../src/core/logger', () => ({
      logger: {
        success: successMock,
        error: errorMock,
      },
    }))

    pathExistsMock.mockResolvedValue(true)
    copyMock.mockImplementationOnce(async () => {})
    copyMock.mockImplementationOnce(async () => {
      const err = new Error('ignored') as NodeJS.ErrnoException
      err.code = 'EEXIST'
      throw err
    })
    copyMock.mockImplementationOnce(async () => {})

    const { prepareAssets } = await import('../../scripts/prepublish')
    await prepareAssets()

    expect(successMock).toHaveBeenCalledWith('prepare ok!')
    expect(copyMock).toHaveBeenCalledTimes(3)

    copyMock.mockImplementationOnce(async () => {
      const err = new Error('fatal') as NodeJS.ErrnoException
      err.code = 'EPERM'
      throw err
    })

    await expect(prepareAssets()).rejects.toThrow('fatal')
  })
})
