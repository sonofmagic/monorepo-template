import { checkbox, input } from '@icebreakers/monorepo-templates'
import { templateChoices } from './templates'

export async function promptTargetDir(defaultDir: string, message: string) {
  const answer = await input({
    message,
    default: defaultDir,
  })
  return (answer?.trim?.() ?? defaultDir) || defaultDir
}

export async function promptTemplates(message: string) {
  const selections = await checkbox({
    message,
    choices: templateChoices.map(item => ({
      name: `${item.key} - ${item.label}`,
      value: item.key,
    })),
  })
  return selections
}
