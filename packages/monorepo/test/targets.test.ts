import { getAssetTargets } from '@/commands/upgrade/targets'

describe('targets', () => {
  it('normal', () => {
    const targets = getAssetTargets()
    expect(targets).toMatchSnapshot()
  })

  it('raw', () => {
    const targets = getAssetTargets(true)
    expect(targets).toMatchSnapshot()
  })
})
