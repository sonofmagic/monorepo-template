import type { Command } from '@icebreakers/monorepo-templates'
import type { InitToolingTarget } from '../../commands/init'
import { initTooling, initToolingTargets } from '../../commands'
import { logger } from '../../core/logger'
import { normalizeToolingTargets } from '../utils'

interface ToolingInitCommandOptions {
  all?: boolean
  force?: boolean
}

export function registerToolingCommands(program: Command, cwd: string) {
  const toolingCommand = program.command('tooling').alias('tg').description('工程化配置命令')

  toolingCommand.command('init')
    .description(`生成 tooling 配置（可选值：${initToolingTargets.join(', ')}）`)
    .alias('i')
    .argument('[tooling...]')
    .option('-a, --all', '生成全部 tooling 配置')
    .option('-f, --force', '覆盖已存在的 tooling 配置文件')
    .action(async (tooling: string[] = [], opts: ToolingInitCommandOptions) => {
      const normalizedTooling: InitToolingTarget[] | undefined = normalizeToolingTargets(tooling)
      await initTooling(cwd, {
        ...(normalizedTooling ? { targets: normalizedTooling } : {}),
        ...(opts.all !== undefined ? { all: opts.all } : {}),
        ...(opts.force !== undefined ? { force: opts.force } : {}),
      })
      logger.success('tooling init finished!')
    })
}
