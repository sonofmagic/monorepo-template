import type { Command } from '@icebreakers/monorepo-templates'
import { logger } from '../../core/logger'
import { runCreateFlow } from './package/create-flow'

export function registerPackageCommands(program: Command, cwd: string) {
  const packageCommand = program.command('package').alias('pkg').description('子包命令')

  packageCommand.command('create')
    .description('创建一个新的子包')
    .alias('new')
    .argument('[name]')
    .action(async (inputName: string) => {
      await runCreateFlow(cwd, inputName)
      logger.success('package create finished!')
    })
}
