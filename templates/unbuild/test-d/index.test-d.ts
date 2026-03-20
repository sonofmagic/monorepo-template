import { expectType } from 'tsd'
import { foo, format, getDirname } from '..'

expectType<string>(foo())
expectType<string>(format('icebreaker'))
expectType<string>(getDirname())
