import { tmpdir } from 'node:os'
import fs from 'fs-extra'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import setChangeset from '@/commands/init/setChangeset'
import setPkgJson from '@/commands/init/setPkgJson'
import setReadme from '@/commands/init/setReadme'

afterEach(async () => {
  vi.resetAllMocks()
  await vi.resetModules()
})

describe('cleanProjects', () => {
  it('removes packages and resets devDependency', async () => {
    const tmpRoot = await fs.mkdtemp(path.join(tmpdir(), 'monorepo-clean-'))
    const workspaceDir = path.join(tmpRoot, 'workspace')
    const packagesDir = path.join(workspaceDir, 'packages')
    const pkgFooDir = path.join(packagesDir, 'foo')
    const pkgBarDir = path.join(packagesDir, 'bar')

    await fs.ensureDir(pkgFooDir)
    await fs.ensureDir(pkgBarDir)
    await fs.writeJSON(path.join(workspaceDir, 'package.json'), {
      devDependencies: {
        '@icebreakers/monorepo': '^0.1.0',
      },
    }, { spaces: 2 })

    const packages = [
      {
        manifest: { name: 'foo' },
        rootDir: pkgFooDir,
        rootDirRealPath: pkgFooDir,
        pkgJsonPath: path.join(pkgFooDir, 'package.json'),
      },
      {
        manifest: { name: 'bar' },
        rootDir: pkgBarDir,
        rootDirRealPath: pkgBarDir,
        pkgJsonPath: path.join(pkgBarDir, 'package.json'),
      },
    ]

    for (const pkg of packages) {
      await fs.writeJSON(pkg.pkgJsonPath, { name: pkg.manifest.name }, { spaces: 2 })
    }

    const checkboxMock = vi.fn(async () => packages.map(pkg => pkg.rootDir))
    await vi.resetModules()
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    vi.doMock('@/core/workspace', () => ({
      getWorkspaceData: vi.fn(async () => ({ packages, workspaceDir })),
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: vi.fn(async () => ({})),
    }))

    const { cleanProjects } = await import('@/commands/clean')
    await cleanProjects(workspaceDir)

    expect(await fs.pathExists(pkgFooDir)).toBe(false)
    expect(await fs.pathExists(pkgBarDir)).toBe(false)

    const rootPkg = await fs.readJSON(path.join(workspaceDir, 'package.json'))
    expect(rootPkg.devDependencies['@icebreakers/monorepo']).toBe('latest')

    await fs.remove(tmpRoot)
  })
})

describe('init helpers', () => {
  it('updates metadata across workspace artifacts', async () => {
    const tmpRoot = await fs.mkdtemp(path.join(tmpdir(), 'monorepo-init-'))
    const workspaceDir = path.join(tmpRoot, 'workspace')
    const packagesDir = path.join(workspaceDir, 'packages')
    const pkgAlphaDir = path.join(packagesDir, 'alpha')
    const pkgBetaDir = path.join(packagesDir, 'beta')

    await fs.ensureDir(pkgAlphaDir)
    await fs.ensureDir(pkgBetaDir)
    await fs.ensureDir(path.join(workspaceDir, '.changeset'))

    await fs.writeJSON(path.join(pkgAlphaDir, 'package.json'), {
      name: 'pkg-alpha',
      version: '0.0.0',
      description: 'Alpha package',
    }, { spaces: 2 })
    await fs.writeJSON(path.join(pkgBetaDir, 'package.json'), {
      name: 'pkg-beta',
      version: '0.0.0',
    }, { spaces: 2 })

    await fs.writeFile(path.join(workspaceDir, '.changeset/config.json'), JSON.stringify({
      changelog: ['@changesets/changelog-github', { repo: '' }],
    }, null, 2))
    const workspaceFilepath = path.join(workspaceDir, 'pnpm-workspace.yaml')
    await fs.writeFile(workspaceFilepath, 'packages:\n  - packages/*\n')

    const packages = [
      {
        manifest: await fs.readJSON(path.join(pkgBetaDir, 'package.json')),
        rootDir: pkgBetaDir,
        rootDirRealPath: pkgBetaDir,
        pkgJsonPath: path.join(pkgBetaDir, 'package.json'),
      },
      {
        manifest: await fs.readJSON(path.join(pkgAlphaDir, 'package.json')),
        rootDir: pkgAlphaDir,
        rootDirRealPath: pkgAlphaDir,
        pkgJsonPath: path.join(pkgAlphaDir, 'package.json'),
      },
    ]

    const ctx = {
      cwd: workspaceDir,
      git: {} as unknown,
      gitUrl: { full_name: 'ice/awesome', name: 'awesome' },
      gitUser: { name: 'Dev Example', email: 'dev@example.com' },
      packages,
      workspaceDir,
      workspaceFilepath,
      config: { commands: {} },
    } as const

    await setPkgJson(ctx)
    await setChangeset(ctx)
    await setReadme(ctx)

    const updatedAlpha = await fs.readJSON(path.join(pkgAlphaDir, 'package.json'))
    expect(updatedAlpha.author).toBe('Dev Example <dev@example.com>')
    expect(updatedAlpha.repository).toMatchObject({ directory: 'packages/alpha' })
    expect(updatedAlpha.bugs.url).toBe('https://github.com/ice/awesome/issues')

    const changeset = await fs.readJSON(path.join(workspaceDir, '.changeset/config.json'))
    expect(changeset.changelog[1].repo).toBe('ice/awesome')

    const readme = await fs.readFile(path.join(workspaceDir, 'README.md'), 'utf8')
    expect(readme).toMatch(/## Packages/)
    const alphaIndex = readme.indexOf('[pkg-alpha]')
    const betaIndex = readme.indexOf('[pkg-beta]')
    expect(alphaIndex).toBeLessThan(betaIndex)
    expect(readme).toMatch(/Dev Example <dev@example.com>/)

    await fs.remove(tmpRoot)
  })
})
