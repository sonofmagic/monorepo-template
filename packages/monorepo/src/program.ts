import type { CreateNewProjectOptions } from './monorepo'
import type { CliOpts } from './types'
import process from 'node:process'
import input from '@inquirer/input'
import select from '@inquirer/select'
import { program } from 'commander'
import { name, version } from './constants'
import { logger } from './logger'
import { cleanProjects, createNewProject, init, setVscodeBinaryMirror, syncNpmMirror, upgradeMonorepo } from './monorepo'
import { createChoices } from './monorepo/create'

const cwd = process.cwd()

program.name(name).version(version)

program
  .command('upgrade')
  .description('升级/同步 monorepo 相关包')
  .alias('up')
  .option('-i,--interactive')
  .option('--raw', 'raw mode')
  .option('--outDir <dir>', 'Output directory')
  .option('-s,--skip-overwrite', 'skip overwrite')
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

program.command('clean').description('清除选中的包').action(async () => {
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
  .action(async (name: string) => {
    if (!name) {
      name = await input({
        message: '请输入包名',
        default: 'my-package',
      })
    }
    const type: CreateNewProjectOptions['type'] = await select({
      message: '请选择模板类型',
      choices: createChoices,
      default: 'unbuild',
    })

    await createNewProject({
      name,
      cwd,
      type,
    })
    logger.success('create a package')
  })

export default program
