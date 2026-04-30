import type { Command } from '@icebreakers/monorepo-templates'
import { logger } from '../../core/logger'

interface PackageCreateCliOptions {
  template?: string
}

export function registerPackageCommands(program: Command, cwd: string) {
  const packageCommand = program.command('package').alias('pkg').description('子包命令')

  packageCommand.command('create')
    .description('创建一个新的子包')
    .alias('new')
    .argument('[name]')
    .option('-t, --template <template>', '直接使用指定模板，跳过模板选择')
    .action(async (inputName: string, opts: PackageCreateCliOptions) => {
      const { runCreateFlow } = await import('@/cli/commands/package/create-flow')
      await runCreateFlow(cwd, inputName, { template: opts.template })
      logger.success('package create finished!')
    })
}
