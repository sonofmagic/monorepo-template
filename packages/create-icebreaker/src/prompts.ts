import process from 'node:process'
import { createInterface } from 'node:readline/promises'
import { formatTemplateList, parseTemplateInput } from './templates'

export async function promptTargetDir(defaultDir: string) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = await rl.question(`项目创建目录（默认 ${defaultDir}）：`)
    return answer.trim() || defaultDir
  }
  finally {
    rl.close()
  }
}

export async function promptTemplates() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    process.stdout.write(`\n可选模板（默认不选择）：\n${formatTemplateList()}\n`)
    const answer = await rl.question('请选择要保留的模板（逗号分隔，直接回车跳过）：')
    const { selections, unknown } = parseTemplateInput(answer)
    if (unknown.length) {
      process.stderr.write(`忽略未知模板：${unknown.join(', ')}\n`)
    }
    return selections
  }
  finally {
    rl.close()
  }
}
