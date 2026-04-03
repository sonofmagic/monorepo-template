import type { Command } from '@icebreakers/monorepo-templates'
import type { CliOpts } from '../../types'
import { cleanProjects, initMetadata, upgradeMonorepo } from '../../commands'
import { logger } from '../../core/logger'
import { normalizeCleanOptions, normalizeCliOpts } from '../utils'

export function registerWorkspaceCommands(program: Command, cwd: string) {
  const workspaceCommand = program.command('workspace').alias('ws').description('工作区命令')

  workspaceCommand.command('upgrade')
    .description('升级/同步 monorepo 相关包')
    .alias('up')
    .option('-i,--interactive')
    .option('-c,--core', '仅同步核心配置，跳过 GitHub 相关资产')
    .option('--outDir <dir>', 'Output directory')
    .option('-s,--skip-overwrite', 'skip overwrite')
    .action(async (opts: CliOpts) => {
      await upgradeMonorepo(normalizeCliOpts(cwd, opts))
      logger.success('workspace upgrade finished!')
    })

  workspaceCommand.command('init')
    .description('初始化工作区元信息（README、package.json、changeset、issue template）')
    .alias('i')
    .action(async () => {
      await initMetadata(cwd)
      logger.success('workspace init finished!')
    })

  workspaceCommand.command('clean')
    .description('清除选中的包')
    .alias('rm')
    .option('-y, --yes', '跳过交互直接清理（等价 autoConfirm）')
    .option('--include-private', '包含 private 包')
    .option('--pinned-version <version>', '覆盖写入的 @icebreakers/monorepo 版本')
    .action(async (opts) => {
      await cleanProjects(cwd, normalizeCleanOptions(opts))
      logger.success('workspace clean finished!')
    })
}
