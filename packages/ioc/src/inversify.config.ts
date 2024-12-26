import type { ThrowableWeapon, Warrior, Weapon } from './interfaces'
import { Container } from 'inversify'
import { Katana, Ninja, Shuriken } from './entities'
import { TYPES } from './types'

const container = new Container()
container.bind<Warrior>(TYPES.Warrior).to(Ninja)
container.bind<Weapon>(TYPES.Weapon).to(Katana)
container.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken)

export default container
