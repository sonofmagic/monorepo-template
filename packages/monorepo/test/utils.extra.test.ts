import { describe, expect, it } from 'vitest'

import * as commandExports from '@/commands'
import * as coreExports from '@/core'
import * as rootExports from '@/index'
import {
  escapeStringRegexp,
  isIgnorableFsError,
  isMatch,
  toPublishGitignorePath,
  toWorkspaceGitignorePath,
} from '@/utils'

describe('utility helpers', () => {
  it('identifies ignorable fs errors', () => {
    expect(isIgnorableFsError({ code: 'ENOENT' } as NodeJS.ErrnoException)).toBe(true)
    expect(isIgnorableFsError({ code: 'EBUSY' } as NodeJS.ErrnoException)).toBe(true)
    expect(isIgnorableFsError({ code: 'EEXIST' } as NodeJS.ErrnoException)).toBe(true)
    expect(isIgnorableFsError({ code: 'EPERM' } as NodeJS.ErrnoException)).toBe(false)
    expect(isIgnorableFsError(undefined)).toBe(false)
  })

  it('escapes special characters for regular expressions', () => {
    const escaped = escapeStringRegexp('file(name)?.ts')
    expect(escaped).toBe('file\\(name\\)\\?\\.ts')

    const escapedWithHyphen = escapeStringRegexp('name-with-dash')
    expect(escapedWithHyphen).toBe('name\\x2dwith\\x2ddash')
  })

  it('performs regex array matching correctly', () => {
    const patterns = [/^packages\//, /README\.md$/]
    expect(isMatch('packages/pkg-a/index.ts', patterns)).toBe(true)
    expect(isMatch('docs/guide.md', patterns)).toBe(false)
  })

  it('handles gitignore basename swaps for edge cases', () => {
    expect(toPublishGitignorePath('')).toBe('')
    expect(toWorkspaceGitignorePath('')).toBe('')
    expect(toPublishGitignorePath('nested/gitignore/file.txt')).toBe('nested/gitignore/file.txt')
    expect(toWorkspaceGitignorePath('nested/gitignore/file.txt')).toBe('nested/gitignore/file.txt')
  })

  it('re-exports expected modules from public entrypoints', () => {
    expect(rootExports).toHaveProperty('createNewProject')
    expect(commandExports).toHaveProperty('cleanProjects')
    expect(coreExports).toHaveProperty('createContext')
  })
})
