import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
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

function createEnvInfo(root: string) {
  return {
    cwd: root,
    workspaceDir: root,
    packageManager: 'pnpm@10.0.0',
    nodeVersion: 'v20.0.0',
    nodeRange: '>=20.0.0',
    pnpmVersion: '10.0.0',
    platform: 'darwin',
    arch: 'arm64',
    packageCount: 2,
  }
}

function createEnvSnapshot(root: string) {
  return {
    generatedAt: '2026-05-02T12:00:00.000Z',
    env: createEnvInfo(root),
    doctor: {
      cwd: root,
      workspaceDir: root,
      packageCount: 2,
      checks: [
        {
          id: 'root-scripts',
          title: 'root scripts',
          status: 'warn',
          detail: `missing script in ${path.join(root, 'package.json')}`,
          fix: 'run repo upgrade',
        },
      ],
      summary: {
        pass: 1,
        warn: 1,
        fail: 0,
      },
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

function createEnvPaths(root: string) {
  return {
    cwd: root,
    workspaceDir: root,
    paths: {
      packageJson: { path: path.join(root, 'package.json'), relativePath: 'package.json', exists: true },
      workspaceManifest: { path: path.join(root, 'pnpm-workspace.yaml'), relativePath: 'pnpm-workspace.yaml', exists: true },
      repoctlConfig: { path: path.join(root, 'repoctl.config.ts'), relativePath: 'repoctl.config.ts', exists: false },
      repoctlConfigs: [{ path: path.join(root, 'repoctl.config.ts'), relativePath: 'repoctl.config.ts', exists: false }],
      legacyConfig: { path: path.join(root, 'monorepo.config.ts'), relativePath: 'monorepo.config.ts', exists: false },
      legacyConfigs: [{ path: path.join(root, 'monorepo.config.ts'), relativePath: 'monorepo.config.ts', exists: false }],
      toolingDir: { path: path.join(root, 'tooling'), relativePath: 'tooling', exists: true },
      reportsDir: { path: path.join(root, 'reports'), relativePath: 'reports', exists: false },
      doctorReport: { path: path.join(root, 'reports/doctor.json'), relativePath: 'reports/doctor.json', exists: false },
      envReport: { path: path.join(root, 'reports/env.json'), relativePath: 'reports/env.json', exists: false },
      snapshotReport: { path: path.join(root, 'reports/snapshot.json'), relativePath: 'reports/snapshot.json', exists: false },
      checkPlanReport: { path: path.join(root, 'reports/check-plan.json'), relativePath: 'reports/check-plan.json', exists: false },
    },
  }
}

describe('commander program env markdown output', () => {
  it('writes redacted env info as markdown', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-info-markdown-'))
    const outFile = path.join(root, 'reports/env.md')
    const collectEnvInfoMock = vi.fn(async () => createEnvInfo(root))

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvInfo: collectEnvInfoMock,
      }))
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: vi.fn(),
          success: vi.fn(),
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'env', 'info', '--markdown', '--redact', '--out', outFile])

      const content = await readFile(outFile, 'utf8')
      expect(content).not.toContain(root)
      expect(content).toContain('# Repo environment')
      expect(content).toContain('| workspace | <workspace> |')
      expect(content).toContain('| packageManager | pnpm@10.0.0 |')
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('writes redacted env snapshot as markdown', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-snapshot-markdown-'))
    const outFile = path.join(root, 'reports/snapshot.md')
    const collectEnvSnapshotMock = vi.fn(async () => createEnvSnapshot(root))

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvSnapshot: collectEnvSnapshotMock,
      }))
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: vi.fn(),
          success: vi.fn(),
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'env', 'snapshot', '--markdown', '--redact', '--out', outFile])

      const content = await readFile(outFile, 'utf8')
      expect(content).not.toContain(root)
      expect(content).toContain('# Repo environment snapshot')
      expect(content).toContain('- warn: root scripts (fix: run repo upgrade)')
      expect(content).toContain('- `repo verify pre-commit` - check <workspace>/package.json')
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('writes redacted env paths as json and markdown', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-paths-markdown-'))
    const jsonFile = path.join(root, 'reports/paths.json')
    const markdownFile = path.join(root, 'reports/paths.md')
    const collectEnvPathsMock = vi.fn(async () => createEnvPaths(root))

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvPaths: collectEnvPathsMock,
      }))
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: vi.fn(),
          success: vi.fn(),
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'env', 'paths', '--json', '--redact', '--out', jsonFile])
      await program.parseAsync(['node', 'repo', 'env', 'paths', '--markdown', '--redact', '--out', markdownFile])

      const jsonContent = await readFile(jsonFile, 'utf8')
      const markdownContent = await readFile(markdownFile, 'utf8')
      expect(jsonContent).not.toContain(root)
      expect(JSON.parse(jsonContent)).toEqual(expect.objectContaining({
        cwd: '<workspace>',
        paths: expect.objectContaining({
          packageJson: expect.objectContaining({ path: '<workspace>/package.json' }),
        }),
      }))
      expect(markdownContent).not.toContain(root)
      expect(markdownContent).toContain('# Repo paths')
      expect(markdownContent).toContain('| packageJson | package.json | exists |')
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
