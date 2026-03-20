import { expectAssignable, expectType } from 'tsd'
import { bar, getDirname, xx } from '..'

expectType<string>(bar())
expectType<string>(getDirname())
expectAssignable<xx>(xx.dd)
