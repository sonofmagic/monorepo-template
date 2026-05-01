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
})
