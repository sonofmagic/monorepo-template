import type { Command } from '@icebreakers/monorepo-templates'
import type { EnvInfo } from '../../commands/env'
import path from 'pathe'
import { logger } from '../../core/logger'
import fs from '../../utils/fs'

interface EnvInfoCliOptions {
  json?: boolean
  out?: string
}

function formatEnvInfo(info: EnvInfo) {
  return [
    `cwd: ${info.cwd}`,
    `workspace: ${info.workspaceDir}`,
    `packages: ${info.packageCount}`,
    `node: ${info.nodeVersion}${info.nodeRange ? ` (${info.nodeRange})` : ''}`,
    `pnpm: ${info.pnpmVersion ?? '-'}`,
    `packageManager: ${info.packageManager ?? '-'}`,
    `platform: ${info.platform}/${info.arch}`,
  ].join('\n')
}

async function emitEnvInfo(info: EnvInfo, opts: EnvInfoCliOptions, cwd: string) {
  const content = opts.json
    ? JSON.stringify(info, null, 2)
    : formatEnvInfo(info)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(cwd, opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(cwd, outFile)}`)
}

export function registerEnvCommands(program: Command, cwd: string) {
  const envCommand = program.command('env').alias('e').description('环境命令')

  envCommand.command('info')
    .description('输出当前仓库环境信息')
    .alias('i')
    .option('--json', '输出 JSON，方便脚本消费')
    .option('--out <file>', '把当前输出写入文件')
    .action(async (opts: EnvInfoCliOptions) => {
      const { collectEnvInfo } = await import('@/commands')
      await emitEnvInfo(await collectEnvInfo(cwd), opts, cwd)
    })

  envCommand.command('mirror')
    .description('设置 VS Code binary mirror')
    .alias('m')
    .action(async () => {
      const { setVscodeBinaryMirror } = await import('@/commands')
      await setVscodeBinaryMirror(cwd)
      logger.success('env mirror finished!')
    })
}
