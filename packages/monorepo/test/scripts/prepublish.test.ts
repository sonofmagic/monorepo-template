import { beforeEach, describe, expect, it, vi } from 'vitest'

interface CopyOptions {
  filter?: (src: string) => boolean
}

const ensureDirMock = vi.fn(async () => {})
const copyMock = vi.fn<(source: string, target: string, options?: CopyOptions) => Promise<void>>(async () => {})
const pathExistsMock = vi.fn(async (_target: string) => true)
const getAssetTargetsMock = vi.fn<() => string[]>(() => [])
const getTemplateTargetsMock = vi.fn<() => Promise<string[]>>(async () => [])
const successMock = vi.fn<(message: string) => void>()
const errorMock = vi.fn<(err: unknown) => void>()

const assetsDir = '/virtual/assets'
const rootDir = '/virtual/repo'
const templatesDir = '/virtual/templates'

beforeEach(async () => {
  await vi.resetModules()
  ensureDirMock.mockClear()
  copyMock.mockClear()
  pathExistsMock.mockReset()
  getAssetTargetsMock.mockReset()
  getTemplateTargetsMock.mockReset()
  successMock.mockClear()
  errorMock.mockClear()

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
    assetsDir,
    rootDir,
    templatesDir,
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
})

describe('prepareAssets', () => {
  it('copies assets and templates while renaming gitignore files', async () => {
    getAssetTargetsMock.mockReturnValue([
      'missing/file.txt',
      '.husky',
      'docs/.gitignore',
    ])
    getTemplateTargetsMock.mockResolvedValue([
      'packages/template/.gitignore',
    ])

    pathExistsMock.mockImplementation(async (target: string) => {
      return !target.includes('missing')
    })

    const { prepareAssets } = await import('../../scripts/prepublish')
    await prepareAssets()

    expect(ensureDirMock).toHaveBeenCalledWith(assetsDir)
    // ensure copy was performed for husky folder with filter to drop "_"
    const huskyCall = copyMock.mock.calls.find(args => args[0] === `${rootDir}/.husky`)
    expect(huskyCall).toBeDefined()
    const huskyDest = huskyCall?.[1]
    const huskyOptions = huskyCall?.[2]
    expect(huskyDest).toBe(`${assetsDir}/.husky`)
    expect(typeof huskyOptions?.filter).toBe('function')
    expect(huskyOptions?.filter?.(`${rootDir}/.husky/_`)).toBe(false)
    expect(huskyOptions?.filter?.(`${rootDir}/.husky/hooks`)).toBe(true)

    // gitignore files should be renamed without the dot prefix inside assets/templates
    const assetGitignore = copyMock.mock.calls.find(args => args[0] === `${rootDir}/docs/.gitignore`)
    expect(assetGitignore?.[1]).toBe(`${assetsDir}/docs/gitignore`)

    const templateGitignore = copyMock.mock.calls.find(args => args[0] === `${rootDir}/packages/template/.gitignore`)
    expect(templateGitignore?.[1]).toBe(`${templatesDir}/packages/template/gitignore`)

    expect(successMock.mock.calls.map(args => args[0])).toEqual([
      'assets/.husky',
      'assets/docs/gitignore',
      'templates/packages/template/gitignore',
      'prepare ok!',
    ])
  })

  it('omits logs when silent mode is enabled', async () => {
    getAssetTargetsMock.mockReturnValue([])
    getTemplateTargetsMock.mockResolvedValue([])

    const { prepareAssets } = await import('../../scripts/prepublish')
    await prepareAssets({ silent: true })

    expect(successMock).not.toHaveBeenCalled()
  })

  it('invokes CLI handler on direct execution and reports errors', async () => {
    const originalArgv = [...process.argv]
    const originalExitCode = process.exitCode
    const scriptUrl = new URL('../../scripts/prepublish.ts', import.meta.url).href
    process.argv = ['node', '/virtual/run-prepublish.mjs']
    ensureDirMock.mockRejectedValueOnce(new Error('fail'))
    vi.doMock('node:url', () => ({
      pathToFileURL: vi.fn(() => ({ href: scriptUrl })),
    }))

    await import('../../scripts/prepublish')

    expect(errorMock).toHaveBeenCalledWith(expect.any(Error))
    expect(process.exitCode).toBe(1)

    process.exitCode = originalExitCode ?? 0
    process.argv = originalArgv
  })
})
