import type { Command } from '@icebreakers/monorepo-templates'
import type { ConfigInspection } from '../../commands/config'
import path from 'pathe'
import { logger } from '../../core/logger'
import fs from '../../utils/fs'

interface ConfigInspectCliOptions {
  json?: boolean
  out?: string
}

function formatConfigInspection(inspection: ConfigInspection) {
  const commandKeys = Object.keys(inspection.config.commands ?? {})
  const toolingKeys = Object.keys(inspection.config.tooling ?? {})
  return [
    `cwd: ${inspection.cwd}`,
    `file: ${inspection.file ?? '-'}`,
    `commands: ${commandKeys.length > 0 ? commandKeys.join(', ') : '-'}`,
    `tooling: ${toolingKeys.length > 0 ? toolingKeys.join(', ') : '-'}`,
  ].join('\n')
}

async function emitConfigInspection(inspection: ConfigInspection, opts: ConfigInspectCliOptions, cwd: string) {
  const content = opts.json
    ? JSON.stringify(inspection, null, 2)
    : formatConfigInspection(inspection)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(cwd, opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(cwd, outFile)}`)
}

export function registerConfigCommands(program: Command, cwd: string) {
  const configCommand = program.command('config').alias('cfg').description('配置命令')

  configCommand.command('inspect')
    .description('输出当前 repoctl 配置文件和已解析配置')
    .alias('i')
    .option('--json', '输出 JSON，方便脚本消费')
    .option('--out <file>', '把当前输出写入文件')
    .action(async (opts: ConfigInspectCliOptions) => {
      const { inspectMonorepoConfig } = await import('@/commands')
      await emitConfigInspection(await inspectMonorepoConfig(cwd), opts, cwd)
    })
}
