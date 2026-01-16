import { checkbox, input } from '@icebreakers/monorepo-templates'
import { templateChoices } from './templates'

export async function promptTargetDir(defaultDir: string) {
  const answer = await input({
    message: `项目创建目录（默认 ${defaultDir}）：`,
    default: defaultDir,
  })
  return (answer?.trim?.() ?? defaultDir) || defaultDir
}

export async function promptTemplates() {
  const selections = await checkbox({
    message: '请选择要保留的模板（默认不选择）：',
    choices: templateChoices.map(item => ({
      name: `${item.key} - ${item.label}`,
      value: item.key,
    })),
  })
  return selections
}
