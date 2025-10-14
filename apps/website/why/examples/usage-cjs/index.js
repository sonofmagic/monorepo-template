/* eslint-disable no-console */
// import c from 'chalk'
// const c = require('chalk')
const { sayHello } = require('icebreaker-npm-basic-package')
const { sayHello: sayHelloCjs } = require('icebreaker-npm-basic-package-multiple-exports')

sayHello()
sayHelloCjs()

import('chalk').then(({ default: c }) => {
  console.log(c.green('Hello World!'))
})
