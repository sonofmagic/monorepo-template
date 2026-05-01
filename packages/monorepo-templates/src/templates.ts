import type { GetTemplateChoicesOptions, TemplateCategory, TemplateChoice, TemplateDefinition } from './types'
import { templateChoices as rawTemplateChoices } from '../template-data.mjs'

export const templateCategories = ['app', 'docs', 'library', 'service', 'tool'] as const satisfies readonly TemplateCategory[]

const choices = rawTemplateChoices as TemplateChoice[]
const categorySet = new Set<TemplateCategory>(templateCategories)

function cloneTemplateChoice(choice: TemplateChoice): TemplateChoice {
  return { ...choice }
}

export function isTemplateCategory(value: string): value is TemplateCategory {
  return categorySet.has(value as TemplateCategory)
}

export function getTemplateChoices(options: GetTemplateChoicesOptions = {}) {
  const { category } = options
  const filtered = category
    ? choices.filter(choice => choice.category === category)
    : choices

  return filtered.map(cloneTemplateChoice)
}

export function getTemplateChoice(key: string) {
  const choice = choices.find(item => item.key === key)
  return choice ? cloneTemplateChoice(choice) : undefined
}

export function isTemplateKey(key: string) {
  return choices.some(choice => choice.key === key)
}

export function getTemplateDefinition(key: string): TemplateDefinition | undefined {
  const choice = getTemplateChoice(key)
  if (!choice) {
    return undefined
  }
  return {
    source: choice.source,
    target: choice.target,
  }
}

export function getTemplateSource(key: string) {
  return getTemplateChoice(key)?.source
}

export function getTemplateTarget(key: string) {
  return getTemplateChoice(key)?.target
}
