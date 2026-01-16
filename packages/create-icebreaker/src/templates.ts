import type { TemplateChoice } from '@icebreakers/monorepo-templates'
import { templateChoices } from '@icebreakers/monorepo-templates'

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
    .split(/[,\\s]+/)
    .map(token => token.trim())
    .filter(Boolean)
  for (const token of tokens) {
    const normalized = token.toLowerCase()
    if (/^\\d+$/.test(normalized)) {
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
    selections: Array.from(selections),
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
