import { createRequire } from 'node:module'

const require = createRequire(import.meta.filename)

const { sayHello } = require('icebreaker-npm-basic-package')

sayHello()
