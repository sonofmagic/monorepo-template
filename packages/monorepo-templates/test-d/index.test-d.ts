import type { TemplateChoice } from '..'
import { expectAssignable, expectType } from 'tsd'
import { assetTargets, getAssetTargets, templateChoices, templateSourceMap, toWorkspaceGitignorePath } from '..'

expectType<string[]>(assetTargets)
expectType<string[]>(getAssetTargets())
expectType<string | undefined>(templateSourceMap['cli'])
expectType<string>(toWorkspaceGitignorePath('gitignore'))
expectAssignable<TemplateChoice[]>(templateChoices)
