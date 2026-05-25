import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { updateRootPackageJson } from './package-json'

describe('updateRootPackageJson', () => {
  it('keeps repoctl as an installable root dependency for generated projects', async () => {
    const targetDir = await mkdtemp(path.join(tmpdir(), 'create-repoctl-package-json-'))

    try {
      await mkdir(targetDir, { recursive: true })
      await writeFile(path.join(targetDir, 'package.json'), `${JSON.stringify({
        name: 'monorepo-template',
        scripts: {
          'check': 'repo check',
          'repo:init': 'repo init',
          'tooling:build': 'turbo run build --filter=@icebreakers/monorepo --filter=repoctl',
        },
        devDependencies: {
          '@icebreakers/monorepo': 'workspace:*',
          'repoctl': 'workspace:*',
          'turbo': '^2.9.14',
        },
      }, null, 2)}\n`)

      await updateRootPackageJson(targetDir, 'demo-repo')

      const pkg = JSON.parse(await readFile(path.join(targetDir, 'package.json'), 'utf8')) as {
        name?: string
        scripts?: Record<string, string>
        devDependencies?: Record<string, string>
      }

      expect(pkg.name).toBe('demo-repo')
      expect(pkg.scripts).toEqual({
        'check': 'repo check',
        'repo:init': 'repo init',
      })
      expect(pkg.devDependencies).toMatchObject({
        repoctl: 'latest',
        turbo: '^2.9.14',
      })
      expect(pkg.devDependencies?.['@icebreakers/monorepo']).toBeUndefined()
    }
    finally {
      await rm(targetDir, { force: true, recursive: true })
    }
  })
})
