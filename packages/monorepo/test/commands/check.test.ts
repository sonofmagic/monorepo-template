import { afterEach, describe, expect, it, vi } from 'vitest'

const verifyCommitMsgMock = vi.fn(async () => {})
const verifyPreCommitMock = vi.fn(async () => {})
const verifyPrePushMock = vi.fn(async () => {})
const verifyStagedTypecheckMock = vi.fn(() => {})

vi.mock('@/commands/verify', () => ({
  verifyCommitMsg: verifyCommitMsgMock,
  verifyPreCommit: verifyPreCommitMock,
  verifyPrePush: verifyPrePushMock,
  verifyStagedTypecheck: verifyStagedTypecheckMock,
}))

afterEach(() => {
  verifyCommitMsgMock.mockClear()
  verifyPreCommitMock.mockClear()
  verifyPrePushMock.mockClear()
  verifyStagedTypecheckMock.mockClear()
})

describe('runRecommendedCheck', () => {
  it('resolves a dry-run plan for the default check route', async () => {
    const { resolveRecommendedCheckPlan } = await import('@/commands/check')
    const plan = resolveRecommendedCheckPlan({ cwd: '/repo' })

    expect(plan).toEqual({
      cwd: '/repo',
      mode: 'default',
      commands: [
        expect.objectContaining({
          name: 'pre-commit',
          command: 'repo verify pre-commit',
        }),
      ],
    })
  })

  it('resolves a dry-run plan for staged checks', async () => {
    const { resolveRecommendedCheckPlan } = await import('@/commands/check')
    const plan = resolveRecommendedCheckPlan({ cwd: '/repo', staged: true })

    expect(plan.mode).toBe('staged')
    expect(plan.commands.map(command => command.name)).toEqual(['pre-commit', 'staged-typecheck'])
  })

  it('resolves editFile before other check modes', async () => {
    const { resolveRecommendedCheckPlan } = await import('@/commands/check')
    const plan = resolveRecommendedCheckPlan({
      cwd: '/repo',
      full: true,
      staged: true,
      editFile: '.git/COMMIT_EDITMSG',
    })

    expect(plan).toEqual(expect.objectContaining({
      mode: 'commit-msg',
      commands: [
        expect.objectContaining({
          command: 'repo verify commit-msg .git/COMMIT_EDITMSG',
        }),
      ],
    }))
  })

  it('routes editFile to commit-msg verification', async () => {
    const { runRecommendedCheck } = await import('@/commands/check')
    await runRecommendedCheck({ cwd: '/repo', editFile: '.git/COMMIT_EDITMSG' })

    expect(verifyCommitMsgMock).toHaveBeenCalledWith({
      cwd: '/repo',
      editFile: '.git/COMMIT_EDITMSG',
    })
  })

  it('routes full checks to pre-push verification', async () => {
    const { runRecommendedCheck } = await import('@/commands/check')
    await runRecommendedCheck({ cwd: '/repo', full: true })

    expect(verifyPrePushMock).toHaveBeenCalledWith({ cwd: '/repo' })
  })

  it('routes staged checks to pre-commit and staged typecheck', async () => {
    const { runRecommendedCheck } = await import('@/commands/check')
    await runRecommendedCheck({ cwd: '/repo', staged: true })

    expect(verifyPreCommitMock).toHaveBeenCalledWith({ cwd: '/repo' })
    expect(verifyStagedTypecheckMock).toHaveBeenCalledWith([], { cwd: '/repo' })
  })

  it('defaults to pre-commit verification', async () => {
    const { runRecommendedCheck } = await import('@/commands/check')
    await runRecommendedCheck({ cwd: '/repo' })

    expect(verifyPreCommitMock).toHaveBeenCalledWith({ cwd: '/repo' })
  })
})
