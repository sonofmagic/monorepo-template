import type { TemplateChoice } from '..'
import { expectAssignable, expectType } from 'tsd'
import {
  assetTargets,
  getAssetTargets,
  getTemplateChoice,
  getTemplateChoices,
  getTemplateDefinition,
  getTemplateSource,
  getTemplateTarget,
  isTemplateCategory,
  isTemplateKey,
  templateCategories,
  templateChoices,
  templateSourceMap,
  templateTargetMap,
  toWorkspaceGitignorePath,
} from '..'

expectType<string[]>(assetTargets)
expectType<string[]>(getAssetTargets())
expectType<string | undefined>(templateSourceMap['cli'])
expectType<string | undefined>(templateTargetMap['cli'])
expectType<string>(toWorkspaceGitignorePath('gitignore'))
expectAssignable<TemplateChoice[]>(templateChoices)
expectAssignable<readonly string[]>(templateCategories)
expectAssignable<TemplateChoice[]>(getTemplateChoices())
expectAssignable<TemplateChoice[]>(getTemplateChoices({ category: 'library' }))
expectType<TemplateChoice | undefined>(getTemplateChoice('cli'))
expectType<boolean>(isTemplateCategory('library'))
expectType<boolean>(isTemplateKey('cli'))
expectType<string | undefined>(getTemplateSource('cli'))
expectType<string | undefined>(getTemplateTarget('cli'))
expectType<{ source: string, target: string } | undefined>(getTemplateDefinition('cli'))
