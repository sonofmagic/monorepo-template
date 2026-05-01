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

describe('commander program doctor command', () => {
  it('prints doctor report as json and keeps failing exit code', async () => {
    const doctorMock = vi.fn(async () => ({
      cwd: '/repo',
      workspaceDir: '/repo',
      packageCount: 0,
      checks: [
        {
          id: 'package-json',
          title: 'package.json',
          status: 'fail',
          detail: 'missing',
        },
      ],
      summary: { pass: 0, warn: 0, fail: 1 },
    }))

    mockProgram()
    vi.doMock('@/commands', () => ({
      runDoctor: doctorMock,
    }))

    const errorMock = vi.fn()
    const logMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        error: errorMock,
        log: logMock,
      },
    }))

    const previousExitCode = process.exitCode
    process.exitCode = undefined

    const { default: program } = await import('@/cli/program')
    await program.parseAsync(['node', 'repo', 'doctor', '--json'])

    expect(logMock).toHaveBeenCalledWith(expect.stringContaining('"summary"'))
    expect(errorMock).not.toHaveBeenCalled()
    expect(process.exitCode).toBe(1)

    process.exitCode = previousExitCode
  })

  it('writes doctor report to a file and keeps failing exit code', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-doctor-report-'))
    const doctorMock = vi.fn(async () => ({
      cwd: root,
      workspaceDir: root,
      packageCount: 0,
      checks: [
        {
          id: 'package-json',
          title: 'package.json',
          status: 'fail',
          detail: 'missing',
        },
      ],
      summary: { pass: 0, warn: 0, fail: 1 },
    }))

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        runDoctor: doctorMock,
      }))

      const logMock = vi.fn()
      const successMock = vi.fn()
      vi.doMock('@/core/logger', () => ({
        logger: {
          error: vi.fn(),
          log: logMock,
          success: successMock,
        },
      }))

      const previousExitCode = process.exitCode
      process.exitCode = undefined
      const reportPath = path.join(root, 'reports/doctor.json')

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'doctor', '--json', '--out', reportPath])

      expect(JSON.parse(await readFile(reportPath, 'utf8'))).toEqual(expect.objectContaining({
        summary: { pass: 0, warn: 0, fail: 1 },
      }))
      expect(logMock).not.toHaveBeenCalledWith(expect.stringContaining('"summary"'))
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('doctor.json'))
      expect(process.exitCode).toBe(1)

      process.exitCode = previousExitCode
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('marks the process as failed when doctor finds blocking issues', async () => {
    const doctorMock = vi.fn(async () => ({
      cwd: '/repo',
      workspaceDir: '/repo',
      packageCount: 0,
      checks: [],
      summary: { pass: 2, warn: 1, fail: 1 },
    }))

    mockProgram()
    vi.doMock('@/commands', () => ({
      runDoctor: doctorMock,
    }))

    const errorMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        success: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: errorMock,
        log: vi.fn(),
      },
    }))

    const previousExitCode = process.exitCode
    process.exitCode = undefined

    const { default: program } = await import('@/cli/program')
    await program.parseAsync(['node', 'repo', 'doctor'])

    expect(process.exitCode).toBe(1)
    expect(errorMock).toHaveBeenCalledWith('doctor found 1 blocking issue(s).')

    process.exitCode = previousExitCode
  })
})
