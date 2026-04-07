import type { Command } from '@icebreakers/monorepo-templates'
import type { CliOpts } from '../../types'
import { cleanProjects, init, runRecommendedCheck, setVscodeBinaryMirror, upgradeMonorepo } from '../../commands'
import { logger } from '../../core/logger'
import { normalizeCleanOptions, normalizeCliOpts } from '../utils'
import { runCreateFlow } from './package/create-flow'

interface CheckCliOptions {
  full?: boolean
  staged?: boolean
  editFile?: string
}

interface InitCliOptions {
  force?: boolean
  preset?: 'minimal' | 'standard'
}

interface CleanCliOptions {
  yes?: boolean
  includePrivate?: boolean
  pinnedVersion?: string
}

export function registerTopLevelCommands(program: Command, cwd: string) {
  program.command('init')
    .description('初始化当前 workspace，并生成推荐配置')
    .option('--preset <preset>', '初始化预设：minimal / standard', 'standard')
    .option('-f, --force', '覆盖已存在的 tooling 配置文件')
    .action(async (opts: InitCliOptions) => {
      await init(cwd, {
        ...(opts.preset !== undefined ? { preset: opts.preset } : {}),
        ...(opts.force !== undefined ? { force: opts.force } : {}),
      })
      logger.success('init finished!')
      logger.info('next: run `pnpm install` and `pnpm build`')
    })

  program.command('new')
    .description('创建新的 package / app')
    .argument('[name]')
    .action(async (inputName: string) => {
      await runCreateFlow(cwd, inputName)
      logger.success('new finished!')
      logger.info('next: run `pnpm install` and start the new workspace package')
    })

  program.command('check')
    .description('执行推荐的本地校验')
    .option('--full', '执行完整校验')
    .option('--staged', '仅执行 staged 相关校验')
    .option('--edit-file <file>', '执行 commit message 校验')
    .action(async (opts: CheckCliOptions) => {
      const options = {
        cwd,
        ...(opts.full !== undefined ? { full: opts.full } : {}),
        ...(opts.staged !== undefined ? { staged: opts.staged } : {}),
        ...(opts.editFile !== undefined ? { editFile: opts.editFile } : {}),
      }
      await runRecommendedCheck(options)
      logger.success('check finished!')
    })

  program.command('upgrade')
    .description('同步仓库标准资产与脚本')
    .option('-i,--interactive')
    .option('-c,--core', '仅同步核心配置，跳过 GitHub 相关资产')
    .option('--outDir <dir>', 'Output directory')
    .option('-s,--skip-overwrite', 'skip overwrite')
    .action(async (opts: CliOpts) => {
      await upgradeMonorepo(normalizeCliOpts(cwd, opts))
      logger.success('upgrade finished!')
    })

  program.command('sync')
    .description('兼容入口：同步仓库标准资产与脚本')
    .option('-i,--interactive')
    .option('-c,--core', '仅同步核心配置，跳过 GitHub 相关资产')
    .option('--outDir <dir>', 'Output directory')
    .option('-s,--skip-overwrite', 'skip overwrite')
    .action(async (opts: CliOpts) => {
      await upgradeMonorepo(normalizeCliOpts(cwd, opts))
      logger.success('sync finished!')
    })

  program.command('clean')
    .description('兼容入口：清理选中的 workspace 包')
    .option('-y, --yes', '跳过交互直接清理（等价 autoConfirm）')
    .option('--include-private', '包含 private 包')
    .option('--pinned-version <version>', '覆盖写入的 @icebreakers/monorepo 版本')
    .action(async (opts: CleanCliOptions) => {
      await cleanProjects(cwd, normalizeCleanOptions(opts))
      logger.success('clean finished!')
    })

  program.command('mirror')
    .description('兼容入口：设置 VS Code binary mirror')
    .action(async () => {
      await setVscodeBinaryMirror(cwd)
      logger.success('mirror finished!')
    })
}
