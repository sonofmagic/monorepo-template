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
})
