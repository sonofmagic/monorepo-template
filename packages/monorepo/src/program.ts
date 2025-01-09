import type { CliOpts } from './types'
import process from 'node:process'
import { program } from 'commander'
import { name, version } from './constants'
import { createNewProject } from './create'
import { logger } from './logger'
import { cleanProjects, init, setVscodeBinaryMirror, syncNpmMirror } from './monorepo'
import { upgradeMonorepo } from './upgrade'

const cwd = process.cwd()

program.name(name).version(version)

program
  .option('-i,--interactive')
  .option('--raw', 'raw mode')
  .option('--outDir <dir>', 'Output directory')
  .action(async (opts: CliOpts) => {
    await upgradeMonorepo(opts)
    logger.success('upgrade @icebreakers/monorepo ok!')
  })

program.command('init').description('初始化 package.json 和 README.md').action(async () => {
  await init(cwd)
  logger.success('init finished!')
})

program.command('sync').description('向 npmmirror 同步所有子包').action(async () => {
  await syncNpmMirror(cwd)
  logger.success('sync npm mirror finished!')
})

program.command('clean').description('清除所有默认包').action(async () => {
  await cleanProjects(cwd)
  logger.success('clean projects finished!')
})

program.command('mirror').description('设置 VscodeBinaryMirror').action(async () => {
  await setVscodeBinaryMirror(cwd)
  logger.success('set vscode binary mirror finished!')
})

program.command('new')
  .description('创建一个新的子包')
  .alias('create')
  .argument('[name]')
  .option('--tsup')
  .option('--unbuild')
  .action(async (name: string, options: { tsup?: boolean, unbuild?: boolean }) => {
    const type = options.tsup ? 'tsup' : options.unbuild ? 'unbuild' : undefined
    await createNewProject({
      name,
      cwd,
      type,
    })
    logger.success('create a package')
  })

export default program
