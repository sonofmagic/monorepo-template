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
})
