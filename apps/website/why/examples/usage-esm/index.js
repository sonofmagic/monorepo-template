/* eslint-disable no-console */
import c from 'chalk'
import { sayHello } from 'icebreaker-npm-basic-package'
import { sayHello as sayHello2 } from 'icebreaker-npm-basic-package-multiple-exports'

sayHello()
sayHello2()
console.log(c.green('Hello World!'))
