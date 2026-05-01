import type { CreateNewProjectPlan, MonorepoConfig, MonorepoVitestConfigResult, MonorepoVitestProjectConfigResult, TemplateHealthReport, WorkspacePackageSummaryData } from 'repoctl'
import { checkTemplates, clearWorkspaceCache, defineMonorepoConfig, defineVitestConfig, defineVitestProjectConfig, getWorkspacePackageSummaries, resolveCreateNewProjectPlan } from 'repoctl'
import { expectType } from 'tsd'

expectType<void>(clearWorkspaceCache())
expectType<Promise<WorkspacePackageSummaryData>>(getWorkspacePackageSummaries('.'))
expectType<MonorepoConfig>(defineMonorepoConfig({}))
expectType<Promise<MonorepoVitestConfigResult>>(defineVitestConfig())
expectType<Promise<MonorepoVitestProjectConfigResult>>(defineVitestProjectConfig())
expectType<Promise<CreateNewProjectPlan>>(resolveCreateNewProjectPlan({ cwd: '.', type: 'tsdown' }))
expectType<Promise<TemplateHealthReport>>(checkTemplates())
