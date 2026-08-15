import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { prepareStable, publishStable, releaseCi } from '@/commands/release'
import { cleanupReleaseTempRoots, createSpawnMock, createTempWorkspace, writePendingIntent } from './release-fixtures'

afterEach(async () => {
  vi.restoreAllMocks()
  await cleanupReleaseTempRoots()
})

describe('release lifecycle configuration', () => {
  it('runs configured version lifecycle scripts in order', async () => {
    const cwd = await createTempWorkspace('main')
    await writePendingIntent(cwd)
    const { calls, spawn } = createSpawnMock({ diffStatus: 1 })

    await prepareStable({
      branch: 'main',
      cwd,
      config: {
        qualityScripts: ['quality:release', 'test:packages'],
        hooks: {
          beforeVersion: ['catalog:sync'],
          afterVersion: ['versions:check'],
        },
      },
      spawn: spawn as never,
    })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'catalog:sync'] },
      { command: 'pnpm', args: ['run', 'quality:release'] },
      { command: 'pnpm', args: ['run', 'test:packages'] },
      { command: 'pnpm', args: ['version', '-r', '--no-git-checks'] },
      { command: 'pnpm', args: ['run', 'versions:check'] },
      { command: 'git', args: ['diff', '--quiet', '--exit-code'] },
    ])
  })

  it('stops the lifecycle when a configured script fails', async () => {
    const cwd = await createTempWorkspace('main')
    await writePendingIntent(cwd)
    const { calls, spawn } = createSpawnMock({ statuses: { 'pnpm run quality:release': 1 } })

    await expect(prepareStable({
      branch: 'main',
      cwd,
      config: { qualityScripts: ['quality:release'], hooks: { afterVersion: ['versions:check'] } },
      spawn: spawn as never,
    })).rejects.toThrow('command failed: pnpm run quality:release')

    expect(calls).toEqual([{ command: 'pnpm', args: ['run', 'quality:release'] }])
  })

  it('rejects stable publish while change intents are pending', async () => {
    const cwd = await createTempWorkspace('main')
    await writePendingIntent(cwd)
    const { spawn } = createSpawnMock()

    await expect(
      publishStable({ branch: 'main', cwd, spawn: spawn as never }),
    ).rejects.toThrow('found unconsumed change intents')
    expect(spawn).not.toHaveBeenCalled()
  })

  it('runs every lifecycle phase for prerelease packages', async () => {
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
      github: { ensurePullRequest: vi.fn(), ensureRelease: vi.fn(), ensureTag: vi.fn() },
      config: {
        qualityScripts: ['quality:release'],
        hooks: {
          beforeVersion: ['catalog:sync'],
          afterVersion: ['versions:check'],
          beforePublish: ['publish:check'],
          afterPublish: ['release:sync'],
        },
      },
      spawn: spawn as never,
    })

    expect(calls.map(call => call.args.at(-1))).toEqual([
      'catalog:sync',
      'quality:release',
      '--no-git-checks',
      'versions:check',
      '--exit-code',
      '-A',
      'chore(release): alpha [skip ci]',
      'publish:check',
      '--no-git-checks',
      'HEAD:alpha',
      'release:sync',
    ])
    expect(hookEnvs.at(-1)).toMatchObject({
      REPO_RELEASE_PUBLISHED_PACKAGES: JSON.stringify([{ name: 'repoctl', version: '1.1.0-alpha.0' }]),
      REPO_RELEASE_PUBLISH_SUMMARY: path.resolve(cwd, 'pnpm-publish-summary.json'),
    })
  })

  it('runs post-publish hooks when no npm packages were published', async () => {
    const cwd = await createTempWorkspace('main')
    const { calls, spawn } = createSpawnMock()

    await releaseCi({
      mode: 'publish',
      branch: 'main',
      cwd,
      config: {
        qualityScripts: ['quality:release'],
        hooks: { beforePublish: ['publish:check'], afterPublish: ['release:sync'] },
      },
      spawn: spawn as never,
    })

    expect(calls).toEqual([
      { command: 'pnpm', args: ['run', 'quality:release'] },
      { command: 'pnpm', args: ['run', 'publish:check'] },
      { command: 'pnpm', args: ['publish', '-r', '--report-summary', '--provenance', '--no-git-checks'] },
      { command: 'pnpm', args: ['run', 'release:sync'] },
    ])
  })

  it('reuses publish hooks during unpublished-version recovery', async () => {
    const cwd = await createTempWorkspace('main')
    const { calls, spawn } = createSpawnMock({
      publishedPackages: [{ name: 'repoctl', version: '1.0.0' }],
      stdout: {
        'pnpm --filter repoctl exec node -p require(\'./package.json\').version': '1.0.0',
        'npm view repoctl@1.0.0 version': '1.0.0',
      },
    })
    const github = { ensurePullRequest: vi.fn(), ensureRelease: vi.fn(), ensureTag: vi.fn() }

    await releaseCi({
      mode: 'publish-unpublished',
      branch: 'main',
      cwd,
      github,
      config: {
        qualityScripts: ['quality:release'],
        hooks: { beforePublish: ['publish:check'], afterPublish: ['release:sync'] },
      },
      packageName: 'repoctl',
      packageVersion: '1.0.0',
      spawn: spawn as never,
    })

    expect(github.ensureRelease).toHaveBeenCalledOnce()
    expect(calls.slice(1, 3)).toEqual([
      { command: 'pnpm', args: ['run', 'quality:release'] },
      { command: 'pnpm', args: ['run', 'publish:check'] },
    ])
    expect(calls.at(-1)).toEqual({ command: 'pnpm', args: ['run', 'release:sync'] })
  })

  it('propagates post-publish hook failures', async () => {
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
      github: { ensurePullRequest: vi.fn(), ensureRelease: vi.fn(), ensureTag: vi.fn() },
      config: { hooks: { afterPublish: ['release:sync'] } },
      spawn: spawn as never,
    })).rejects.toThrow('command failed: pnpm run release:sync')
  })
})
