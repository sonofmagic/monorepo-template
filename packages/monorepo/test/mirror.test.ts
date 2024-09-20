import { setMirror } from '@/monorepo/mirror/utils'

describe('mirror', () => {
  it('setMirror', () => {
    const settingsJson = {}
    setMirror(settingsJson)
    expect(settingsJson).toMatchSnapshot()
  })
})
