import type { Warrior } from '@/interfaces'
import container from '@/inversify.config'
import { TYPES } from '@/types'

const ninja = container.get<Warrior>(TYPES.Warrior)

console.log(ninja.fight())
console.log(ninja.sneak())
