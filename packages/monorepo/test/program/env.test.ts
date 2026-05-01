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

function createEnvInfo() {
  return {
    cwd: '/repo',
    workspaceDir: '/repo',
    packageManager: 'pnpm@10.0.0',
    nodeVersion: 'v20.0.0',
    nodeRange: '>=20.0.0',
    pnpmVersion: '10.0.0',
    platform: 'darwin',
    arch: 'arm64',
    packageCount: 2,
  }
}

function createEnvSnapshot() {
  return {
    generatedAt: '2026-05-01T12:00:00.000Z',
    env: createEnvInfo(),
    doctor: {
      cwd: '/repo',
      workspaceDir: '/repo',
      packageCount: 2,
      checks: [],
      summary: {
        pass: 1,
        warn: 0,
        fail: 0,
      },
    },
    checkPlan: {
      cwd: '/repo',
      mode: 'default',
      commands: [
        {
          name: 'pre-commit',
          command: 'repo verify pre-commit',
          description: 'default check',
        },
      ],
    },
  }
}

function createEnvPaths() {
  return {
    cwd: '/repo',
    workspaceDir: '/repo',
    paths: {
      packageJson: { path: '/repo/package.json', relativePath: 'package.json', exists: true },
      workspaceManifest: { path: '/repo/pnpm-workspace.yaml', relativePath: 'pnpm-workspace.yaml', exists: true },
      repoctlConfig: { path: '/repo/repoctl.config.ts', relativePath: 'repoctl.config.ts', exists: false },
      legacyConfig: { path: '/repo/monorepo.config.ts', relativePath: 'monorepo.config.ts', exists: false },
      toolingDir: { path: '/repo/tooling', relativePath: 'tooling', exists: true },
      reportsDir: { path: '/repo/reports', relativePath: 'reports', exists: false },
      doctorReport: { path: '/repo/reports/doctor.json', relativePath: 'reports/doctor.json', exists: false },
      envReport: { path: '/repo/reports/env.json', relativePath: 'reports/env.json', exists: false },
      snapshotReport: { path: '/repo/reports/snapshot.json', relativePath: 'reports/snapshot.json', exists: false },
      checkPlanReport: { path: '/repo/reports/check-plan.json', relativePath: 'reports/check-plan.json', exists: false },
    },
  }
}

function createSupportBundle() {
  return {
    generatedAt: '2026-05-01T12:00:00.000Z',
    env: createEnvInfo(),
    paths: createEnvPaths(),
    config: {
      cwd: '/repo',
      file: '/repo/repoctl.config.ts',
      config: {
        commands: {
          clean: {
            autoConfirm: true,
          },
        },
      },
    },
    doctor: {
      cwd: '/repo',
      workspaceDir: '/repo',
      packageCount: 2,
      checks: [],
      summary: {
        pass: 1,
        warn: 0,
        fail: 0,
      },
    },
    checkPlan: {
      cwd: '/repo',
      mode: 'default',
      commands: [
        {
          name: 'pre-commit',
          command: 'repo verify pre-commit',
          description: 'default check',
        },
      ],
    },
  }
}

describe('commander program env command', () => {
  it('prints env info as json', async () => {
    const collectEnvInfoMock = vi.fn(async () => createEnvInfo())

    mockProgram()
    vi.doMock('@/commands', () => ({
      collectEnvInfo: collectEnvInfoMock,
    }))

    const logMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        log: logMock,
        success: vi.fn(),
      },
    }))

    const { default: program } = await import('@/cli/program')
    await program.parseAsync(['node', 'repo', 'env', 'info', '--json'])

    expect(collectEnvInfoMock).toHaveBeenCalledWith(expect.any(String))
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining('"packageManager": "pnpm@10.0.0"'))
  })

  it('writes env info to a file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-info-'))
    const outFile = path.join(root, 'reports/env.txt')
    const collectEnvInfoMock = vi.fn(async () => createEnvInfo())

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvInfo: collectEnvInfoMock,
      }))

      const logMock = vi.fn()
      const successMock = vi.fn()
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: logMock,
          success: successMock,
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'e', 'i', '--out', outFile])

      expect(await readFile(outFile, 'utf8')).toContain('packageManager: pnpm@10.0.0')
      expect(logMock).not.toHaveBeenCalled()
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('env.txt'))
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('writes env snapshot to a json file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-snapshot-'))
    const outFile = path.join(root, 'reports/snapshot.json')
    const collectEnvSnapshotMock = vi.fn(async () => createEnvSnapshot())

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvSnapshot: collectEnvSnapshotMock,
      }))

      const logMock = vi.fn()
      const successMock = vi.fn()
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: logMock,
          success: successMock,
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'env', 'snapshot', '--json', '--out', outFile])

      expect(JSON.parse(await readFile(outFile, 'utf8'))).toEqual(expect.objectContaining({
        generatedAt: '2026-05-01T12:00:00.000Z',
        env: expect.objectContaining({ packageManager: 'pnpm@10.0.0' }),
        doctor: expect.objectContaining({ summary: { pass: 1, warn: 0, fail: 0 } }),
        checkPlan: expect.objectContaining({ mode: 'default' }),
      }))
      expect(logMock).not.toHaveBeenCalled()
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('snapshot.json'))
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('writes env paths to a json file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-paths-'))
    const outFile = path.join(root, 'reports/paths.json')
    const collectEnvPathsMock = vi.fn(async () => createEnvPaths())

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvPaths: collectEnvPathsMock,
      }))

      const logMock = vi.fn()
      const successMock = vi.fn()
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: logMock,
          success: successMock,
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'e', 'p', '--json', '--out', outFile])

      expect(JSON.parse(await readFile(outFile, 'utf8'))).toEqual(expect.objectContaining({
        paths: expect.objectContaining({
          packageJson: expect.objectContaining({ relativePath: 'package.json', exists: true }),
          snapshotReport: expect.objectContaining({ relativePath: 'reports/snapshot.json' }),
        }),
      }))
      expect(logMock).not.toHaveBeenCalled()
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('paths.json'))
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('writes env support bundle to a json file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-env-support-'))
    const outFile = path.join(root, 'reports/support.json')
    const collectEnvSupportBundleMock = vi.fn(async () => createSupportBundle())

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        collectEnvSupportBundle: collectEnvSupportBundleMock,
      }))

      const logMock = vi.fn()
      const successMock = vi.fn()
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: logMock,
          success: successMock,
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'e', 'b', '--json', '--out', outFile])

      expect(JSON.parse(await readFile(outFile, 'utf8'))).toEqual(expect.objectContaining({
        env: expect.objectContaining({ packageManager: 'pnpm@10.0.0' }),
        paths: expect.objectContaining({ workspaceDir: '/repo' }),
        config: expect.objectContaining({ file: '/repo/repoctl.config.ts' }),
        doctor: expect.objectContaining({ summary: { pass: 1, warn: 0, fail: 0 } }),
        checkPlan: expect.objectContaining({ mode: 'default' }),
      }))
      expect(logMock).not.toHaveBeenCalled()
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('support.json'))
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
