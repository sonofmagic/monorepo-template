import { verifyCommitMsg, verifyPreCommit, verifyPrePush, verifyStagedTypecheck } from './verify'

export interface RecommendedCheckOptions {
  cwd: string
  full?: boolean
  staged?: boolean
  editFile?: string
}

export async function runRecommendedCheck(options: RecommendedCheckOptions) {
  const { cwd, full, staged, editFile } = options

  if (editFile) {
    await verifyCommitMsg({ cwd, editFile })
    return
  }

  if (full) {
    await verifyPrePush({ cwd })
    return
  }

  if (staged) {
    await verifyPreCommit({ cwd })
    verifyStagedTypecheck([], { cwd })
    return
  }

  await verifyPreCommit({ cwd })
}
