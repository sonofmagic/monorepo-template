import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'

describe('upgrade command coverage', () => {
  it('processes assets, schedules overwrites, and handles errors', async () => {
    const checkboxMock = vi.fn(async ({ choices }: { choices?: Array<{ value: string }> }) => {
      return Array.isArray(choices) ? choices.map(choice => choice.value as string) : []
    })
    const resolveCommandConfigMock = vi.fn()
    const getAssetTargetsMock = vi.fn()
    const gitClientCtorMock = vi.fn()
    const loggerSuccessMock = vi.fn()
    const pathExistsMock = vi.fn()
    const readJsonMock = vi.fn()
    const readFileMock = vi.fn()
    const outputFileMock = vi.fn()
    const evaluateWriteIntentMock = vi.fn()
    const scheduleOverwriteMock = vi.fn()
    const flushPendingOverwritesMock = vi.fn(async (pending: Array<{ action: () => Promise<void> }>) => {
      for (const item of pending) {
        await item.action()
      }
    })
    const setPkgJsonMock = vi.fn()

    const klawFeeds: Array<Array<{ path: string, isFile: boolean }>> = []
    const fileContents = new Map<string, string>()
    const jsonContents = new Map<string, unknown>()

    await vi.resetModules()
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    vi.doMock('@/constants', () => ({
      assetsDir: '/assets',
      rootDir: '/repo',
      templatesDir: '/templates',
      name: '@icebreakers/monorepo',
      version: '1.0.0',
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: resolveCommandConfigMock,
    }))
    vi.doMock('@/core/git', () => ({
      GitClient: function GitClient(this: unknown) {
        gitClientCtorMock()
        return {
          getRepoName: async () => 'ice/awesome',
        }
      },
    }))
    vi.doMock('@/core/logger', () => ({
      logger: {
        success: loggerSuccessMock,
      },
    }))
    vi.doMock('@/commands/upgrade/targets', () => ({
      getAssetTargets: getAssetTargetsMock,
    }))
    vi.doMock('@/commands/upgrade/pkg-json', () => ({
      setPkgJson: setPkgJsonMock,
    }))
    vi.doMock('@/commands/upgrade/overwrite', () => ({
      evaluateWriteIntent: evaluateWriteIntentMock,
      scheduleOverwrite: scheduleOverwriteMock,
      flushPendingOverwrites: flushPendingOverwritesMock,
    }))
    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
        readJson: readJsonMock,
        readFile: readFileMock,
        outputFile: outputFileMock,
      },
      pathExists: pathExistsMock,
      readJson: readJsonMock,
      readFile: readFileMock,
      outputFile: outputFileMock,
    }))
    vi.doMock('klaw', () => ({
      __esModule: true,
      default: (_dir: string, options: { filter: (p: string) => boolean }) => ({
        async* [Symbol.asyncIterator]() {
          const feed = klawFeeds.shift() ?? []
          for (const entry of feed) {
            if (!options.filter || options.filter(entry.path)) {
              yield {
                path: entry.path,
                stats: {
                  isFile: () => entry.isFile,
                },
              }
            }
          }
        },
      }),
    }))

    resolveCommandConfigMock
      .mockResolvedValueOnce({
        targets: ['.changeset', 'missing.json'],
        mergeTargets: true,
        scripts: {
          lint: 'eslint .',
        },
      })
      .mockResolvedValueOnce({
        targets: ['README.md'],
        mergeTargets: false,
      })

    getAssetTargetsMock.mockReturnValue(['README.md', 'package.json'])

    const initialFeed = [
      { path: '/assets/folder', isFile: false },
      { path: '/assets/package.json', isFile: true },
      { path: '/assets/missing.json', isFile: true },
      { path: '/assets/.changeset/config.json', isFile: true },
      { path: '/assets/.changeset/skip.md', isFile: true },
      { path: '/assets/LICENSE', isFile: true },
      { path: '/assets/README.md', isFile: true },
      { path: '/assets/error.txt', isFile: true },
    ]
    klawFeeds.push(initialFeed)
    klawFeeds.push([{ path: '/assets/README.md', isFile: true }])

    fileContents.set('/assets/LICENSE', 'license')
    fileContents.set('/assets/README.md', '# readme')
    fileContents.set('/assets/error.txt', 'ignore me')

    jsonContents.set('/assets/package.json', {
      dependencies: {
        'dep-new': '^1.0.0',
      },
      devDependencies: {
        'dep-dev': '^1.0.0',
      },
    })
    jsonContents.set('/workspace/package.json', {
      name: 'demo',
      dependencies: {},
      devDependencies: {},
    })
    jsonContents.set('/assets/.changeset/config.json', { changelog: [null, { repo: '' }] })

    pathExistsMock.mockImplementation(async (targetPath: string) => {
      if (targetPath.endsWith('missing.json')) {
        return false
      }
      return true
    })
    readJsonMock.mockImplementation(async (targetPath: string) => {
      if (!jsonContents.has(targetPath)) {
        throw new Error(`Missing json for ${targetPath}`)
      }
      return jsonContents.get(targetPath)
    })
    readFileMock.mockImplementation(async (targetPath: string) => {
      if (targetPath.endsWith('error.txt')) {
        const err = new Error('not found') as NodeJS.ErrnoException
        err.code = 'ENOENT'
        throw err
      }
      const value = fileContents.get(targetPath)
      return typeof value === 'string' ? Buffer.from(value) : Buffer.from('')
    })
    outputFileMock.mockImplementation(async () => {})

    evaluateWriteIntentMock
      .mockResolvedValueOnce({ type: 'write', reason: 'missing' })
      .mockResolvedValueOnce({ type: 'prompt', reason: 'changed' })
      .mockResolvedValueOnce({ type: 'write', reason: 'missing' })
      .mockResolvedValueOnce({ type: 'write', reason: 'missing' })

    scheduleOverwriteMock.mockImplementation(async (intent, options) => {
      if (intent.type === 'write') {
        await options.action()
      }
      else {
        options.pending.push({
          relPath: options.relPath,
          targetPath: options.targetPath,
          action: options.action,
        })
      }
    })

    const { upgradeMonorepo } = await import('@/commands/upgrade')

    await upgradeMonorepo({ cwd: '/repo', outDir: '/workspace', interactive: true })

    expect(checkboxMock).toHaveBeenCalled()
    expect(setPkgJsonMock).toHaveBeenCalled()
    expect(scheduleOverwriteMock).toHaveBeenCalled()
    expect(flushPendingOverwritesMock).toHaveBeenCalledTimes(1)
    expect(loggerSuccessMock).toHaveBeenCalled()

    evaluateWriteIntentMock.mockResolvedValueOnce({ type: 'write', reason: 'missing' })
    readFileMock.mockImplementation(async () => {
      const err = new Error('fatal') as NodeJS.ErrnoException
      err.code = 'EFAIL'
      throw err
    })

    await expect(upgradeMonorepo({ cwd: '/repo', outDir: '/workspace' })).rejects.toThrow('fatal')
  })
})
