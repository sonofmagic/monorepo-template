import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { enterPrerelease, exitPrerelease, parsePublishSummary, prepareStable, publishStable, releasePrerelease } from '@/commands/release'

interface SpawnCall {
  command: string
  args: string[]
}

const tempRoots: string[] = []

async function createTempWorkspace(lane = 'next') {
  const cwd = await mkdtemp(path.join(tmpdir(), 'repo-release-'))
  tempRoots.push(cwd)

  await mkdir(path.join(cwd, '.changeset'), { recursive: true })
  await mkdir(path.join(cwd, 'packages', 'repoctl'), { recursive: true })
  await mkdir(path.join(cwd, 'packages', 'private'), { recursive: true })
  await writeFile(path.join(cwd, 'packages', 'repoctl', 'package.json'), JSON.stringify({
    name: 'repoctl',
    version: '1.0.0',
  }), 'utf8')
  await writeFile(path.join(cwd, 'packages', 'private', 'package.json'), JSON.stringify({
    name: 'private-package',
    version: '1.0.0',
    private: true,
  }), 'utf8')
  await writeFile(path.join(cwd, 'pnpm-workspace.yaml'), [
    'packages:',
    '  - packages/*',
    'versioning:',
    '  lanes:',
    `    repoctl: ${lane}`,
  ].join('\n'), 'utf8')

  return cwd
}

async function writePendingIntent(cwd: string, name = 'pending-change') {
  await writeFile(path.join(cwd, '.changeset', `${name}.md`), [
    '---',
    'repoctl: patch',
    '---',
    '',
    'Release change.',
  ].join('\n'), 'utf8')
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
  it('prepares a stable release from pending pnpm intents', async () => {
    const cwd = await createTempWorkspace('main')
    await writePendingIntent(cwd)
    const { calls, spawn } = createSpawnMock({ diffStatus: 1 })

    await expect(prepareStable({ branch: 'main', cwd, spawn: spawn as never })).resolves.toBe(true)

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['version', '-r', '--no-git-checks'] },
      { command: 'git', args: ['diff', '--quiet', '--exit-code'] },
    ])
  })

  it('does not version when there are no pending intents', async () => {
    const cwd = await createTempWorkspace('main')
    const { calls, spawn } = createSpawnMock()

    await expect(prepareStable({ branch: 'main', cwd, spawn: spawn as never })).resolves.toBe(false)
    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
    ])
  })

  it('publishes packages versioned by the merged release pull request', async () => {
    const cwd = await createTempWorkspace('main')
    const { calls, spawn } = createSpawnMock()

    await publishStable({ branch: 'main', cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['publish', '-r', '--report-summary', '--provenance', '--no-git-checks'] },
    ])
  })

  it('rejects stable releases away from main', async () => {
    const cwd = await createTempWorkspace('main')
    const { spawn } = createSpawnMock()

    await expect(
      publishStable({ branch: 'next', cwd, spawn: spawn as never }),
    ).rejects.toThrow('repo release stable publish is only allowed on main')
    expect(spawn).not.toHaveBeenCalled()
  })

  it('requires every package to be on the matching pnpm lane', async () => {
    const cwd = await createTempWorkspace('beta')
    const { spawn } = createSpawnMock()

    await expect(
      releasePrerelease({ branch: 'alpha', cwd, spawn: spawn as never }),
    ).rejects.toThrow('all publishable packages must be on the alpha lane')
    expect(spawn).not.toHaveBeenCalled()
  })

  it('skips prerelease publish when version creates no changes', async () => {
    const cwd = await createTempWorkspace('next')
    await writePendingIntent(cwd)
    const { calls, spawn } = createSpawnMock({ diffStatus: 0 })

    await releasePrerelease({ branch: 'next', cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['version', '-r', '--no-git-checks'] },
      { command: 'git', args: ['diff', '--quiet', '--exit-code'] },
    ])
  })

  it('skips prerelease version when there are no pending intents', async () => {
    const cwd = await createTempWorkspace('next')
    const { calls, spawn } = createSpawnMock()

    await releasePrerelease({ branch: 'next', cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
    ])
  })

  it('commits, publishes, and pushes prerelease version changes', async () => {
    const cwd = await createTempWorkspace('alpha')
    await writePendingIntent(cwd)
    const { calls, spawn } = createSpawnMock({ diffStatus: 1 })

    await releasePrerelease({ branch: 'alpha', cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['version', '-r', '--no-git-checks'] },
      { command: 'git', args: ['diff', '--quiet', '--exit-code'] },
      { command: 'git', args: ['add', '-A'] },
      { command: 'git', args: ['commit', '-m', 'chore(release): alpha [skip ci]'] },
      { command: 'pnpm', args: ['publish', '-r', '--tag', 'alpha', '--report-summary', '--provenance', '--no-git-checks'] },
      { command: 'git', args: ['push', '--follow-tags', 'origin', 'HEAD:alpha'] },
    ])
  })

  it('moves all publishable packages between pnpm lanes', async () => {
    const cwd = await createTempWorkspace('main')
    const { calls, spawn } = createSpawnMock()

    await enterPrerelease('rc', { cwd, spawn: spawn as never })
    await exitPrerelease({ cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['lane', 'rc', '--filter', 'repoctl'] },
      { command: 'pnpm', args: ['lane', 'main', '--filter', 'repoctl'] },
    ])
  })

  it('parses pnpm publish summaries for release metadata', () => {
    expect(parsePublishSummary(JSON.stringify({
      publishedPackages: [{ name: 'repoctl', version: '1.2.3' }],
    }))).toEqual([{ name: 'repoctl', version: '1.2.3' }])
    expect(() => parsePublishSummary('{"publishedPackages":[{}]}')).toThrow('invalid package entry')
  })
})
