import type { MonorepoConfig, MonorepoVitestConfigResult, MonorepoVitestProjectConfigResult } from 'repoctl'
import { defineMonorepoConfig, defineVitestConfig, defineVitestProjectConfig } from 'repoctl'
import { expectType } from 'tsd'

expectType<MonorepoConfig>(defineMonorepoConfig({}))
expectType<Promise<MonorepoVitestConfigResult>>(defineVitestConfig())
expectType<Promise<MonorepoVitestProjectConfigResult>>(defineVitestProjectConfig())
