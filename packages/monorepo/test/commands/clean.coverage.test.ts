import { afterEach, describe, expect, it, vi } from 'vitest'

const resolveCommandConfigMock = vi.fn()
const getWorkspaceDataMock = vi.fn()
const checkboxMock = vi.fn()
const pathExistsMock = vi.fn()
const removeMock = vi.fn()
const readJsonMock = vi.fn()
const outputJsonMock = vi.fn()

vi.mock('@inquirer/checkbox', () => ({
  __esModule: true,
  default: checkboxMock,
}))

vi.mock('fs-extra', () => ({
  __esModule: true,
  default: {
    pathExists: pathExistsMock,
    remove: removeMock,
    readJson: readJsonMock,
    outputJson: outputJsonMock,
  },
  pathExists: pathExistsMock,
  remove: removeMock,
  readJson: readJsonMock,
  outputJson: outputJsonMock,
}))

vi.mock('@/core/config', () => ({
  resolveCommandConfig: resolveCommandConfigMock,
}))

vi.mock('@/core/workspace', () => ({
  getWorkspaceData: getWorkspaceDataMock,
}))

afterEach(() => {
  resolveCommandConfigMock.mockReset()
  getWorkspaceDataMock.mockReset()
  checkboxMock.mockReset()
  pathExistsMock.mockReset()
  removeMock.mockReset()
  readJsonMock.mockReset()
  outputJsonMock.mockReset()
})

describe('clean coverage', () => {
  it('covers interactive and auto confirm branches', async () => {
    const workspaceDir = '/repo'
    const rootPackageJson = { devDependencies: {} }

    resolveCommandConfigMock
      .mockResolvedValueOnce({
        ignorePackages: ['skip-me'],
        pinnedVersion: '1.2.3',
      })
      .mockResolvedValueOnce({
        autoConfirm: true,
        includePrivate: true,
      })

    getWorkspaceDataMock
      .mockResolvedValueOnce({
        workspaceDir,
        packages: [
          {
            manifest: { name: 'skip-me' },
            rootDir: '/repo/packages/skip-me',
            rootDirRealPath: '/repo/packages/skip-me',
            pkgJsonPath: '/repo/packages/skip-me/package.json',
          },
          {
            manifest: { name: 'keep-me' },
            rootDir: '/repo/packages/keep-me',
            rootDirRealPath: '/repo/packages/keep-me',
            pkgJsonPath: '/repo/packages/keep-me/package.json',
          },
          {
            manifest: {},
            rootDir: '/repo/packages/unnamed',
            rootDirRealPath: '/repo/packages/unnamed',
            pkgJsonPath: '/repo/packages/unnamed/package.json',
          },
        ],
      })
      .mockResolvedValueOnce({
        workspaceDir,
        packages: [
          {
            manifest: { name: 'pkg-a' },
            rootDir: '/repo/packages/a',
            rootDirRealPath: '/repo/packages/a',
            pkgJsonPath: '/repo/packages/a/package.json',
          },
          {
            manifest: { name: 'pkg-b' },
            rootDir: '/repo/packages/b',
            rootDirRealPath: '/repo/packages/b',
            pkgJsonPath: '/repo/packages/b/package.json',
          },
        ],
      })

    checkboxMock.mockResolvedValue(['/repo/packages/keep-me'])
    pathExistsMock
      .mockResolvedValueOnce(true) // selected package exists
      .mockResolvedValueOnce(true) // root package.json exists
      .mockResolvedValue(true) // remaining calls default to true
    removeMock.mockResolvedValue(undefined)
    readJsonMock.mockResolvedValue(rootPackageJson)
    outputJsonMock.mockResolvedValue(undefined)

    const { cleanProjects } = await import('@/commands/clean')

    await cleanProjects(workspaceDir)

    expect(checkboxMock).toHaveBeenCalled()
    expect(removeMock).toHaveBeenCalledWith('/repo/packages/keep-me')
    expect(readJsonMock).toHaveBeenCalledWith('/repo/package.json')
    expect(outputJsonMock).toHaveBeenCalledWith('/repo/package.json', {
      devDependencies: {
        '@icebreakers/monorepo': '1.2.3',
      },
    }, { spaces: 2 })

    checkboxMock.mockClear()
    removeMock.mockClear()
    pathExistsMock.mockReset()
    pathExistsMock.mockResolvedValue(false)
    readJsonMock.mockResolvedValue({ devDependencies: {} })

    await cleanProjects(workspaceDir)

    expect(checkboxMock).not.toHaveBeenCalled()
    expect(removeMock).not.toHaveBeenCalled()
    expect(outputJsonMock).toHaveBeenCalledWith('/repo/package.json', {
      devDependencies: {
        '@icebreakers/monorepo': 'latest',
      },
    }, { spaces: 2 })
  })
})
