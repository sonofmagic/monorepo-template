import { foo, format, getDirname } from '@/index'

describe('index', () => {
  it('foo bar', () => {
    expect(foo()).toBe('bar')
  })

  it('format uppercases alphabetical characters', () => {
    expect(format('abc-123')).toBe('ABC-123')
  })

  it('getDirname exposes template directory path', () => {
    const dirname = getDirname()
    expect(typeof dirname).toBe('string')
    expect(dirname.length).toBeGreaterThan(0)
    expect(dirname).toContain('unbuild-template')
  })
})
