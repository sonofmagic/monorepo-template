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

describe('commander program check command', () => {
  it('prints check plan as json without running checks', async () => {
    const runRecommendedCheckMock = vi.fn(async () => {})
    const resolveRecommendedCheckPlanMock = vi.fn(() => ({
      cwd: '/repo',
      mode: 'full',
      commands: [
        {
          name: 'pre-push',
          command: 'repo verify pre-push',
          description: 'full check',
        },
      ],
    }))

    mockProgram()
    vi.doMock('@/commands', () => ({
      resolveRecommendedCheckPlan: resolveRecommendedCheckPlanMock,
      runRecommendedCheck: runRecommendedCheckMock,
    }))

    const logMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        log: logMock,
        success: vi.fn(),
      },
    }))

    const { default: program } = await import('@/cli/program')
    await program.parseAsync(['node', 'repo', 'check', '--full', '--json'])

    expect(resolveRecommendedCheckPlanMock).toHaveBeenCalledWith({
      cwd: expect.any(String),
      full: true,
    })
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining('"mode": "full"'))
    expect(runRecommendedCheckMock).not.toHaveBeenCalled()
  })

  it('writes check plan to a file without running checks', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-check-plan-'))
    const planPath = path.join(root, 'reports/check.txt')
    const runRecommendedCheckMock = vi.fn(async () => {})
    const resolveRecommendedCheckPlanMock = vi.fn(() => ({
      cwd: root,
      mode: 'staged',
      commands: [
        {
          name: 'pre-commit',
          command: 'repo verify pre-commit',
          description: 'pre-commit check',
        },
        {
          name: 'staged-typecheck',
          command: 'repo verify staged-typecheck <staged files>',
          description: 'typecheck changed files',
        },
      ],
    }))

    try {
      mockProgram()
      vi.doMock('@/commands', () => ({
        resolveRecommendedCheckPlan: resolveRecommendedCheckPlanMock,
        runRecommendedCheck: runRecommendedCheckMock,
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
      await program.parseAsync(['node', 'repo', 'check', '--staged', '--out', planPath])

      const content = await readFile(planPath, 'utf8')
      expect(content).toContain('mode: staged')
      expect(content).toContain('repo verify staged-typecheck <staged files>')
      expect(logMock).not.toHaveBeenCalled()
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('check.txt'))
      expect(runRecommendedCheckMock).not.toHaveBeenCalled()
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
