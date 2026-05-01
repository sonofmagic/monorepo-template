import type { GetTemplateChoicesOptions, SuggestTemplateKeyOptions, TemplateCategory, TemplateChoice, TemplateDefinition } from './types'
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

export function getTemplateKeys(options: GetTemplateChoicesOptions = {}) {
  return getTemplateChoices(options).map(choice => choice.key)
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

function getEditDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex]

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1
      current[rightIndex] = Math.min(
        (current[rightIndex - 1] ?? 0) + 1,
        (previous[rightIndex] ?? 0) + 1,
        (previous[rightIndex - 1] ?? 0) + substitutionCost,
      )
    }

    previous.splice(0, previous.length, ...current)
  }

  return previous[right.length] ?? 0
}

function getTemplateSuggestionThreshold(value: string) {
  if (value.length <= 4) {
    return 1
  }
  if (value.length <= 8) {
    return 2
  }
  return 3
}

export function suggestTemplateKey(key: string, options: SuggestTemplateKeyOptions = {}) {
  const normalizedKey = key.trim().toLowerCase()
  if (!normalizedKey) {
    return undefined
  }

  const keys = options.keys ? [...options.keys] : getTemplateKeys(options)
  const prefixMatch = keys.find((candidate) => {
    const normalizedCandidate = candidate.toLowerCase()
    return normalizedCandidate.startsWith(normalizedKey) || normalizedKey.startsWith(normalizedCandidate)
  })
  if (prefixMatch) {
    return prefixMatch
  }

  const [best] = keys
    .map(candidate => ({
      key: candidate,
      distance: getEditDistance(normalizedKey, candidate.toLowerCase()),
    }))
    .sort((left, right) => left.distance - right.distance || left.key.localeCompare(right.key))

  if (!best || best.distance > getTemplateSuggestionThreshold(normalizedKey)) {
    return undefined
  }

  return best.key
}
