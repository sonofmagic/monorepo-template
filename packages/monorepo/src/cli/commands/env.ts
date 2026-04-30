import type { Command } from '@icebreakers/monorepo-templates'
import { logger } from '../../core/logger'

export function registerEnvCommands(program: Command, cwd: string) {
  const envCommand = program.command('env').alias('e').description('环境命令')

  envCommand.command('mirror')
    .description('设置 VS Code binary mirror')
    .alias('m')
    .action(async () => {
      const { setVscodeBinaryMirror } = await import('@/commands')
      await setVscodeBinaryMirror(cwd)
      logger.success('env mirror finished!')
    })
}
