import type { Command } from '@icebreakers/monorepo-templates'
import process from 'node:process'
import { logger } from '../../core/logger'

async function runReleaseAction(action: () => void | Promise<void>) {
  try {
    await action()
  }
  catch (error) {
    logger.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

export function registerReleaseCommands(program: Command, cwd: string) {
  const releaseCommand = program.command('release').description('发布与 pnpm versioning 工具集')

  releaseCommand.command('ci')
    .description('在 CI 中自动准备、发布和恢复版本')
    .option('--mode <mode>', 'auto / prepare / publish / publish-unpublished', 'auto')
    .option('--package <name>', 'publish-unpublished 使用的 package')
    .option('--version <version>', 'publish-unpublished 使用的版本')
    .action(async (opts: { mode?: 'auto' | 'prepare' | 'publish' | 'publish-unpublished', package?: string, version?: string }) => {
      await runReleaseAction(async () => {
        const { releaseCi } = await import('@/commands')
        await releaseCi({
          cwd,
          ...(opts.mode ? { mode: opts.mode } : {}),
          ...(opts.package ? { packageName: opts.package } : {}),
          ...(opts.version ? { packageVersion: opts.version } : {}),
        })
      })
    })

  const stableCommand = releaseCommand.command('stable')
    .description('在 main 分支执行正式发布')
    .action(async () => {
      await runReleaseAction(async () => {
        const { releaseStable } = await import('@/commands')
        await releaseStable({ cwd })
        logger.success('stable release finished!')
      })
    })

  stableCommand.command('prepare')
    .description('消费 pnpm change intents 并准备 Release PR')
    .action(async () => {
      await runReleaseAction(async () => {
        const { prepareStable } = await import('@/commands')
        await prepareStable({ cwd })
        logger.success('stable release preparation finished!')
      })
    })

  stableCommand.command('publish')
    .description('发布 main 分支上尚未发布的包')
    .action(async () => {
      await runReleaseAction(async () => {
        const { publishStable } = await import('@/commands')
        await publishStable({ cwd })
        logger.success('stable package publish finished!')
      })
    })

  const preCommand = releaseCommand.command('pre').description('执行或管理 prerelease 发布')

  preCommand.command('publish')
    .alias('run')
    .description('在 alpha/beta/rc/next 分支发布 prerelease')
    .action(async () => {
      await runReleaseAction(async () => {
        const { releasePrerelease } = await import('@/commands')
        await releasePrerelease({ cwd })
        logger.success('prerelease finished!')
      })
    })

  preCommand.command('enter')
    .description('进入 pnpm prerelease lane')
    .argument('<tag>', 'alpha / beta / rc / next')
    .action(async (tag: string) => {
      await runReleaseAction(async () => {
        const { enterPrerelease } = await import('@/commands')
        await enterPrerelease(tag, { cwd })
        logger.success(`entered ${tag} prerelease mode!`)
      })
    })

  preCommand.command('exit')
    .description('退出 pnpm prerelease lane')
    .action(async () => {
      await runReleaseAction(async () => {
        const { exitPrerelease } = await import('@/commands')
        await exitPrerelease({ cwd })
        logger.success('exited prerelease mode!')
      })
    })
}
