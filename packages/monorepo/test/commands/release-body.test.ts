import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it } from 'vitest'
import { buildReleasePullRequestBody } from '@/commands/release/body'

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

    expect(body).toContain('# Releases')
    expect(body).toContain('## @acme/demo@2.0.0')
    expect(body).toContain('- 增加新的发布能力。')
    expect(body).not.toContain('旧版本内容')
    expect(body).not.toContain('@acme/unchanged')
  })
})
