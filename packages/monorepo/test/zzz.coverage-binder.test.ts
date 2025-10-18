import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { describe, expect, it, vi } from 'vitest'

describe('coverage binder', () => {
  it('executes vitest setup paths', async () => {
    await vi.resetModules()
    const pathExistsMock = vi.fn()
    const prepareAssetsMock = vi.fn(async () => {})

    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: { pathExists: pathExistsMock },
      pathExists: pathExistsMock,
    }))
    vi.doMock('../scripts/prepublish', () => ({
      prepareAssets: prepareAssetsMock,
    }))

    pathExistsMock.mockResolvedValueOnce(false)
    await import('../vitest.setup')
    expect(prepareAssetsMock).toHaveBeenCalledWith({ silent: true })

    pathExistsMock.mockResolvedValueOnce(true)
    await import('../vitest.setup')
  })

  it('executes getTemplateTargets helper', async () => {
    await vi.resetModules()
    const rawMock = vi.fn(async () => 'README.md\npackage.json\n')
    vi.doMock('simple-git', () => ({
      simpleGit: vi.fn(() => ({ raw: rawMock })),
    }))

    const { getTemplateTargets } = await import('../scripts/getTemplateTargets')
    const targets = await getTemplateTargets()
    expect(targets).toEqual(expect.arrayContaining(['README.md', 'package.json']))
  })

  it('executes prepublish script workflow', async () => {
    await vi.resetModules()
    const ensureDirMock = vi.fn(async () => {})
    const copyMock = vi.fn(async () => {})
    const pathExistsMock = vi.fn(async () => true)
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
    vi.doMock('../src/constants', () => ({
      assetsDir: '/assets',
      rootDir: '/repo',
      templatesDir: '/templates',
    }))
    vi.doMock('../src/commands/upgrade/targets', () => ({
      getAssetTargets: () => ['docs/.gitignore'],
    }))
    vi.doMock('./getTemplateTargets', () => ({
      getTemplateTargets: async () => ['packages/template/gitignore'],
    }))
    const successMock = vi.fn()
    vi.doMock('../src/core/logger', () => ({
      logger: {
        success: successMock,
        error: vi.fn(),
      },
    }))

    const { prepareAssets } = await import('../scripts/prepublish')
    await prepareAssets()
    vi.unmock('../src/commands/upgrade/targets')
    vi.unmock('../src/core/logger')
    vi.unmock('@/commands/upgrade/targets')
    vi.unmock('@/core/logger')
  })

  it('executes create command primary flow', async () => {
    await vi.resetModules()
    const ensureDirMock = vi.fn(async () => {})
    const readdirMock = vi.fn(async () => ['package.json', 'README.md', '.DS_Store'])
    const copyMock = vi.fn(async (_from: string, _to: string, options?: { filter?: (src: string) => boolean }) => {
      if (options?.filter) {
        options.filter(path.join(_from, '.DS_Store'))
        options.filter(path.join(_from, 'README.md'))
      }
    })
    const pathExistsMock = vi.fn(async () => false)
    const readJsonMock = vi.fn(async () => ({ name: 'template', version: '1.0.0' }))
    const outputJsonMock = vi.fn(async () => {})

    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        ensureDir: ensureDirMock,
        readdir: readdirMock,
        copy: copyMock,
        pathExists: pathExistsMock,
        readJson: readJsonMock,
        outputJson: outputJsonMock,
      },
      ensureDir: ensureDirMock,
      readdir: readdirMock,
      copy: copyMock,
      pathExists: pathExistsMock,
      readJson: readJsonMock,
      outputJson: outputJsonMock,
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: vi.fn(async () => ({
        renameJson: true,
        name: 'my-app',
        templatesDir: './templates',
        templateMap: { custom: 'custom/path' },
        defaultTemplate: 'custom',
      })),
    }))
    const successMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        success: successMock,
      },
    }))

    const { createNewProject } = await import('@/commands/create')
    await createNewProject({ cwd: '/repo', type: 'custom' })
    expect(readdirMock).toHaveBeenCalled()
    expect(copyMock).toHaveBeenCalled()
    expect(outputJsonMock).toHaveBeenCalledWith(path.join('/repo', 'my-app', 'package.mock.json'), expect.any(Object), { spaces: 2 })
    expect(successMock).toHaveBeenCalled()
  })

  it('executes upgrade targets helper', async () => {
    await vi.resetModules()
    const { getAssetTargets } = await vi.importActual<typeof import('@/commands/upgrade/targets')>('@/commands/upgrade/targets')
    const targets = getAssetTargets()
    expect(targets).toContain('.changeset')
  })

  it('executes core config helpers', async () => {
    await vi.resetModules()
    const { loadMonorepoConfig, resolveCommandConfig, defineMonorepoConfig } = await vi.importActual<typeof import('@/core/config')>('@/core/config')
    defineMonorepoConfig({ commands: { sync: { concurrency: 3 } } })
    const tempDir = await mkdtemp(path.join(tmpdir(), 'monorepo-config-'))
    const config = await loadMonorepoConfig(tempDir)
    expect(config.commands?.clean).toBeUndefined()
    // second call should hit cache
    await loadMonorepoConfig(tempDir)
    expect(await resolveCommandConfig('sync', tempDir)).toEqual({})
    expect(await resolveCommandConfig('mirror', tempDir)).toEqual({})
  })

  it('executes utility helpers', async () => {
    const fsModule = await import('@/utils/fs')
    expect(fsModule.isIgnorableFsError({ code: 'ENOENT' } as NodeJS.ErrnoException)).toBe(true)
    expect(fsModule.isIgnorableFsError({ code: 'EPERM' } as NodeJS.ErrnoException)).toBe(false)

    const gitignoreModule = await import('@/utils/gitignore')
    expect(gitignoreModule.toPublishGitignorePath('.gitignore')).toBe('gitignore')
    expect(gitignoreModule.toWorkspaceGitignorePath('gitignore')).toBe('.gitignore')
    expect(gitignoreModule.isGitignoreFile('README.md')).toBe(false)

    const hashModule = await import('@/utils/hash')
    await hashModule.isFileChanged('a', 'b')

    const regexpModule = await import('@/utils/regexp')
    expect(regexpModule.escapeStringRegexp('a+b')).toBe('a\\+b')
    expect(regexpModule.isMatch('packages/a', [/^packages\//])).toBe(true)
  })
})
