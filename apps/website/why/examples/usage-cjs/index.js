const { sayHello } = require('icebreaker-npm-basic-package')
const { sayHello: sayHelloCjs } = require('icebreaker-npm-basic-package-multiple-exports')

sayHello()
sayHelloCjs()
