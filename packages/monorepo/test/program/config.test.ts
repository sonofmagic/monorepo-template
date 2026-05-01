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

function createInspection() {
  return {
    cwd: '/repo',
    file: '/repo/repoctl.config.ts',
    config: {
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
    },
  }
}

describe('commander program config command', () => {
  it('prints config inspection as json', async () => {
    const inspectMock = vi.fn(async () => createInspection())

    mockProgram()
    vi.doMock('@/commands', () => ({
      inspectMonorepoConfig: inspectMock,
    }))

    const logMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        log: logMock,
        success: vi.fn(),
      },
    }))

    const { default: program } = await import('@/cli/program')
    await program.parseAsync(['node', 'repo', 'config', 'inspect', '--json'])

    expect(inspectMock).toHaveBeenCalledWith(expect.any(String))
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining('"autoConfirm": true'))
  })

  it('writes config inspection to a file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-config-inspect-'))
    const outFile = path.join(root, 'reports/config.txt')
    const inspectMock = vi.fn(async () => createInspection())

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        inspectMonorepoConfig: inspectMock,
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
      await program.parseAsync(['node', 'repo', 'cfg', 'i', '--out', outFile])

      expect(await readFile(outFile, 'utf8')).toContain('file: /repo/repoctl.config.ts')
      expect(await readFile(outFile, 'utf8')).toContain('commands: clean')
      expect(logMock).not.toHaveBeenCalled()
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('config.txt'))
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
