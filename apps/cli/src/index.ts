import { bar } from '@icebreakers/tsup-template'
import { foo, format } from '@icebreakers/unbuild-template'

console.log('Website Bootstrap!')
console.log(foo() + bar(), format('hello world!'))
