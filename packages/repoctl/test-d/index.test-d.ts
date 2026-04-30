import type { MonorepoConfig, MonorepoVitestConfigResult, MonorepoVitestProjectConfigResult, WorkspacePackageSummaryData } from 'repoctl'
import { clearWorkspaceCache, defineMonorepoConfig, defineVitestConfig, defineVitestProjectConfig, getWorkspacePackageSummaries } from 'repoctl'
import { expectType } from 'tsd'

expectType<void>(clearWorkspaceCache())
expectType<Promise<WorkspacePackageSummaryData>>(getWorkspacePackageSummaries('.'))
expectType<MonorepoConfig>(defineMonorepoConfig({}))
expectType<Promise<MonorepoVitestConfigResult>>(defineVitestConfig())
expectType<Promise<MonorepoVitestProjectConfigResult>>(defineVitestProjectConfig())
