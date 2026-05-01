import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import process from 'node:process'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  process.exitCode = undefined
  await vi.resetModules()
  vi.resetAllMocks()
})

function mockProgram() {
  vi.doMock('@icebreakers/monorepo-templates', async () => {
    const actual = await vi.importActual<typeof import('@icebreakers/monorepo-templates')>('@icebreakers/monorepo-templates')
    return {
      ...actual,
      program: new actual.Command(),
    }
  })
}

function createSupportBundle(root: string) {
  return {
    generatedAt: '2026-05-02T12:00:00.000Z',
    env: {
      cwd: root,
      workspaceDir: root,
      packageManager: 'pnpm@10.0.0',
      nodeVersion: 'v22.0.0',
      pnpmVersion: '10.0.0',
      platform: 'darwin',
      arch: 'arm64',
      packageCount: 1,
    },
    paths: {
      cwd: root,
      workspaceDir: root,
      paths: {
        packageJson: { path: path.join(root, 'package.json'), relativePath: 'package.json', exists: true },
        workspaceManifest: { path: path.join(root, 'pnpm-workspace.yaml'), relativePath: 'pnpm-workspace.yaml', exists: true },
        repoctlConfig: { path: path.join(root, 'repoctl.config.ts'), relativePath: 'repoctl.config.ts', exists: true },
        repoctlConfigs: [{ path: path.join(root, 'repoctl.config.ts'), relativePath: 'repoctl.config.ts', exists: true }],
        legacyConfig: { path: path.join(root, 'monorepo.config.ts'), relativePath: 'monorepo.config.ts', exists: false },
        legacyConfigs: [{ path: path.join(root, 'monorepo.config.ts'), relativePath: 'monorepo.config.ts', exists: false }],
        toolingDir: { path: path.join(root, 'tooling'), relativePath: 'tooling', exists: true },
        reportsDir: { path: path.join(root, 'reports'), relativePath: 'reports', exists: false },
        doctorReport: { path: path.join(root, 'reports/doctor.json'), relativePath: 'reports/doctor.json', exists: false },
        envReport: { path: path.join(root, 'reports/env.json'), relativePath: 'reports/env.json', exists: false },
        snapshotReport: { path: path.join(root, 'reports/snapshot.json'), relativePath: 'reports/snapshot.json', exists: false },
        checkPlanReport: { path: path.join(root, 'reports/check-plan.json'), relativePath: 'reports/check-plan.json', exists: false },
      },
    },
    config: {
      cwd: root,
      file: path.join(root, 'repoctl.config.ts'),
      config: {},
    },
    doctor: {
      cwd: root,
      workspaceDir: root,
      packageCount: 1,
      checks: [
        {
          id: 'root-scripts',
          title: 'root scripts',
          status: 'warn',
          detail: `missing script in ${path.join(root, 'package.json')}`,
          fix: 'run repo upgrade',
        },
      ],
      summary: { pass: 1, warn: 1, fail: 0 },
    },
    checkPlan: {
      cwd: root,
      mode: 'default',
      commands: [
        {
          name: 'pre-commit',
          command: 'repo verify pre-commit',
          description: `check ${path.join(root, 'package.json')}`,
        },
      ],
    },
  }
}

describe('commander program env support command', () => {
  it('redacts local absolute paths from json support output', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-support-redact-'))
    const outFile = path.join(root, 'reports/support.json')
    const collectEnvSupportBundleMock = vi.fn(async () => createSupportBundle(root))

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvSupportBundle: collectEnvSupportBundleMock,
      }))
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: vi.fn(),
          success: vi.fn(),
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'env', 'support', '--json', '--redact', '--out', outFile])

      const content = await readFile(outFile, 'utf8')
      expect(content).not.toContain(root)
      expect(content).toContain('<workspace>')
      expect(JSON.parse(content)).toEqual(expect.objectContaining({
        env: expect.objectContaining({
          cwd: '<workspace>',
          workspaceDir: '<workspace>',
        }),
        config: expect.objectContaining({
          file: '<workspace>/repoctl.config.ts',
        }),
      }))
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('writes a redacted markdown support summary', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-support-markdown-'))
    const outFile = path.join(root, 'reports/support.md')
    const collectEnvSupportBundleMock = vi.fn(async () => createSupportBundle(root))

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvSupportBundle: collectEnvSupportBundleMock,
      }))
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: vi.fn(),
          success: vi.fn(),
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'env', 'support', '--markdown', '--redact', '--out', outFile])

      const content = await readFile(outFile, 'utf8')
      expect(content).not.toContain(root)
      expect(content).toContain('# Repo support bundle')
      expect(content).toContain('| workspace | <workspace> |')
      expect(content).toContain('- warn: root scripts (fix: run repo upgrade)')
      expect(content).toContain('- `repo verify pre-commit` - check <workspace>/package.json')
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('marks strict support output as failed when doctor reports warnings', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-support-strict-'))
    const outFile = path.join(root, 'reports/support.md')
    const collectEnvSupportBundleMock = vi.fn(async () => createSupportBundle(root))

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvSupportBundle: collectEnvSupportBundleMock,
      }))
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: vi.fn(),
          success: vi.fn(),
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'env', 'support', '--markdown', '--strict', '--out', outFile])

      expect(await readFile(outFile, 'utf8')).toContain('# Repo support bundle')
      expect(process.exitCode).toBe(1)
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
