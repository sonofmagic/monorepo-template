import type { ReleaseNoteDocument } from '@/commands/release'
import { writeFileSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { enterPrerelease, exitPrerelease, parsePublishSummary, prepareStable, publishStable, releaseCi, releasePrerelease } from '@/commands/release'
import { logger } from '@/core/logger'

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

function createSpawnMock(options: {
  diffStatus?: number
  publishedPackages?: Array<{ name: string, version: string }>
  statuses?: Record<string, number>
  stdout?: Record<string, string>
} = {}) {
  const calls: SpawnCall[] = []
  const hookEnvs: NodeJS.ProcessEnv[] = []
  const spawn = vi.fn((command: string, args: string[], spawnOptions?: { cwd?: string, env?: NodeJS.ProcessEnv }) => {
    calls.push({ command, args })
    const commandLine = `${command} ${args.join(' ')}`

    if (command === 'pnpm' && args[0] === 'publish' && spawnOptions?.cwd) {
      writeFileSync(path.join(spawnOptions.cwd, 'pnpm-publish-summary.json'), JSON.stringify({
        publishedPackages: options.publishedPackages ?? [],
      }))
    }
    if (command === 'pnpm' && args[0] === 'run' && !['build', 'lint', 'test'].includes(args[1] ?? '')) {
      hookEnvs.push(spawnOptions?.env ?? {})
    }

    if (command === 'git' && args.join(' ') === 'diff --quiet --exit-code') {
      return { status: options.diffStatus ?? 0, stdout: '' }
    }

    return {
      status: options.statuses?.[commandLine] ?? 0,
      stdout: options.stdout?.[commandLine] ?? '',
    }
  })

  return { calls, hookEnvs, spawn }
}

afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(tempRoots.splice(0).map(root => rm(root, { force: true, recursive: true })))
})

