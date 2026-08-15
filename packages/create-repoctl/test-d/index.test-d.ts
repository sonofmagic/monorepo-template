import type { CreateRepoctlLocale, CreateRepoctlProgramOptions } from '..'
import { expectAssignable, expectType } from 'tsd'

import { createCreateRepoctlProgram, resolveCreateRepoctlLocale } from '..'

expectType<CreateRepoctlLocale>(resolveCreateRepoctlLocale([], {}))
expectAssignable<CreateRepoctlProgramOptions>({ commandName: 'custom-create' })
expectType<ReturnType<typeof createCreateRepoctlProgram>>(createCreateRepoctlProgram())
