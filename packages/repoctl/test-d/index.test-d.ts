import type { MonorepoConfig, MonorepoVitestConfigResult } from 'repoctl'
import { defineMonorepoConfig, defineVitestConfig } from 'repoctl'
import { expectType } from 'tsd'

expectType<MonorepoConfig>(defineMonorepoConfig({}))
expectType<Promise<MonorepoVitestConfigResult>>(defineVitestConfig())
