import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it } from 'vitest'

const roots = new Set<string>()

afterEach(async () => {
  await Promise.all([...roots].map(root => rm(root, { recursive: true, force: true })))
  roots.clear()
})

async function createWorkspace() {
  const root = await mkdtemp(path.join(tmpdir(), 'repo-env-info-'))
  roots.add(root)
  await writeFile(path.join(root, 'package.json'), JSON.stringify({
    name: 'repo-env-info',
    private: true,
    packageManager: 'pnpm@10.0.0',
    engines: {
      node: '>=20.0.0',
    },
  }, null, 2))
  await writeFile(path.join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')

  const packageDir = path.join(root, 'packages/a')
  await mkdir(packageDir, { recursive: true })
  await writeFile(path.join(packageDir, 'package.json'), JSON.stringify({
    name: 'pkg-a',
    private: true,
  }, null, 2))

  return root
}

describe('collectEnvInfo', () => {
  it('collects package manager, node, pnpm, and workspace package counts', async () => {
    const root = await createWorkspace()
    const normalizedRoot = await realpath(root)
    const { collectEnvInfo } = await import('@/commands/env')
    const info = await collectEnvInfo(root)

    expect(info).toEqual(expect.objectContaining({
      cwd: root,
      workspaceDir: normalizedRoot,
      packageManager: 'pnpm@10.0.0',
      nodeVersion: process.version,
      nodeRange: '>=20.0.0',
      packageCount: 1,
    }))
    expect(info.platform).toBeTruthy()
    expect(info.arch).toBeTruthy()
  })

  it('collects an environment snapshot with doctor and check plan data', async () => {
    const root = await createWorkspace()
    const { collectEnvSnapshot } = await import('@/commands/env')
    const snapshot = await collectEnvSnapshot(root, new Date('2026-05-01T12:00:00.000Z'))

    expect(snapshot.generatedAt).toBe('2026-05-01T12:00:00.000Z')
    expect(snapshot.env.packageManager).toBe('pnpm@10.0.0')
    expect(snapshot.doctor.summary.fail).toBeGreaterThanOrEqual(0)
    expect(snapshot.checkPlan).toEqual(expect.objectContaining({
      mode: 'default',
      commands: [
        expect.objectContaining({
          command: 'repo verify pre-commit',
        }),
      ],
    }))
  })

  it('collects key workspace paths and report targets', async () => {
    const root = await createWorkspace()
    await writeFile(path.join(root, 'repoctl.config.mjs'), 'export default {}\n')

    const { collectEnvPaths } = await import('@/commands/env')
    const paths = await collectEnvPaths(path.join(root, 'packages/a'))

    expect(paths.workspaceDir).toBe(await realpath(root))
    expect(paths.paths.packageJson).toEqual(expect.objectContaining({
      relativePath: 'package.json',
      exists: true,
    }))
    expect(paths.paths.workspaceManifest.exists).toBe(true)
    expect(paths.paths.repoctlConfig.exists).toBe(false)
    expect(paths.paths.repoctlConfigs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        relativePath: 'repoctl.config.mjs',
        exists: true,
      }),
    ]))
    expect(paths.paths.legacyConfig.exists).toBe(false)
    expect(paths.paths.snapshotReport).toEqual(expect.objectContaining({
      relativePath: 'reports/snapshot.json',
      exists: false,
    }))
  })

  it('collects a support bundle with environment, paths, config, doctor, and check data', async () => {
    const root = await createWorkspace()
    await writeFile(path.join(root, 'repoctl.config.mjs'), 'export default { commands: { clean: { autoConfirm: true } } }\n')

    const { collectEnvSupportBundle } = await import('@/commands/env')
    const bundle = await collectEnvSupportBundle(root, new Date('2026-05-01T12:00:00.000Z'))

    expect(bundle.generatedAt).toBe('2026-05-01T12:00:00.000Z')
    expect(bundle.env.packageManager).toBe('pnpm@10.0.0')
    expect(bundle.paths.paths.packageJson.exists).toBe(true)
    expect(bundle.config.config.commands?.clean?.autoConfirm).toBe(true)
    expect(bundle.doctor.summary.fail).toBeGreaterThanOrEqual(0)
    expect(bundle.checkPlan.mode).toBe('default')
  })
})
