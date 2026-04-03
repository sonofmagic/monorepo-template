import type { Command } from '@icebreakers/monorepo-templates'
import { setVscodeBinaryMirror } from '../../commands'
import { logger } from '../../core/logger'

export function registerEnvCommands(program: Command, cwd: string) {
  const envCommand = program.command('env').alias('e').description('环境命令')

  envCommand.command('mirror')
    .description('设置 VS Code binary mirror')
    .alias('m')
    .action(async () => {
      await setVscodeBinaryMirror(cwd)
      logger.success('env mirror finished!')
    })
}
