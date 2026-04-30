import type { MonorepoConfig, MonorepoVitestConfigResult, MonorepoVitestProjectConfigResult } from 'repoctl'
import { clearWorkspaceCache, defineMonorepoConfig, defineVitestConfig, defineVitestProjectConfig } from 'repoctl'
import { expectType } from 'tsd'

expectType<void>(clearWorkspaceCache())
expectType<MonorepoConfig>(defineMonorepoConfig({}))
expectType<Promise<MonorepoVitestConfigResult>>(defineVitestConfig())
expectType<Promise<MonorepoVitestProjectConfigResult>>(defineVitestProjectConfig())
