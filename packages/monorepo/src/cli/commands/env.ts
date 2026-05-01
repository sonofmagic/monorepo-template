import type { Command } from '@icebreakers/monorepo-templates'
import type { EnvInfo, EnvPaths, EnvSnapshot, EnvSupportBundle } from '../../commands/env'
import process from 'node:process'
import path from 'pathe'
import { logger } from '../../core/logger'
import fs from '../../utils/fs'
import { createEnvInfoOutput, createEnvPathsOutput, createEnvSnapshotOutput } from './env/output'
import { createEnvSupportBundleOutput, hasStrictSupportBundleIssues } from './env/support'

interface EnvInfoCliOptions {
  json?: boolean
  markdown?: boolean
  out?: string
  redact?: boolean
  strict?: boolean
}

async function emitEnvInfo(info: EnvInfo, opts: EnvInfoCliOptions, cwd: string) {
  const content = createEnvInfoOutput(info, opts)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(cwd, opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(cwd, outFile)}`)
}

async function emitEnvPaths(paths: EnvPaths, opts: EnvInfoCliOptions, cwd: string) {
  const content = createEnvPathsOutput(paths, opts)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(cwd, opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(cwd, outFile)}`)
}

async function emitEnvSnapshot(snapshot: EnvSnapshot, opts: EnvInfoCliOptions, cwd: string) {
  const content = createEnvSnapshotOutput(snapshot, opts)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(cwd, opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(cwd, outFile)}`)
}

async function emitEnvSupportBundle(bundle: EnvSupportBundle, opts: EnvInfoCliOptions, cwd: string) {
  const content = createEnvSupportBundleOutput(bundle, opts)

  if (!opts.out) {
    logger.log(content)
  }
  else {
    const outFile = path.resolve(cwd, opts.out)
    await fs.outputFile(outFile, `${content}\n`, 'utf8')
    logger.success(`wrote ${path.relative(cwd, outFile)}`)
  }

  if (opts.strict && hasStrictSupportBundleIssues(bundle)) {
    process.exitCode = 1
  }
}

export function registerEnvCommands(program: Command, cwd: string) {
  const envCommand = program.command('env').alias('e').description('环境命令')

  envCommand.command('info')
    .description('输出当前仓库环境信息')
    .alias('i')
    .option('--json', '输出 JSON，方便脚本消费')
    .option('--markdown', '输出 Markdown，方便粘贴到 issue 或 PR')
    .option('--out <file>', '把当前输出写入文件')
    .option('--redact', '脱敏 workspace/cwd/home 绝对路径后再输出')
    .action(async (opts: EnvInfoCliOptions) => {
      const { collectEnvInfo } = await import('@/commands')
      await emitEnvInfo(await collectEnvInfo(cwd), opts, cwd)
    })

  envCommand.command('snapshot')
    .description('输出排障快照，包含环境、doctor 和 check 计划')
    .alias('s')
    .option('--json', '输出 JSON，方便脚本消费')
    .option('--markdown', '输出 Markdown，方便粘贴到 issue 或 PR')
    .option('--out <file>', '把当前输出写入文件')
    .option('--redact', '脱敏 workspace/cwd/home 绝对路径后再输出')
    .action(async (opts: EnvInfoCliOptions) => {
      const { collectEnvSnapshot } = await import('@/commands')
      await emitEnvSnapshot(await collectEnvSnapshot(cwd), opts, cwd)
    })

  envCommand.command('paths')
    .description('输出当前仓库关键路径和报告建议位置')
    .alias('p')
    .option('--json', '输出 JSON，方便脚本消费')
    .option('--markdown', '输出 Markdown，方便粘贴到 issue 或 PR')
    .option('--out <file>', '把当前输出写入文件')
    .option('--redact', '脱敏 workspace/cwd/home 绝对路径后再输出')
    .action(async (opts: EnvInfoCliOptions) => {
      const { collectEnvPaths } = await import('@/commands')
      await emitEnvPaths(await collectEnvPaths(cwd), opts, cwd)
    })

  envCommand.command('support')
    .description('输出完整排障包，包含环境、路径、配置、doctor 和 check 计划')
    .alias('b')
    .option('--json', '输出 JSON，方便脚本消费')
    .option('--markdown', '输出 Markdown，方便粘贴到 issue 或 PR')
    .option('--out <file>', '把当前输出写入文件')
    .option('--redact', '脱敏 workspace/cwd/home 绝对路径后再输出')
    .option('--strict', '输出排障包后，如果 doctor 有 fail 或 warn 则返回失败码')
    .action(async (opts: EnvInfoCliOptions) => {
      const { collectEnvSupportBundle } = await import('@/commands')
      await emitEnvSupportBundle(await collectEnvSupportBundle(cwd), opts, cwd)
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
