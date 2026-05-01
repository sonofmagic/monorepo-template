import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'

const roots = new Set<string>()

afterEach(async () => {
  await vi.resetModules()
  await Promise.all([...roots].map(root => rm(root, { recursive: true, force: true })))
  roots.clear()
})

async function createTempWorkspace(prefix: string) {
  const root = await mkdtemp(path.join(tmpdir(), prefix))
  roots.add(root)
  return root
}

describe('inspectMonorepoConfig', () => {
  it('reports an empty config when no config file exists', async () => {
    const root = await createTempWorkspace('repo-config-empty-')
    const { inspectMonorepoConfig } = await import('@/commands/config')

    await expect(inspectMonorepoConfig(root)).resolves.toEqual({
      cwd: root,
      file: null,
      config: {},
    })
  })

  it('reports the loaded config file and parsed config', async () => {
    const root = await createTempWorkspace('repo-config-inspect-')
    await writeFile(
      path.join(root, 'repoctl.config.mjs'),
      `export default { commands: { clean: { autoConfirm: true } }, tooling: { vitest: { includeWorkspaceRootConfig: false } } }\n`,
    )

    const { inspectMonorepoConfig } = await import('@/commands/config')
    const inspection = await inspectMonorepoConfig(root)

    expect(inspection.file).toBe(await realpath(path.join(root, 'repoctl.config.mjs')))
    expect(inspection.config).toEqual({
      commands: {
        clean: {
          autoConfirm: true,
        },
      },
      tooling: {
        vitest: {
          includeWorkspaceRootConfig: false,
        },
      },
    })
  })
})
