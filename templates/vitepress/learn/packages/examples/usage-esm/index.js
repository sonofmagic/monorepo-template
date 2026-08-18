/* eslint-disable no-console */
import { sayHello } from 'icebreaker-npm-basic-package'
import { sayHello as sayHello2 } from 'icebreaker-npm-basic-package-multiple-exports'
import pc from 'picocolors'

sayHello()
sayHello2()
console.log(pc.green('Hello World!'))
