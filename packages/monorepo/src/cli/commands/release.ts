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
  const releaseCommand = program.command('release').description('发布与 Changesets prerelease 工具集')

  releaseCommand.command('stable')
    .description('在 main 分支执行正式发布')
    .action(async () => {
      await runReleaseAction(async () => {
        const { releaseStable } = await import('@/commands')
        await releaseStable({ cwd })
        logger.success('stable release finished!')
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
    .description('进入 Changesets prerelease 模式')
    .argument('<tag>', 'alpha / beta / rc / next')
    .action(async (tag: string) => {
      await runReleaseAction(async () => {
        const { enterPrerelease } = await import('@/commands')
        enterPrerelease(tag, { cwd })
        logger.success(`entered ${tag} prerelease mode!`)
      })
    })

  preCommand.command('exit')
    .description('退出 Changesets prerelease 模式')
    .action(async () => {
      await runReleaseAction(async () => {
        const { exitPrerelease } = await import('@/commands')
        exitPrerelease({ cwd })
        logger.success('exited prerelease mode!')
      })
    })
}
