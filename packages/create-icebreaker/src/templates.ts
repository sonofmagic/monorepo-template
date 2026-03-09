import type { TemplateChoice } from '@icebreakers/monorepo-templates'
import { templateChoices } from '@icebreakers/monorepo-templates'

const templateTokenSplitPattern = /[,\s]+/
const numericTemplatePattern = /^\d+$/

export { templateChoices }
export type { TemplateChoice }

export function formatTemplateList() {
  return templateChoices.map((item, index) => {
    return `  ${index + 1}) ${item.key} - ${item.label}`
  }).join('\n')
}

export function parseTemplateInput(input: string) {
  const selections = new Set<string>()
  const unknown: string[] = []
  const tokens = input
    .split(templateTokenSplitPattern)
    .map(token => token.trim())
    .filter(Boolean)
  for (const token of tokens) {
    const normalized = token.toLowerCase()
    if (numericTemplatePattern.test(normalized)) {
      const index = Number(normalized) - 1
      const choice = templateChoices[index]
      if (choice) {
        selections.add(choice.key)
      }
      else {
        unknown.push(token)
      }
      continue
    }
    const match = templateChoices.find(item => item.key === normalized)
    if (match) {
      selections.add(match.key)
    }
    else {
      unknown.push(token)
    }
  }
  return {
    selections: [...selections],
    unknown,
  }
}

export function resolveTemplateSelections(input?: string) {
  if (!input) {
    return { selections: [], unknown: [] }
  }
  return parseTemplateInput(input)
}

export function getTemplateByKey(key: string) {
  return templateChoices.find(item => item.key === key)
}
