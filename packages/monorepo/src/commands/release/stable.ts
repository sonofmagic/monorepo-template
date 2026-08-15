import type { ReleaseOptions } from './types'
import { ReleaseCommandError } from './errors'
import { runQualityScripts, runReleaseHooks } from './hooks'
import { assertStableLaneAssignments, clearPublishSummary, hasGitChanges, hasPendingIntents, readPublishSummary, resolveBranch, run } from './shared'

export async function prepareStable(options: ReleaseOptions) {
  const branch = resolveBranch(options)
  if (branch !== 'main') {
    throw new ReleaseCommandError(`repo release stable prepare is only allowed on main, got ${branch}`)
  }
  await assertStableLaneAssignments(options)
  if (!await hasPendingIntents(options.cwd)) {
    return false
  }
  runReleaseHooks('beforeVersion', options)
  runQualityScripts(options)
  run('pnpm', ['version', '-r', '--no-git-checks'], options)
  runReleaseHooks('afterVersion', options)
  return hasGitChanges(options)
}

export async function publishStable(options: ReleaseOptions) {
  const branch = resolveBranch(options)
  if (branch !== 'main') {
    throw new ReleaseCommandError(`repo release stable publish is only allowed on main, got ${branch}`)
  }
  await assertStableLaneAssignments(options)
  if (await hasPendingIntents(options.cwd)) {
    throw new ReleaseCommandError('stable publish found unconsumed change intents; prepare and merge the Release PR before publishing')
  }
  runQualityScripts(options)
  runReleaseHooks('beforePublish', options)
  await clearPublishSummary(options.cwd)
  run('pnpm', ['publish', '-r', '--report-summary', '--provenance', '--no-git-checks'], options)
  return readPublishSummary(options.cwd)
}

/** Compatibility entry point retained for existing generated repositories. */
export async function releaseStable(options: ReleaseOptions) {
  return publishStable(options)
}
