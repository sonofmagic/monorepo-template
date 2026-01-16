/* eslint-disable no-console */
console.log(`esm load ${import.meta.filename}`)

export function sayHello() {
  const message = 'hello world esm'
  console.log(message)
  return message
}
