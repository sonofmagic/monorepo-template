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
