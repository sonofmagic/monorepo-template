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
    await fs.ensureDir(path.join(workspaceDir, 'tooling'))
    await fs.writeFile(path.join(workspaceDir, 'tooling/load-tooling-module.mjs'), 'export async function loadRepoctlToolingModule() {}\n')
    await fs.writeFile(path.join(workspaceDir, 'tooling/ensure-tooling-built.mjs'), 'export async function ensureToolingBuilt() {}\n')

    const { runDoctor } = await import('@/commands/doctor')
    const report = await runDoctor(pkgDir)
    const normalizedWorkspaceDir = await realpath(workspaceDir)

    expect(report.workspaceDir).toBe(normalizedWorkspaceDir)
    expect(report.packageCount).toBe(1)
    expect(report.summary).toEqual({
      pass: 8,
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
      pass: 2,
      warn: 3,
      fail: 3,
    })
    expect(report.checks.find(check => check.id === 'node-version')?.status).toBe('fail')
    expect(report.checks.find(check => check.id === 'tool-package')?.status).toBe('fail')
    expect(report.checks.find(check => check.id === 'root-scripts')?.detail).toContain('new, check, doctor')
    expect(report.checks.find(check => check.id === 'config-file')?.status).toBe('fail')
    expect(report.checks.find(check => check.id === 'commit-hooks')?.status).toBe('warn')
    expect(report.checks.find(check => check.id === 'tooling-loader')?.status).toBe('warn')

    await fs.remove(workspaceDir)
  })
})
