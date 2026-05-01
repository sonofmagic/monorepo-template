/* eslint-disable perfectionist/sort-imports */
import type { CliOpts, CreateChoiceOption, CreateNewProjectPlan, MonorepoCommitlintConfig, MonorepoTsconfig, MonorepoVitestConfigResult, MonorepoVitestProjectConfigResult, PackageJson, WorkspacePackageSummaryData } from '..'
import { clearWorkspaceCache, createMonorepoCommitlintConfig, createMonorepoEslintConfig, createMonorepoLintStagedConfig, createMonorepoStylelintConfig, createMonorepoTsconfig, createMonorepoVitestConfig, defineCommitlintConfig, defineVitestConfig, defineVitestProjectConfig, getCreateChoices, getFileHash, getTemplateMap, getWorkspacePackageSummaries, resolveCreateNewProjectPlan, templateMap } from '..'
import { expectAssignable, expectType } from 'tsd'

expectType<string>(getFileHash('demo'))
expectType<void>(clearWorkspaceCache())
expectType<Promise<WorkspacePackageSummaryData>>(getWorkspacePackageSummaries('.'))
expectType<'tsdown'>(templateMap.tsdown.source)
expectAssignable<CreateChoiceOption[]>(getCreateChoices())
expectType<Promise<CreateNewProjectPlan>>(resolveCreateNewProjectPlan({ cwd: '.', type: 'tsdown' }))

const templates = getTemplateMap()

expectType<string | undefined>(templates['tsdown']?.source)
expectAssignable<CliOpts>({ cwd: '.', core: true })
expectAssignable<PackageJson>({ name: 'demo' })
expectAssignable<object>(createMonorepoCommitlintConfig())
expectAssignable<object>(createMonorepoEslintConfig())
expectAssignable<object>(createMonorepoStylelintConfig())
expectAssignable<MonorepoTsconfig>(createMonorepoTsconfig())
expectAssignable<Record<string, unknown>>(createMonorepoLintStagedConfig())
expectAssignable<{ test: object }>(createMonorepoVitestConfig())
expectType<Promise<MonorepoCommitlintConfig>>(defineCommitlintConfig({ cwd: '.' }))
expectType<Promise<MonorepoVitestConfigResult>>(defineVitestConfig({ options: { includeWorkspaceRootConfig: false } }))
expectType<Promise<MonorepoVitestProjectConfigResult>>(defineVitestProjectConfig({ options: { environment: 'node' } }))
