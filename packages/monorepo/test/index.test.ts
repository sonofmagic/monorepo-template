import set from 'set-value'
import path from 'pathe'
import { main } from '@/index'

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

  it.skip('copy', async () => {
    const target = path.resolve(__dirname, './fixtures/assets')
    await main(target)
  })
})
