console.log(`cjs load ${__filename}`)

function sayHello() {
  console.log('hello world cjs')
}

module.exports = {
  sayHello,
}
