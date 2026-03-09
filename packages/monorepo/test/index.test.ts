import { setByPath } from '@/utils'

describe('index', () => {
  it('foo bar', () => {
    const obj = {}
    setByPath(obj, 'dev.@types/node', '1.1.1')
    expect(obj).toEqual({
      dev: {
        '@types/node': '1.1.1',
      },
    })
  })

  it('foo', () => {
    const obj = {}
    setByPath(obj, '@pnpm/workspace.find-packages'.replaceAll('.', '\\.'), '1.1.1')
    expect(obj).toEqual({
      '@pnpm/workspace.find-packages': '1.1.1',
    })
  })
})
