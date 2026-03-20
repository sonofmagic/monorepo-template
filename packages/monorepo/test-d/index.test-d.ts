/* eslint-disable perfectionist/sort-imports */
import type { CliOpts, CreateChoiceOption, PackageJson } from '..'
import { createMonorepoCommitlintConfig, createMonorepoEslintConfig, createMonorepoLintStagedConfig, createMonorepoStylelintConfig, createMonorepoVitestConfig, getCreateChoices, getFileHash, getTemplateMap, templateMap } from '..'
import { expectAssignable, expectType } from 'tsd'

expectType<string>(getFileHash('demo'))
expectType<'tsup'>(templateMap.tsup.source)
expectAssignable<CreateChoiceOption[]>(getCreateChoices())

const templates = getTemplateMap()

expectType<string | undefined>(templates['unbuild']?.source)
expectAssignable<CliOpts>({ cwd: '.', core: true })
expectAssignable<PackageJson>({ name: 'demo' })
expectAssignable<object>(createMonorepoCommitlintConfig())
expectAssignable<object>(createMonorepoEslintConfig())
expectAssignable<object>(createMonorepoStylelintConfig())
expectAssignable<Record<string, unknown>>(createMonorepoLintStagedConfig())
expectAssignable<{ test: object }>(createMonorepoVitestConfig())
