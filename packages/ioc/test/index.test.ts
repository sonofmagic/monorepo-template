import type { Warrior } from '@/interfaces'
import container from '@/inversify.config'
import { TYPES } from '@/types'

const ninja = container.get<Warrior>(TYPES.Warrior)

describe('index', () => {
  it('foo bar', () => {
    expect(ninja.fight()).eql('cut!') // true
    expect(ninja.sneak()).eql('hit!') // true
  })
})
