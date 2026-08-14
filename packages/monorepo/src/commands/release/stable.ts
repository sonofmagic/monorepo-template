import type { ReleaseOptions } from './types'
import { ReleaseCommandError } from './errors'
import { assertStableLaneAssignments, hasGitChanges, hasPendingIntents, resolveBranch, run, runQualityChecks } from './shared'

export async function prepareStable(options: ReleaseOptions) {
  const branch = resolveBranch(options)
  if (branch !== 'main') {
    throw new ReleaseCommandError(`repo release stable prepare is only allowed on main, got ${branch}`)
  }
  await assertStableLaneAssignments(options)
  runQualityChecks(options)
  if (!await hasPendingIntents(options.cwd)) {
    return false
  }
  run('pnpm', ['version', '-r', '--no-git-checks'], options)
  return hasGitChanges(options)
}

export async function publishStable(options: ReleaseOptions) {
  const branch = resolveBranch(options)
  if (branch !== 'main') {
    throw new ReleaseCommandError(`repo release stable publish is only allowed on main, got ${branch}`)
  }
  await assertStableLaneAssignments(options)
  runQualityChecks(options)
  run('pnpm', ['publish', '-r', '--report-summary', '--provenance', '--no-git-checks'], options)
}

/** Compatibility entry point retained for existing generated repositories. */
export async function releaseStable(options: ReleaseOptions) {
  await publishStable(options)
}
