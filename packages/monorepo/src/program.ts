import type { CreateNewProjectOptions } from './create'
import type { CliOpts } from './types'
import process from 'node:process'
import input from '@inquirer/input'
import select from '@inquirer/select'
import { program } from 'commander'
import { name, version } from './constants'
import { createNewProject } from './create'
import { logger } from './logger'
import { cleanProjects, init, setVscodeBinaryMirror, syncNpmMirror } from './monorepo'
import { upgradeMonorepo } from './upgrade'

const cwd = process.cwd()

program.name(name).version(version)

program
  // .command('upgrade')
  // .description('升级/同步 monorepo 相关包')
  // .alias('up')
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
  .option('--tsup', 'create a tsup library')
  .option('--unbuild', 'create a unbuild library')
  .option('--vue-ui', 'create a vue ui library')
  .action(async (name: string, options: { tsup?: boolean, unbuild?: boolean, vueUi?: boolean }) => {
    if (!name) {
      name = await input({
        message: '请输入包名',
        default: 'my-package',
      })
    }
    let type: CreateNewProjectOptions['type']

    if (options.tsup) {
      type = 'tsup'
    }
    else if (options.unbuild) {
      type = 'unbuild'
    }
    else if (options.vueUi) {
      type = 'vue-lib'
    }

    type ??= await select({
      message: '请选择模板类型',
      choices: [
        { name: 'tsup 打包', value: 'tsup' },
        { name: 'unbuild 打包', value: 'unbuild' },
        { name: 'vue 组件', value: 'vue-lib' },
      ],
    })

    await createNewProject({
      name,
      cwd,
      type,
    })
    logger.success('create a package')
  })

export default program
