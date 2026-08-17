import assert from 'node:assert/strict'
import { describe, it } from 'vitest'
import {
  hasReleaseArtifactPair,
  isReleaseCommitMessage,
  shouldRunRelease,
} from '@/commands/release'

const baseContext = {
  eventName: 'push',
  branch: 'main',
  pendingChangesetFiles: [],
  changedFiles: ['packages/example/src/index.ts'],
  commitMessage: 'feat(example): update compiler',
} as const

describe('release trigger', () => {
  it('skips an ordinary main source push', () => {
    assert.equal(shouldRunRelease(baseContext), false)
  })

  it('runs when a pending changeset exists', () => {
    assert.equal(shouldRunRelease({
      ...baseContext,
      pendingChangesetFiles: ['.changeset/release.md'],
    }), true)
  })

  it('runs for release commit subjects on main', () => {
    assert.equal(shouldRunRelease({
      ...baseContext,
      commitMessage: 'chore(release): version packages (#816)',
    }), true)
    assert.equal(shouldRunRelease({
      ...baseContext,
      commitMessage: 'Version Packages (#812)',
    }), true)
  })

  it('runs when a package has both release artifacts changed', () => {
    assert.equal(hasReleaseArtifactPair([
      'packages/example/package.json',
      'packages/example/CHANGELOG.md',
    ]), true)
    assert.equal(shouldRunRelease({
      ...baseContext,
      changedFiles: [
        'packages/example/package.json',
        'packages/example/CHANGELOG.md',
      ],
    }), true)
  })

  it('skips ordinary prerelease pushes and runs prerelease pushes with intent', () => {
    for (const branch of ['alpha', 'beta', 'rc', 'next']) {
      assert.equal(shouldRunRelease({ ...baseContext, branch }), false)
      assert.equal(shouldRunRelease({
        ...baseContext,
        branch,
        pendingChangesetFiles: ['.changeset/release.md'],
      }), true)
    }
  })

  it('always runs workflow dispatch', () => {
    for (const mode of ['auto', 'prepare', 'publish', 'publish-unpublished']) {
      assert.equal(shouldRunRelease({
        ...baseContext,
        eventName: 'workflow_dispatch',
        commitMessage: mode,
      }), true)
    }
  })

  it('recognizes only release commit subjects', () => {
    assert.equal(isReleaseCommitMessage('chore(release): version packages'), true)
    assert.equal(isReleaseCommitMessage('feat: Version Packages'), false)
  })
})
