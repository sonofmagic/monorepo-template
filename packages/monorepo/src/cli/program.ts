import type { CreateNewProjectOptions } from '../commands/create'
import type { CliOpts } from '../types'
import process from 'node:process'
import input from '@inquirer/input'
import select from '@inquirer/select'
import { program } from 'commander'
import { cleanProjects, createNewProject, getCreateChoices, init, setVscodeBinaryMirror, syncNpmMirror, upgradeMonorepo } from '../commands'
import { defaultTemplate } from '../commands/create'
import { name, version } from '../constants'
import { resolveCommandConfig } from '../core/config'
import { logger } from '../core/logger'

const cwd = process.cwd()

program.name(name).version(version)

/**
 * 升级子命令：同步 assets 模板到当前仓库。
 */
program
  .command('upgrade')
  .description('升级/同步 monorepo 相关包')
  .alias('up')
  .option('-i,--interactive')
  .option('-c,--core', '仅同步核心配置，跳过 GitHub 相关资产')
  .option('--outDir <dir>', 'Output directory')
  .option('-s,--skip-overwrite', 'skip overwrite')
  .action(async (opts: CliOpts) => {
    const normalized: CliOpts = {
      ...opts,
      core: opts.core ?? false,
      cwd,
    }
    await upgradeMonorepo(normalized)
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
    const createConfig = await resolveCommandConfig('create', cwd)
    if (!name) {
      name = await input({
        message: '请输入包名',
        default: createConfig?.name ?? 'my-package',
      })
    }
    const type: CreateNewProjectOptions['type'] = await select({
      message: '请选择模板类型',
      choices: getCreateChoices(createConfig?.choices),
      default: createConfig?.type ?? createConfig?.defaultTemplate ?? defaultTemplate,
    })

    await createNewProject({
      name,
      cwd,
      type,
    })
    logger.success('create a package')
  })

export default program
