import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it } from 'vitest'
import { buildGitHubReleaseBody, buildReleasePullRequestBody, readPendingIntentCommits } from '@/commands/release/body'
import { uniqueCommits } from '@/commands/release/notes/model'

const tempRoots: string[] = []

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map(root => rm(root, { force: true, recursive: true })))
})

describe('release pull request body', () => {
  it('includes the current package versions and generated changelog entries', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'repo-release-body-'))
    tempRoots.push(cwd)
    const packageDir = path.join(cwd, 'packages', 'demo')
    const unchangedDir = path.join(cwd, 'packages', 'unchanged')
    await mkdir(packageDir, { recursive: true })
    await mkdir(unchangedDir, { recursive: true })
    await writeFile(path.join(cwd, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n', 'utf8')
    await writeFile(path.join(packageDir, 'package.json'), JSON.stringify({ name: '@acme/demo', version: '2.0.0' }), 'utf8')
    await writeFile(path.join(packageDir, 'CHANGELOG.md'), [
      '# @acme/demo',
      '',
      '## 2.0.0',
      '',
      '### Minor Changes',
      '',
      '- 增加新的发布能力。',
      '',
      '## 1.0.0',
      '',
      '### Patch Changes',
      '',
      '- 旧版本内容。',
      '',
    ].join('\n'), 'utf8')
    await writeFile(path.join(unchangedDir, 'package.json'), JSON.stringify({ name: '@acme/unchanged', version: '1.0.0' }), 'utf8')
    await writeFile(path.join(unchangedDir, 'CHANGELOG.md'), '# @acme/unchanged\n\n## 1.0.0\n\n- 不应重复发布。\n', 'utf8')

    const previousVersions = new Map([
      ['@acme/demo', '1.0.0'],
      ['@acme/unchanged', '1.0.0'],
    ])
    const body = await buildReleasePullRequestBody(cwd, previousVersions)

    expect(body).toBe([
      '# Release Notes',
      '',
      '> 1 package updated · 1 change',
      '',
      '## 🚀 Features',
      '',
      '- **[@acme/demo@2.0.0](https://www.npmjs.com/package/@acme/demo/v/2.0.0)**: 增加新的发布能力。',
      '',
      '## Packages',
      '',
      '| Package | From | To |',
      '| --- | --- | --- |',
      '| `@acme/demo` | [`1.0.0`](https://www.npmjs.com/package/@acme/demo/v/1.0.0) | [`2.0.0`](https://www.npmjs.com/package/@acme/demo/v/2.0.0) |',
    ].join('\n'))
    expect(body).not.toContain('This PR was generated')
    expect(body).not.toContain('.changeset/ledger.yaml')
  })

  it('links source commits, pull requests, and issues from release metadata', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'repo-release-links-'))
    tempRoots.push(cwd)
    const packageDir = path.join(cwd, 'packages', 'demo')
    await mkdir(packageDir, { recursive: true })
    await writeFile(path.join(cwd, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n', 'utf8')
    await writeFile(path.join(packageDir, 'package.json'), JSON.stringify({ name: '@acme/demo', version: '2.0.0' }), 'utf8')
    await writeFile(path.join(packageDir, 'CHANGELOG.md'), '# @acme/demo\n\n## 2.0.0\n\n### Patch Changes\n\n- 修复 #17。\n', 'utf8')

    const body = await buildReleasePullRequestBody(cwd, undefined, {
      repository: 'acme/repo',
      serverUrl: 'https://github.com',
      commits: [{
        sha: '0123456789abcdef0123456789abcdef01234567',
        subject: 'fix: resolve release issue (#42)',
      }],
    })

    expect(body).toContain('## 🐞 Bug Fixes')
    expect(body).toContain('[`0123456`](https://github.com/acme/repo/commit/0123456789abcdef0123456789abcdef01234567)')
    expect(body).toContain('[#42](https://github.com/acme/repo/pull/42)')
    expect(body).toContain('[#17](https://github.com/acme/repo/issues/17)')
  })

  it('groups entries by semantic category and renders package releases', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'repo-release-categories-'))
    tempRoots.push(cwd)
    const packageDir = path.join(cwd, 'packages', 'demo')
    await mkdir(packageDir, { recursive: true })
    await writeFile(path.join(cwd, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n', 'utf8')
    await writeFile(path.join(packageDir, 'package.json'), JSON.stringify({ name: '@acme/demo', version: '2.0.0' }), 'utf8')
    await writeFile(path.join(packageDir, 'CHANGELOG.md'), [
      '# @acme/demo',
      '',
      '## 2.0.0',
      '',
      '### Patch Changes',
      '',
      '- 新增导出能力。',
      '- 修复解析错误。',
      '- Dependencies updated.',
      '',
      '## 1.0.0',
      '',
      '- Previous release.',
    ].join('\n'), 'utf8')
    const metadata = {
      repository: 'acme/repo',
      serverUrl: 'https://github.com',
      commits: [
        { sha: '1111111111111111111111111111111111111111', subject: 'feat: expose API', author: 'alice', packages: ['@acme/demo'], summary: '新增导出能力。' },
        { sha: '2222222222222222222222222222222222222222', subject: 'fix: parser', author: 'bob', packages: ['@acme/demo'], summary: '修复解析错误。' },
      ],
    }

    const body = await buildReleasePullRequestBody(cwd, undefined, metadata)
    const release = await buildGitHubReleaseBody(cwd, '@acme/demo', '2.0.0', metadata)

    expect(body.indexOf('## 🚀 Features')).toBeLessThan(body.indexOf('## 🐞 Bug Fixes'))
    expect(body).toContain('<summary>🧰 Maintenance</summary>')
    expect(body).toContain('Thanks to @alice · @bob')
    expect(body).toContain('https://www.npmjs.com/package/@acme/demo/v/2.0.0')
    expect(release).toContain('### 🚀 Features')
    expect(release).toContain('[@acme/demo@2.0.0](https://www.npmjs.com/package/@acme/demo/v/2.0.0)')
    expect(release).not.toContain('## Packages')
    expect(release).toContain('View changes on GitHub')
  })

  it('renders an empty package release without empty headings', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'repo-release-empty-'))
    tempRoots.push(cwd)
    await writeFile(path.join(cwd, 'pnpm-workspace.yaml'), 'packages: []\n', 'utf8')

    await expect(buildGitHubReleaseBody(cwd, 'missing', '1.0.0')).resolves.toBe('No significant changes.')
  })

  it('merges package ownership when one commit adds multiple intents', () => {
    expect(uniqueCommits([
      { sha: 'abc123', subject: 'feat: release', packages: ['first'], summary: 'First change.' },
      { sha: 'abc123', subject: 'feat: release', packages: ['second'], summary: 'Second change.' },
    ])).toEqual([{
      sha: 'abc123',
      subject: 'feat: release',
      packages: ['first', 'second'],
      summary: 'First change.',
      summaries: ['First change.', 'Second change.'],
    }])
  })

  it('captures the commit that introduced each pending intent', async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), 'repo-release-intent-'))
    tempRoots.push(cwd)
    await mkdir(path.join(cwd, '.changeset'), { recursive: true })
    await writeFile(path.join(cwd, '.changeset', 'pending.md'), '---\nrepoctl: patch\n---\n\nRelease change.\n', 'utf8')
    await writeFile(path.join(cwd, '.changeset', 'README.md'), 'Documentation.\n', 'utf8')
    const calls: string[][] = []
    const sha = '0123456789abcdef0123456789abcdef01234567'
    const spawn = (command: string, args: string[]) => {
      calls.push([command, ...args])
      if (args[0] === 'log') {
        return { status: 0, stdout: sha }
      }
      return { status: 0, stdout: `${sha}\x1Ffix: release change (#42)\x1FCloses #17` }
    }

    const commits = await readPendingIntentCommits({ cwd, spawn: spawn as never })

    expect(commits).toEqual([{
      sha,
      subject: 'fix: release change (#42)',
      body: 'Closes #17',
      packages: ['repoctl'],
      summary: 'Release change.',
    }])
    expect(calls).toEqual([
      ['git', 'log', '-1', '--format=%H', '--', '.changeset/pending.md'],
      ['git', 'show', '-s', '--format=%H%x1F%s%x1F%b%x1F%an', sha],
    ])
  })
})
