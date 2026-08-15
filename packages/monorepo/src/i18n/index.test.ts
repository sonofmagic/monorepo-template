import { describe, expect, it } from 'vitest'
import { message, resolveRepoctlLocale } from './index'
import { enMessages } from './locales/en'
import { zhCNMessages } from './locales/zh-CN'

describe('resolveRepoctlLocale', () => {
  it('keeps English and Chinese catalog keys aligned', () => {
    expect(Object.keys(zhCNMessages).sort()).toEqual(Object.keys(enMessages).sort())
  })

  it('defaults to English', () => {
    expect(resolveRepoctlLocale({ argv: [], env: {} })).toBe('en')
  })

  it('prefers --lang over REPOCTL_LANG', () => {
    expect(resolveRepoctlLocale({
      argv: ['node', 'repo', '--lang', 'en'],
      env: { REPOCTL_LANG: 'zh-CN' },
    })).toBe('en')
  })

  it('supports equals syntax and the environment variable', () => {
    expect(resolveRepoctlLocale({ argv: ['--lang=zh-CN'], env: {} })).toBe('zh-CN')
    expect(resolveRepoctlLocale({ argv: [], env: { REPOCTL_LANG: 'zh-CN' } })).toBe('zh-CN')
  })

  it('falls back to English for unsupported environment values', () => {
    expect(resolveRepoctlLocale({ argv: [], env: { REPOCTL_LANG: 'fr' } })).toBe('en')
  })

  it('interpolates typed catalog messages', () => {
    expect(message('quickStart', { cliName: 'repoctl' })).toContain('$ repoctl doctor')
  })
})
