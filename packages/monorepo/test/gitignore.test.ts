import { describe, expect, it } from 'vitest'

import { isGitignoreFile, toPublishGitignorePath, toWorkspaceGitignorePath } from '@/utils/gitignore'

describe('gitignore helpers', () => {
  it('converts workspace paths to publish-safe variants', () => {
    expect(toPublishGitignorePath('.gitignore')).toBe('gitignore')
    expect(toPublishGitignorePath('packages/template/.gitignore')).toBe('packages/template/gitignore')
    expect(toPublishGitignorePath('docs/README.md')).toBe('docs/README.md')
    expect(toPublishGitignorePath('packages\\template\\.gitignore')).toBe('packages\\template\\gitignore')
    expect(toPublishGitignorePath('gitignore/')).toBe('gitignore/')
  })

  it('converts publish-safe paths back to workspace variants', () => {
    expect(toWorkspaceGitignorePath('gitignore')).toBe('.gitignore')
    expect(toWorkspaceGitignorePath('templates/foo/gitignore')).toBe('templates/foo/.gitignore')
    expect(toWorkspaceGitignorePath('docs/README.md')).toBe('docs/README.md')
    expect(toWorkspaceGitignorePath('templates\\foo\\gitignore')).toBe('templates\\foo\\.gitignore')
    expect(toWorkspaceGitignorePath('gitignore/')).toBe('.gitignore/')
  })

  it('identifies gitignore filenames regardless of prefix', () => {
    expect(isGitignoreFile('.gitignore')).toBe(true)
    expect(isGitignoreFile('gitignore')).toBe(true)
    expect(isGitignoreFile('templates/foo/gitignore')).toBe(true)
    expect(isGitignoreFile('templates\\foo\\gitignore')).toBe(true)
    expect(isGitignoreFile('README.md')).toBe(false)
  })
})
