import set from 'set-value'

describe('index', () => {
  it('foo bar', () => {
    const obj = {}
    set(obj, 'dev.@types/node', '1.1.1', { preservePaths: false })
    expect(obj).toEqual({
      dev: {
        '@types/node': '1.1.1',
      },
    })
  })

  it('foo', () => {
    const obj = {}
    set(obj, '@pnpm/workspace.find-packages'.replaceAll('.', '\\.'), '1.1.1', { preservePaths: false })
    expect(obj).toEqual({
      '@pnpm/workspace.find-packages': '1.1.1',
    })
  })
})
