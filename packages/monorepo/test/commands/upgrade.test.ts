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
    const checkboxMock = vi.fn(async () => [])
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-license-')

    await vi.resetModules()
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    const { upgradeMonorepo } = await import('@/commands/upgrade')

    await upgradeMonorepo({ outDir })
    const licensePath = path.join(outDir, 'LICENSE')
    expect(await fs.pathExists(licensePath)).toBe(true)

    await fs.writeFile(licensePath, '# custom license\n', 'utf8')
    await upgradeMonorepo({ outDir })

    const content = await fs.readFile(licensePath, 'utf8')
    expect(content).toBe('# custom license\n')
    expect(checkboxMock).not.toHaveBeenCalled()

    await fs.remove(root)
  })

  it('honors skipOverwrite for existing files', async () => {
    const checkboxMock = vi.fn(async () => [])
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-skip-')

    await vi.resetModules()
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    const { upgradeMonorepo } = await import('@/commands/upgrade')
    await upgradeMonorepo({ outDir })
    const targetFile = path.join(outDir, 'netlify.toml')
    await fs.writeFile(targetFile, '# custom configuration\n')
    await upgradeMonorepo({ outDir, skipOverwrite: true })
    const content = await fs.readFile(targetFile, 'utf8')
    expect(content).toBe('# custom configuration\n')

    expect(checkboxMock).not.toHaveBeenCalled()
    await fs.remove(root)
  })

  it.skipIf(CI.isCI)('prompts when contents differ and rewrites selected files', async () => {
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-rewrite-')
    const targetFile = path.join(outDir, 'netlify.toml')
    const checkboxMock = vi.fn(async (options: { choices?: Array<{ value: string }> }) => {
      const choices = Array.isArray(options?.choices) ? options.choices : []
      const match = choices.find(item => item.value === targetFile)
      return match ? [match.value] : []
    })

    await vi.resetModules()
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    const { assetsDir } = await import('@/constants')
    const reference = await fs.readFile(path.join(assetsDir, 'netlify.toml'), 'utf8')
    const { upgradeMonorepo } = await import('@/commands/upgrade')

    await upgradeMonorepo({ outDir })
    await fs.writeFile(targetFile, '# drifted\n')
    await upgradeMonorepo({ outDir })
    expect(checkboxMock).toHaveBeenCalledTimes(1)
    const rewritten = await fs.readFile(targetFile, 'utf8')
    expect(rewritten).toBe(reference)

    await upgradeMonorepo({ outDir })
    expect(checkboxMock).toHaveBeenCalledTimes(1)

    await fs.remove(root)
  })

  it.skipIf(CI.isCI)('supports interactive selection and updates changeset repo', async () => {
    const checkboxMock = vi.fn(async (options: { message?: string, choices?: Array<{ value: string }> }) => {
      if (options?.message === '选择你需要的文件') {
        return ['.changeset']
      }
      const choices = Array.isArray(options?.choices) ? options.choices : []
      const first = choices[0]
      return first ? [first.value] : []
    })
    class GitClientMock {
      async getRepoName() {
        return 'ice/awesome'
      }
    }
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-interactive-')

    await vi.resetModules()
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    vi.doMock('@/core/git', () => ({ GitClient: GitClientMock }))

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
    const checkboxMock = vi.fn(async (options: { choices?: Array<{ value: string }> }) => {
      const choices = Array.isArray(options?.choices) ? options.choices : []
      const match = choices.find(item => typeof item.value === 'string' && item.value.endsWith('package.json'))
      return match ? [match.value] : []
    })
    const { root, outDir } = await createTempOutDir('monorepo-upgrade-package-')
    const packagePath = path.join(outDir, 'package.json')
    await fs.writeJSON(packagePath, {
      name: 'demo-package',
      scripts: {
        test: 'vitest',
      },
    }, { spaces: 2 })

    await vi.resetModules()
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))

    const { upgradeMonorepo } = await import('@/commands/upgrade')
    await upgradeMonorepo({ outDir })

    const pkg = await fs.readJSON(packagePath)
    expect(pkg.scripts.commitlint).toBe('commitlint --edit')
    expect(checkboxMock).toHaveBeenCalled()

    await fs.remove(root)
  })
})
