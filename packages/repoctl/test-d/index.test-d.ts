import type { CreateNewProjectPlan, MonorepoConfig, MonorepoVitestConfigResult, MonorepoVitestProjectConfigResult, TemplateHealthReport, WorkspacePackageSummaryData } from 'repoctl'
import { checkTemplates, clearWorkspaceCache, defineMonorepoConfig, defineVitestConfig, defineVitestProjectConfig, getWorkspacePackageSummaries, resolveCreateNewProjectPlan } from 'repoctl'
import { defineEslintConfig } from 'repoctl/tooling'
import { expectAssignable, expectType } from 'tsd'

expectType<void>(clearWorkspaceCache())
expectType<Promise<WorkspacePackageSummaryData>>(getWorkspacePackageSummaries('.'))
expectType<MonorepoConfig>(defineMonorepoConfig({}))
expectType<Promise<MonorepoVitestConfigResult>>(defineVitestConfig())
expectType<Promise<MonorepoVitestProjectConfigResult>>(defineVitestProjectConfig())
expectAssignable<Promise<object>>(defineEslintConfig({ options: { ignores: ['dist/**'] }, configs: [{ rules: { 'no-console': 'off' } }] }))
expectAssignable<Promise<object>>(defineEslintConfig({ ignores: ['dist/**'] }, { rules: { 'no-alert': 'off' } }))
expectType<Promise<CreateNewProjectPlan>>(resolveCreateNewProjectPlan({ cwd: '.', type: 'tsdown' }))
expectType<Promise<TemplateHealthReport>>(checkTemplates())
