import { afterEach, describe, expect, it, vi } from 'vitest'

const files = new Map<string, string>()

const existsMock = vi.fn(async (file: string) => files.has(file))
const pathExistsMock = vi.fn(async (file: string) => files.has(file))
const readJsonMock = vi.fn(async (file: string) => JSON.parse(files.get(file) ?? 'null'))
const outputJsonMock = vi.fn(async (file: string, data: unknown, options?: { spaces?: number }) => {
  const spaces = options?.spaces ?? 0
  files.set(file, `${JSON.stringify(data, undefined, spaces)}${spaces ? '\n' : ''}`)
})
const readFileMock = vi.fn(async (file: string) => files.get(file) ?? '')
const writeFileMock = vi.fn(async (file: string, content: string) => {
  files.set(file, content)
})

vi.mock('fs-extra', () => ({
  __esModule: true,
  default: {
    exists: existsMock,
    pathExists: pathExistsMock,
    readJson: readJsonMock,
    outputJson: outputJsonMock,
    readFile: readFileMock,
    writeFile: writeFileMock,
  },
  exists: existsMock,
  pathExists: pathExistsMock,
  readJson: readJsonMock,
  outputJson: outputJsonMock,
  readFile: readFileMock,
  writeFile: writeFileMock,
}))

afterEach(() => {
  files.clear()
  existsMock.mockReset()
  pathExistsMock.mockReset()
  readJsonMock.mockReset()
  outputJsonMock.mockReset()
  readFileMock.mockReset()
  writeFileMock.mockReset()
})

describe('init helpers coverage', () => {
  it('updates changeset config, package manifests and readme content', async () => {
    const workspaceDir = '/repo'
    const workspaceFilepath = `${workspaceDir}/pnpm-workspace.yaml`
    files.set(workspaceFilepath, '')
    files.set(`${workspaceDir}/.changeset/config.json`, JSON.stringify({ changelog: [null, { repo: '' }] }))
    files.set(`${workspaceDir}/packages/a/package.json`, JSON.stringify({ name: 'pkg-a', version: '0.0.0', description: 'Alpha' }))
    files.set(`${workspaceDir}/packages/root/package.json`, JSON.stringify({ name: 'root-app', version: '0.0.0', private: false }))

    const ctx = {
      cwd: workspaceDir,
      workspaceDir,
      workspaceFilepath,
      gitUrl: { full_name: 'ice/awesome', name: 'awesome' },
      gitUser: { name: 'Dev Example', email: 'dev@example.com' },
      packages: [
        {
          manifest: { name: 'pkg-a', version: '0.0.0', description: 'Alpha' },
          rootDir: `${workspaceDir}/packages/a`,
          rootDirRealPath: `${workspaceDir}/packages/a`,
          pkgJsonPath: `${workspaceDir}/packages/a/package.json`,
        },
        {
          manifest: { name: 'root-app', version: '0.0.0' },
          rootDir: `${workspaceDir}/packages/root`,
          rootDirRealPath: `${workspaceDir}/packages/root`,
          pkgJsonPath: `${workspaceDir}/packages/root/package.json`,
        },
      ],
    } as const

    const [setChangeset, setPkgJson, setReadme] = await Promise.all([
      import('@/commands/init/setChangeset').then(mod => mod.default),
      import('@/commands/init/setPkgJson').then(mod => mod.default),
      import('@/commands/init/setReadme').then(mod => mod.default),
    ])

    await setChangeset(ctx)
    const updatedChangeset = JSON.parse(files.get(`${workspaceDir}/.changeset/config.json`) ?? '{}')
    expect(updatedChangeset.changelog[1].repo).toBe('ice/awesome')

    await setChangeset({ ...ctx, gitUrl: { name: 'awesome' } })
    expect(outputJsonMock).toHaveBeenCalledTimes(1)

    await setPkgJson(ctx)
    const pkgA = JSON.parse(files.get(`${workspaceDir}/packages/a/package.json`) ?? '{}')
    expect(pkgA.author).toBe('Dev Example <dev@example.com>')
    expect(pkgA.repository.directory).toBe('packages/a')

    await setPkgJson({ ...ctx, gitUser: { name: 'Dev Example' } })
    expect(files.get(`${workspaceDir}/packages/root/package.json`)).toContain('"repository":')

    await setReadme(ctx)
    expect(files.get(`${workspaceDir}/README.md`)).toContain('Contributions Welcome!')

    await setReadme({ ...ctx, gitUrl: undefined })
    const readme = files.get(`${workspaceDir}/README.md`) ?? ''
    expect(readme).not.toContain('Contributions Welcome!')
  })

  it('invokes init pipeline respecting skip flags', async () => {
    const createContextMock = vi.fn(async () => ({
      cwd: '/repo',
      config: {
        commands: {
          init: {},
        },
      },
    }))
    const setChangesetMock = vi.fn(async () => {})
    const setPkgJsonMock = vi.fn(async () => {})
    const setReadmeMock = vi.fn(async () => {})

    await vi.resetModules()
    vi.doMock('@/core/context', () => ({ createContext: createContextMock }))
    vi.doMock('@/commands/init/setChangeset', () => ({ default: setChangesetMock }))
    vi.doMock('@/commands/init/setPkgJson', () => ({ default: setPkgJsonMock }))
    vi.doMock('@/commands/init/setReadme', () => ({ default: setReadmeMock }))

    const { init } = await import('@/commands/init')
    await init('/repo')
    expect(setChangesetMock).toHaveBeenCalled()
    expect(setPkgJsonMock).toHaveBeenCalled()
    expect(setReadmeMock).toHaveBeenCalled()

    setChangesetMock.mockClear()
    setPkgJsonMock.mockClear()
    setReadmeMock.mockClear()
    createContextMock.mockResolvedValueOnce({
      cwd: '/repo',
      config: {
        commands: {
          init: {
            skipChangeset: true,
            skipPkgJson: true,
            skipReadme: true,
          },
        },
      },
    })

    await init('/repo')
    expect(setChangesetMock).not.toHaveBeenCalled()
    expect(setPkgJsonMock).not.toHaveBeenCalled()
    expect(setReadmeMock).not.toHaveBeenCalled()
  })
})
