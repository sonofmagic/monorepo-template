import { realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import fs from '@/utils/fs'

async function createTempWorkspace(prefix: string) {
  return fs.mkdtemp(path.join(tmpdir(), prefix))
}

describe('runDoctor', () => {
  it('reports a healthy workspace with the recommended quick scripts', async () => {
    const workspaceDir = await createTempWorkspace('monorepo-doctor-pass-')
    const pkgDir = path.join(workspaceDir, 'packages/demo')

    await fs.ensureDir(pkgDir)
    await fs.ensureDir(path.join(workspaceDir, '.husky'))
    await fs.writeFile(path.join(workspaceDir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
    await fs.writeJSON(path.join(workspaceDir, 'package.json'), {
      name: 'demo-workspace',
      engines: { node: '>=0' },
      devDependencies: {
        repoctl: '^3.0.0',
      },
      scripts: {
        setup: 'repo setup',
        new: 'repo new',
        check: 'repo check',
        doctor: 'repo doctor',
      },
    }, { spaces: 2 })
    await fs.writeJSON(path.join(pkgDir, 'package.json'), {
      name: '@demo/app',
      version: '0.0.0',
    }, { spaces: 2 })
    await fs.writeFile(path.join(workspaceDir, 'repoctl.config.ts'), 'export default {}\n')
    await fs.writeFile(path.join(workspaceDir, '.husky/pre-commit'), 'pnpm exec lint-staged\n')
    await fs.writeFile(path.join(workspaceDir, 'lint-staged.config.js'), 'export default {}\n')

    const { runDoctor } = await import('@/commands/doctor')
    const report = await runDoctor(pkgDir)
    const normalizedWorkspaceDir = await realpath(workspaceDir)

    expect(report.workspaceDir).toBe(normalizedWorkspaceDir)
    expect(report.packageCount).toBe(1)
    expect(report.summary).toEqual({
      pass: 10,
      warn: 0,
      fail: 0,
    })
    expect(report.checks.find(check => check.id === 'workspace-patterns')?.status).toBe('pass')
    expect(report.checks.find(check => check.id === 'tool-package')?.detail).toContain('repoctl@^3.0.0')
    expect(report.checks.find(check => check.id === 'root-scripts')?.detail).toContain('pnpm doctor')

    await fs.remove(workspaceDir)
  })

  it('reports zero warnings after setup-style workspace patterns are present', async () => {
    const workspaceDir = await createTempWorkspace('monorepo-doctor-clean-')
    const pkgDir = path.join(workspaceDir, 'packages/demo')

    await fs.ensureDir(pkgDir)
    await fs.ensureDir(path.join(workspaceDir, '.husky'))
    await fs.writeFile(path.join(workspaceDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n  - packages/*\n  - examples/*\n')
    await fs.writeJSON(path.join(workspaceDir, 'package.json'), {
      name: 'demo-workspace',
      engines: { node: '>=0' },
      devDependencies: {
        repoctl: '^3.0.0',
      },
      scripts: {
        setup: 'repo setup',
        new: 'repo new',
        check: 'repo check',
        doctor: 'repo doctor',
      },
    }, { spaces: 2 })
    await fs.writeJSON(path.join(pkgDir, 'package.json'), {
      name: '@demo/app',
      version: '0.0.0',
    }, { spaces: 2 })
    await fs.writeFile(path.join(workspaceDir, 'repoctl.config.ts'), 'export default {}\n')
    await fs.writeFile(path.join(workspaceDir, '.husky/pre-commit'), 'pnpm exec lint-staged\n')
    await fs.writeFile(path.join(workspaceDir, 'lint-staged.config.js'), 'export default {}\n')

    const { runDoctor } = await import('@/commands/doctor')
    const report = await runDoctor(pkgDir)

    expect(report.summary).toEqual({
      pass: 10,
      warn: 0,
      fail: 0,
    })
    expect(report.checks.find(check => check.id === 'tool-package')?.detail).toContain('repoctl@^3.0.0')
    expect(report.checks.find(check => check.id === 'root-scripts')?.detail).toContain('pnpm doctor')

    await fs.remove(workspaceDir)
  })

  it('flags blocking issues and partial onboarding state', async () => {
    const workspaceDir = await createTempWorkspace('monorepo-doctor-fail-')

    await fs.ensureDir(path.join(workspaceDir, '.husky'))
    await fs.writeFile(path.join(workspaceDir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
    await fs.writeJSON(path.join(workspaceDir, 'package.json'), {
      name: 'broken-workspace',
      engines: { node: '>=999.0.0' },
      scripts: {
        setup: 'repo setup',
      },
    }, { spaces: 2 })
    await fs.writeFile(path.join(workspaceDir, 'repoctl.config.ts'), 'export default {}\n')
    await fs.writeFile(path.join(workspaceDir, 'monorepo.config.ts'), 'export default {}\n')
    await fs.writeFile(path.join(workspaceDir, '.husky/pre-commit'), 'pnpm exec lint-staged\n')

    const { runDoctor } = await import('@/commands/doctor')
    const report = await runDoctor(workspaceDir)

    expect(report.summary).toEqual({
      pass: 5,
      warn: 2,
      fail: 3,
    })
    expect(report.checks.find(check => check.id === 'node-version')?.status).toBe('fail')
    expect(report.checks.find(check => check.id === 'tool-package')?.status).toBe('fail')
    expect(report.checks.find(check => check.id === 'root-scripts')?.detail).toContain('new, check, doctor')
    expect(report.checks.find(check => check.id === 'config-file')?.status).toBe('fail')
    expect(report.checks.find(check => check.id === 'commit-hooks')?.status).toBe('warn')
    expect(report.checks.find(check => check.id === 'tooling-imports')?.status).toBe('pass')

    await fs.remove(workspaceDir)
  })

  it('detects legacy local tooling loader imports', async () => {
    const workspaceDir = await createTempWorkspace('monorepo-doctor-legacy-tooling-')
    const appDir = path.join(workspaceDir, 'apps/web')

    await fs.ensureDir(appDir)
    await fs.writeFile(path.join(workspaceDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n  - packages/*\n  - examples/*\n')
    await fs.writeJSON(path.join(workspaceDir, 'package.json'), {
      name: 'demo-workspace',
      engines: { node: '>=0' },
      devDependencies: {
        repoctl: '^3.0.0',
      },
      scripts: {
        setup: 'repo setup',
        new: 'repo new',
        check: 'repo check',
        doctor: 'repo doctor',
      },
    }, { spaces: 2 })
    await fs.writeJSON(path.join(appDir, 'package.json'), { name: 'web' }, { spaces: 2 })
    await fs.writeFile(path.join(workspaceDir, 'repoctl.config.ts'), 'export default {}\n')
    await fs.writeFile(path.join(workspaceDir, 'lint-staged.config.js'), 'export default {}\n')
    await fs.ensureDir(path.join(workspaceDir, '.husky'))
    await fs.writeFile(path.join(workspaceDir, '.husky/pre-commit'), 'pnpm exec lint-staged\n')
    await fs.writeFile(path.join(appDir, 'eslint.config.js'), [
      'import { loadRepoctlToolingModule } from \'../../tooling/load-tooling-module.mjs\'',
      'const { defineEslintConfig } = await loadRepoctlToolingModule()',
      'export default await defineEslintConfig()',
      '',
    ].join('\n'))

    const { runDoctor } = await import('@/commands/doctor')
    const report = await runDoctor(workspaceDir)
    const toolingCheck = report.checks.find(check => check.id === 'tooling-imports')

    expect(toolingCheck?.status).toBe('warn')
    expect(toolingCheck?.fix).toBe('运行 repo upgrade --yes 迁移为直接 import repoctl/tooling。')

    await fs.remove(workspaceDir)
  })
})
