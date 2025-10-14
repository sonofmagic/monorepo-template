import { tmpdir } from 'node:os'
import CI from 'ci-info'
import fs from 'fs-extra'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'

async function createTempOutDir(slug: string) {
  const root = await fs.mkdtemp(path.join(tmpdir(), slug))
  const outDir = path.join(root, 'workspace')
  await fs.ensureDir(outDir)
  return { root, outDir }
}

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

describe('upgradeMonorepo overwrite logic', () => {
  it('skips overwriting LICENSE when already present', async () => {
    const confirmMock = vi.fn(async () => true)
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-license-')

    await vi.resetModules()
    vi.doMock('@inquirer/confirm', () => ({ default: confirmMock }))
    const { upgradeMonorepo } = await import('@/commands/upgrade')

    await upgradeMonorepo({ outDir })
    const licensePath = path.join(outDir, 'LICENSE')
    expect(await fs.pathExists(licensePath)).toBe(true)

    await fs.writeFile(licensePath, '# custom license\n', 'utf8')
    await upgradeMonorepo({ outDir })

    const content = await fs.readFile(licensePath, 'utf8')
    expect(content).toBe('# custom license\n')
    expect(confirmMock).not.toHaveBeenCalled()

    await fs.remove(root)
  })

  it('honors skipOverwrite for existing files', async () => {
    const confirmMock = vi.fn(async () => true)
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-skip-')

    await vi.resetModules()
    vi.doMock('@inquirer/confirm', () => ({ default: confirmMock }))
    const { upgradeMonorepo } = await import('@/commands/upgrade')
    await upgradeMonorepo({ outDir })
    const targetFile = path.join(outDir, 'netlify.toml')
    await fs.writeFile(targetFile, '# custom configuration\n')
    await upgradeMonorepo({ outDir, skipOverwrite: true })
    const content = await fs.readFile(targetFile, 'utf8')
    expect(content).toBe('# custom configuration\n')

    expect(confirmMock).not.toHaveBeenCalled()
    await fs.remove(root)
  })

  it.skipIf(CI.isCI)('prompts when contents differ and rewrites on approval', async () => {
    const confirmMock = vi.fn(async () => true)
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-rewrite-')

    await vi.resetModules()
    vi.doMock('@inquirer/confirm', () => ({ default: confirmMock }))
    const { assetsDir } = await import('@/constants')
    const reference = await fs.readFile(path.join(assetsDir, 'netlify.toml'), 'utf8')
    const { upgradeMonorepo } = await import('@/commands/upgrade')

    await upgradeMonorepo({ outDir })
    const targetFile = path.join(outDir, 'netlify.toml')
    await fs.writeFile(targetFile, '# drifted\n')
    await upgradeMonorepo({ outDir })
    expect(confirmMock).toHaveBeenCalledTimes(1)
    const rewritten = await fs.readFile(targetFile, 'utf8')
    expect(rewritten).toBe(reference)

    await upgradeMonorepo({ outDir })
    expect(confirmMock).toHaveBeenCalledTimes(1)

    await fs.remove(root)
  })

  it.skipIf(CI.isCI)('supports interactive selection and updates changeset repo', async () => {
    const confirmMock = vi.fn(async () => true)
    const checkboxMock = vi.fn(async () => ['.changeset'])
    const gitClientMock = vi.fn(() => ({ getRepoName: vi.fn(async () => 'ice/awesome') }))
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-interactive-')

    await vi.resetModules()
    vi.doMock('@inquirer/confirm', () => ({ default: confirmMock }))
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    vi.doMock('@/core/git', () => ({ GitClient: gitClientMock }))

    const { upgradeMonorepo } = await import('@/commands/upgrade')
    await upgradeMonorepo({ outDir, interactive: true })

    const configPath = path.join(outDir, '.changeset/config.json')
    expect(await fs.pathExists(configPath)).toBe(true)
    const config = await fs.readJSON(configPath)
    expect(config.changelog[1].repo).toBe('ice/awesome')
    expect(checkboxMock).toHaveBeenCalled()

    await fs.remove(root)
  })

  it.skipIf(CI.isCI)('merges package.json content when it already exists', async () => {
    const confirmMock = vi.fn(async () => true)
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-package-')
    const packagePath = path.join(outDir, 'package.json')
    await fs.writeJSON(packagePath, {
      name: 'demo-package',
      scripts: {
        test: 'vitest',
      },
    }, { spaces: 2 })

    await vi.resetModules()
    vi.doMock('@inquirer/confirm', () => ({ default: confirmMock }))

    const { upgradeMonorepo } = await import('@/commands/upgrade')
    await upgradeMonorepo({ outDir })

    const pkg = await fs.readJSON(packagePath)
    expect(pkg.scripts.commitlint).toBe('commitlint --edit')
    expect(confirmMock).toHaveBeenCalled()

    await fs.remove(root)
  })
})