describe('release commands', () => {
  it('auto mode publishes stable packages when main has no pending intents', async () => {
    const cwd = await createTempWorkspace('main')
    const { calls, spawn } = createSpawnMock()

    await releaseCi({ mode: 'auto', branch: 'main', cwd, spawn: spawn as never })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['publish', '-r', '--report-summary', '--provenance', '--no-git-checks'] },
    ])
  })

  it('auto mode versions and opens the release PR when intents are pending', async () => {
    const cwd = await createTempWorkspace('main')
    await writePendingIntent(cwd)
    const { calls, spawn } = createSpawnMock({ diffStatus: 1 })
    const github = {
      ensurePullRequest: vi.fn(async () => ({ number: 1, html_url: 'https://github.com/acme/repo/pull/1', state: 'open' })),
      closeLegacyReleasePullRequests: vi.fn(async () => {}),
      ensureRelease: vi.fn(),
      enrichReleaseNote: vi.fn(async (document: ReleaseNoteDocument) => ({ ...document, contributors: ['alice'] })),
    }

    await releaseCi({ mode: 'auto', branch: 'main', cwd, spawn: spawn as never, github })

    expect(calls).toEqual([
      { command: 'git', args: ['log', '-1', '--format=%H', '--', '.changeset/pending-change.md'] },
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['version', '-r', '--no-git-checks'] },
      { command: 'git', args: ['diff', '--quiet', '--exit-code'] },
      { command: 'git', args: ['config', 'user.name', 'github-actions[bot]'] },
      { command: 'git', args: ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'] },
      { command: 'git', args: ['checkout', '-B', 'release/pnpm-version'] },
      { command: 'git', args: ['add', '-A'] },
      { command: 'git', args: ['commit', '-m', 'chore(release): version packages'] },
      { command: 'git', args: ['push', '--force', 'origin', 'HEAD:release/pnpm-version'] },
    ])
    expect(github.ensurePullRequest).toHaveBeenCalledWith(expect.objectContaining({
      head: 'release/pnpm-version',
      base: 'main',
      body: expect.stringContaining('Thanks to @alice'),
    }))
    expect(github.enrichReleaseNote).toHaveBeenCalledOnce()
    expect(github.closeLegacyReleasePullRequests).toHaveBeenCalledWith({ head: 'changeset-release/main', base: 'main' })
  })

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

  it('runs verify hooks after built-in checks and before versioning', async () => {
    const cwd = await createTempWorkspace('main')
    await writePendingIntent(cwd)
    const { calls, spawn } = createSpawnMock({ diffStatus: 1 })

    await prepareStable({
      branch: 'main',
      cwd,
      hooks: { verify: ['release:verify', 'release:audit'] },
      spawn: spawn as never,
    })

    expect(calls.slice(0, 6)).toEqual([
      { command: 'pnpm', args: ['run', 'build'] },
      { command: 'pnpm', args: ['run', 'lint'] },
      { command: 'pnpm', args: ['run', 'test'] },
      { command: 'pnpm', args: ['run', 'release:verify'] },
      { command: 'pnpm', args: ['run', 'release:audit'] },
      { command: 'pnpm', args: ['version', '-r', '--no-git-checks'] },
    ])
  })

  it('stops the release when a verify hook fails', async () => {
    const cwd = await createTempWorkspace('main')
    await writePendingIntent(cwd)
    const { calls, spawn } = createSpawnMock({ statuses: { 'pnpm run release:verify': 2 } })

    await expect(prepareStable({
      branch: 'main',
      cwd,
      hooks: { verify: ['release:verify'] },
      spawn: spawn as never,
    })).rejects.toThrow('release verify hook failed: release:verify')
    expect(calls).not.toContainEqual({ command: 'pnpm', args: ['version', '-r', '--no-git-checks'] })
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

  it('clears stale publish summaries before reading the current result', async () => {
    const cwd = await createTempWorkspace('main')
    await writeFile(path.join(cwd, 'pnpm-publish-summary.json'), JSON.stringify({
      publishedPackages: [{ name: 'stale-package', version: '9.9.9' }],
    }), 'utf8')
    const { spawn } = createSpawnMock()

    await expect(publishStable({ branch: 'main', cwd, spawn: spawn as never })).resolves.toEqual([])
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

  it('runs after-publish hooks for prerelease packages', async () => {
    const cwd = await createTempWorkspace('alpha')
    await writePendingIntent(cwd)
    const { calls, hookEnvs, spawn } = createSpawnMock({
      diffStatus: 1,
      publishedPackages: [{ name: 'repoctl', version: '1.1.0-alpha.0' }],
    })

    await releaseCi({
      branch: 'alpha',
      cwd,
      env: { GITHUB_SHA: 'abc123' },
      github: { ensureRelease: vi.fn(), ensureTag: vi.fn() } as never,
      hooks: { afterPublish: [{ script: 'release:sync' }] },
      spawn: spawn as never,
    })

    expect(calls.at(-1)).toEqual({ command: 'pnpm', args: ['run', 'release:sync'] })
    expect(hookEnvs[0]).toMatchObject({
      REPO_RELEASE_PUBLISHED_PACKAGES: JSON.stringify([{ name: 'repoctl', version: '1.1.0-alpha.0' }]),
      REPO_RELEASE_PUBLISH_SUMMARY: path.resolve(cwd, 'pnpm-publish-summary.json'),
    })
  })

  it('does not run after-publish hooks when no packages were published', async () => {
    const cwd = await createTempWorkspace('main')
    const { calls, spawn } = createSpawnMock()

    await releaseCi({
      mode: 'publish',
      branch: 'main',
      cwd,
      hooks: { afterPublish: [{ script: 'release:sync' }] },
      spawn: spawn as never,
    })

    expect(calls).not.toContainEqual({ command: 'pnpm', args: ['run', 'release:sync'] })
  })

  it('runs after-publish hooks after unpublished-version recovery', async () => {
    const cwd = await createTempWorkspace('main')
    const { calls, spawn } = createSpawnMock({
      publishedPackages: [{ name: 'repoctl', version: '1.0.0' }],
      stdout: {
        [`pnpm --filter repoctl exec node -p require('./package.json').version`]: '1.0.0',
        'npm view repoctl@1.0.0 version': '1.0.0',
      },
    })
    const github = { ensureRelease: vi.fn(), ensureTag: vi.fn() }

    await releaseCi({
      mode: 'publish-unpublished',
      branch: 'main',
      cwd,
      github: github as never,
      hooks: { afterPublish: [{ script: 'release:sync' }] },
      packageName: 'repoctl',
      packageVersion: '1.0.0',
      spawn: spawn as never,
    })

    expect(github.ensureRelease).toHaveBeenCalledOnce()
    expect(calls.at(-1)).toEqual({ command: 'pnpm', args: ['run', 'release:sync'] })
  })

  it('warns and preserves a release when an optional after-publish hook fails', async () => {
    const cwd = await createTempWorkspace('main')
    const { spawn } = createSpawnMock({
      publishedPackages: [{ name: 'repoctl', version: '1.0.0' }],
      statuses: { 'pnpm run release:sync': 1 },
    })
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined)

    await expect(releaseCi({
      mode: 'publish',
      branch: 'main',
      cwd,
      env: { GITHUB_SHA: 'abc123' },
      github: { ensureRelease: vi.fn(), ensureTag: vi.fn() } as never,
      hooks: { afterPublish: [{ script: 'release:sync', continueOnError: true }] },
      spawn: spawn as never,
    })).resolves.toEqual([{ name: 'repoctl', version: '1.0.0' }])
    expect(warn).toHaveBeenCalledWith('release afterPublish hook failed and was ignored: release:sync')
  })

  it('fails when a required after-publish hook fails', async () => {
    const cwd = await createTempWorkspace('main')
    const { spawn } = createSpawnMock({
      publishedPackages: [{ name: 'repoctl', version: '1.0.0' }],
      statuses: { 'pnpm run release:sync': 1 },
    })

    await expect(releaseCi({
      mode: 'publish',
      branch: 'main',
      cwd,
      env: { GITHUB_SHA: 'abc123' },
      github: { ensureRelease: vi.fn(), ensureTag: vi.fn() } as never,
      hooks: { afterPublish: [{ script: 'release:sync' }] },
      spawn: spawn as never,
    })).rejects.toThrow('release afterPublish hook failed: release:sync')
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

  it('publishes the normalized package release body', async () => {
    const cwd = await createTempWorkspace('main')
    await writeFile(path.join(cwd, 'packages', 'repoctl', 'CHANGELOG.md'), [
      '# repoctl',
      '',
      '## 1.0.0',
      '',
      '### Patch Changes',
      '',
      '- 修复发布说明。',
      '',
      '## 0.9.0',
      '',
      '- Previous release.',
    ].join('\n'), 'utf8')
    const { spawn } = createSpawnMock({
      publishedPackages: [{ name: 'repoctl', version: '1.0.0' }],
    })
    const github = {
      ensurePullRequest: vi.fn(),
      ensureTag: vi.fn(),
      ensureRelease: vi.fn(),
    }
    const success = vi.spyOn(logger, 'success').mockImplementation(() => undefined)

    await releaseCi({
      mode: 'publish',
      branch: 'main',
      cwd,
      spawn: spawn as never,
      github: github as never,
      env: { GITHUB_SHA: 'abc123', GITHUB_REPOSITORY: 'acme/repo' },
    })

    expect(github.ensureRelease).toHaveBeenCalledWith(expect.objectContaining({
      tag: 'repoctl@1.0.0',
      name: 'repoctl@1.0.0',
      body: expect.stringContaining('### 🐞 Bug Fixes'),
    }))
    expect(success).toHaveBeenCalledWith('Published packages:\n  - repoctl@1.0.0')
  })

  it('parses pnpm publish summaries for release metadata', () => {
    expect(parsePublishSummary(JSON.stringify({
      publishedPackages: [{ name: 'repoctl', version: '1.2.3' }],
    }))).toEqual([{ name: 'repoctl', version: '1.2.3' }])
    expect(() => parsePublishSummary('{"publishedPackages":[{}]}')).toThrow('invalid package entry')
  })
})
