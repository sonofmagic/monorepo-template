import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { enterPrerelease, exitPrerelease, releasePrerelease, releaseStable } from '@/commands/release'

interface SpawnCall {
  command: string
  args: string[]
}

const tempRoots: string[] = []

async function createTempWorkspace(preState?: unknown) {
  const cwd = await mkdtemp(path.join(tmpdir(), 'repo-release-'))
  tempRoots.push(cwd)

  if (preState) {
    await mkdir(path.join(cwd, '.changeset'), { recursive: true })
    await writeFile(path.join(cwd, '.changeset/pre.json'), JSON.stringify(preState), 'utf8')
  }

  return cwd
}

function createSpawnMock(options: { diffStatus?: number } = {}) {
  const calls: SpawnCall[] = []
  const spawn = vi.fn((command: string, args: string[]) => {
    calls.push({ command, args })

    if (command === 'git' && args.join(' ') === 'diff --quiet --exit-code') {
      return { status: options.diffStatus ?? 0, stdout: '' }
    }

    return { status: 0, stdout: '' }
  })

  return { calls, spawn }
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map(root => rm(root, { force: true, recursive: true })))
})

describe('release commands', () => {
  it('runs the stable release sequence on main', async () => {
    const cwd = await createTempWorkspace()
    const { calls, spawn } = createSpawnMock()

    await releaseStable({ branch: 'main', cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['exec', 'changeset', 'version'] },
      { command: 'pnpm', args: ['exec', 'changeset', 'publish'] },
    ])
  })

  it('rejects stable releases away from main', async () => {
    const cwd = await createTempWorkspace()
    const { spawn } = createSpawnMock()

    await expect(
      releaseStable({ branch: 'next', cwd, spawn: spawn as never }),
    ).rejects.toThrow('repo release stable is only allowed on main')
    expect(spawn).not.toHaveBeenCalled()
  })

  it('requires matching Changesets pre mode before prerelease publishing', async () => {
    const cwd = await createTempWorkspace({ mode: 'pre', tag: 'beta' })
    const { spawn } = createSpawnMock()

    await expect(
      releasePrerelease({ branch: 'alpha', cwd, spawn: spawn as never }),
    ).rejects.toThrow('must already be in Changesets pre mode with matching tag')
    expect(spawn).not.toHaveBeenCalled()
  })

  it('skips prerelease publish when changeset version creates no changes', async () => {
    const cwd = await createTempWorkspace({ mode: 'pre', tag: 'next' })
    const { calls, spawn } = createSpawnMock({ diffStatus: 0 })

    await releasePrerelease({ branch: 'next', cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['exec', 'changeset', 'version'] },
      { command: 'git', args: ['diff', '--quiet', '--exit-code'] },
    ])
  })

  it('commits, publishes, and pushes prerelease version changes', async () => {
    const cwd = await createTempWorkspace({ mode: 'pre', tag: 'alpha' })
    const { calls, spawn } = createSpawnMock({ diffStatus: 1 })

    await releasePrerelease({ branch: 'alpha', cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['exec', 'changeset', 'version'] },
      { command: 'git', args: ['diff', '--quiet', '--exit-code'] },
      { command: 'git', args: ['add', '-A'] },
      { command: 'git', args: ['commit', '-m', 'chore(release): alpha [skip ci]'] },
      { command: 'pnpm', args: ['exec', 'changeset', 'publish'] },
      { command: 'git', args: ['push', '--follow-tags', 'origin', 'HEAD:alpha'] },
    ])
  })

  it('wraps Changesets prerelease enter and exit commands', async () => {
    const cwd = await createTempWorkspace()
    const { calls, spawn } = createSpawnMock()

    enterPrerelease('rc', { cwd, spawn: spawn as never })
    exitPrerelease({ cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['exec', 'changeset', 'pre', 'enter', 'rc'] },
      { command: 'pnpm', args: ['exec', 'changeset', 'pre', 'exit'] },
    ])
  })
})
