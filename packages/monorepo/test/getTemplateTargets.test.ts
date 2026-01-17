import { getTemplateTargets } from './helpers/getTemplateTargets'

describe('getTemplateTargets', () => {
  it('should work', async () => {
    const targets = await getTemplateTargets()
    expect(targets).toMatchSnapshot()
  })
})
