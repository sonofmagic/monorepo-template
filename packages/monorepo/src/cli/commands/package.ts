import type { Command } from '@icebreakers/monorepo-templates'
import { logger } from '../../core/logger'

interface PackageCreateCliOptions {
  template?: string
  dryRun?: boolean
}

export function registerPackageCommands(program: Command, cwd: string) {
  const packageCommand = program.command('package').alias('pkg').description('子包命令')

  packageCommand.command('create')
    .description('创建一个新的子包')
    .alias('new')
    .argument('[name]')
    .option('-t, --template <template>', '直接使用指定模板，跳过模板选择')
    .option('--dry-run', '预览将要创建的目录与 package 信息，不写入文件')
    .action(async (inputName: string, opts: PackageCreateCliOptions) => {
      const { runCreateFlow } = await import('@/cli/commands/package/create-flow')
      const result = await runCreateFlow(cwd, inputName, {
        ...(opts.template !== undefined ? { template: opts.template } : {}),
        ...(opts.dryRun ? { dryRun: true } : {}),
      })
      if (result.dryRun || result.failed) {
        return
      }
      logger.success('package create finished!')
    })
}
