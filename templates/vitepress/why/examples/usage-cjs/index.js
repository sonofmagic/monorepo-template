/* eslint-disable no-console */
const { sayHello } = require('icebreaker-npm-basic-package')
const { sayHello: sayHelloCjs } = require('icebreaker-npm-basic-package-multiple-exports')
const pc = require('picocolors')

sayHello()
sayHelloCjs()
console.log(pc.green('Hello World!'))
