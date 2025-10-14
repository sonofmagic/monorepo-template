/* eslint-disable no-console */
console.log(`cjs load ${__filename}`)

function sayHello() {
  const message = 'hello world cjs'
  console.log(message)
  return message
}

module.exports = {
  sayHello,
}
