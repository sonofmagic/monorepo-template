import { expectType } from 'tsd'
import { greet, VERSION } from '..'

expectType<string>(greet('icebreaker'))
expectType<'0.0.0'>(VERSION)
