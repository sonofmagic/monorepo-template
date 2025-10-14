import { tmpdir } from 'node:os'
import { isCI } from 'ci-info'
import fs from 'fs-extra'
import path from 'pathe'
import { describe, expect, it, vi } from 'vitest'

import { createNewProject } from '@/commands/create'

const templatesRoot = path.resolve(__dirname, '../templates')

function writeConfig(dir: string, content: string) {
  return fs.writeFile(path.join(dir, 'monorepo.config.ts'), content, 'utf8')
}

describe('monorepo config integration', () => {
  it.skipIf(isCI)('overrides create command defaults', async () => {
    await vi.resetModules()
    const root = await fs.mkdtemp(path.join(tmpdir(), 'monorepo-config-create-'))
    await writeConfig(
      root,
      `import path from 'node:path'\nimport { defineMonorepoConfig } from '@icebreakers/monorepo'\n\nexport default defineMonorepoConfig({\n  commands: {\n    create: {\n      defaultTemplate: 'cli',\n      renameJson: true,\n      templatesDir: ${JSON.stringify(path.relative(root, templatesRoot))},\n    },\n  },\n})\n`,
    )

    const targetDir = path.join(root, 'demo-app')
    await createNewProject({
      cwd: root,
      name: 'demo-app',
    })

    expect(await fs.pathExists(path.join(targetDir, 'package.mock.json'))).toBe(true)

    await fs.remove(root)
  })

  it.skipIf(isCI)('allows clean command to run without prompt via config', async () => {
    await vi.resetModules()
    const root = await fs.mkdtemp(path.join(tmpdir(), 'monorepo-config-clean-'))
    const workspaceDir = path.join(root, 'workspace')
    const packagesDir = path.join(workspaceDir, 'packages')
    const fooDir = path.join(packagesDir, 'foo')

    await fs.ensureDir(fooDir)
    await fs.ensureDir(packagesDir)
    await fs.ensureDir(workspaceDir)
    await fs.writeJson(path.join(workspaceDir, 'package.json'), {
      devDependencies: {
        '@icebreakers/monorepo': 'latest',
      },
    }, { spaces: 2 })

    await writeConfig(
      workspaceDir,
      `import { defineMonorepoConfig } from '@icebreakers/monorepo'\n\nexport default defineMonorepoConfig({\n  commands: {\n    clean: {\n      autoConfirm: true,\n    },\n  },\n})\n`,
    )

    const checkboxMock = vi.fn()
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    vi.doMock('@/core/workspace', () => ({
      getWorkspaceData: vi.fn(async () => ({
        packages: [
          {
            manifest: { name: 'foo' },
            rootDir: fooDir,
            rootDirRealPath: fooDir,
            pkgJsonPath: path.join(fooDir, 'package.json'),
          },
        ],
        workspaceDir,
      })),
    }))

    const { cleanProjects: mockedClean } = await import('@/commands/clean')
    await mockedClean(workspaceDir)

    expect(checkboxMock).not.toHaveBeenCalled()
    expect(await fs.pathExists(fooDir)).toBe(false)

    await vi.resetModules()
    await fs.remove(root)
  })
})
