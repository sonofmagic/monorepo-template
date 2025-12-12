import type { AgenticTemplateFormat } from '../commands'
import type { CreateNewProjectOptions } from '../commands/create'
import type { CleanCommandConfig, CliOpts } from '../types'
import process from 'node:process'
import input from '@inquirer/input'
import select from '@inquirer/select'
import { program } from 'commander'
import { cleanProjects, createNewProject, createTimestampFolderName, defaultAgenticBaseDir, generateAgenticTemplate, generateAgenticTemplates, getCreateChoices, init, loadAgenticTasks, setVscodeBinaryMirror, syncNpmMirror, upgradeMonorepo } from '../commands'
import { defaultTemplate } from '../commands/create'
import { name, version } from '../constants'
import { resolveCommandConfig } from '../core/config'
import { logger } from '../core/logger'

interface AiTemplateCommandOptions {
  output?: string
  force?: boolean
  format?: AgenticTemplateFormat
  dir?: string
  name?: string
  tasks?: string
}

interface CleanCommandOptions {
  yes?: boolean
  includePrivate?: boolean
  pinnedVersion?: string
}

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

program.command('clean')
  .description('清除选中的包')
  .option('-y, --yes', '跳过交互直接清理（等价 autoConfirm）')
  .option('--include-private', '包含 private 包')
  .option('--pinned-version <version>', '覆盖写入的 @icebreakers/monorepo 版本')
  .action(async (opts: CleanCommandOptions) => {
    const overrides: Partial<CleanCommandConfig> = {}
    if (opts.yes) {
      overrides.autoConfirm = true
    }
    if (opts.includePrivate) {
      overrides.includePrivate = true
    }
    if (opts.pinnedVersion) {
      overrides.pinnedVersion = opts.pinnedVersion
    }
    await cleanProjects(cwd, overrides)
    logger.success('clean projects finished!')
  })

program.command('mirror').description('设置 VscodeBinaryMirror').action(async () => {
  await setVscodeBinaryMirror(cwd)
  logger.success('set vscode binary mirror finished!')
})

const aiCommand = program.command('ai').description('AI 助手工具集')

aiCommand.command('create')
  .alias('new')
  .description('生成 Agentic 任务提示词模板')
  .option('-o, --output <path>', '输出到指定文件')
  .option('-f, --force', '允许覆盖已存在文件')
  .option('--format <md|json>', '模板格式，默认 md')
  .option('-d, --dir <path>', '默认输出目录（默认 agentic/prompts，下级自动创建时间文件夹），配合 --name / --tasks 使用')
  .option('-n, --name <name>', '使用名称快速生成文件，自动添加后缀')
  .option('-t, --tasks <file>', '从 JSON 数组批量生成模板')
  .action(async (opts: AiTemplateCommandOptions) => {
    const aiConfig = await resolveCommandConfig('ai', cwd)
    const format = opts.format ?? aiConfig?.format ?? 'md'
    const force = opts.force ?? aiConfig?.force ?? false
    const output = opts.output ?? aiConfig?.output
    const baseDir = opts.dir ?? aiConfig?.baseDir ?? defaultAgenticBaseDir
    const tasksFile = opts.tasks ?? aiConfig?.tasksFile
    const name = opts.name

    const shouldUseTasks = Boolean(tasksFile && !opts.output && !opts.name)

    if (shouldUseTasks) {
      if (!tasksFile) {
        throw new Error('tasks file path is required when using tasks mode')
      }
      const tasks = await loadAgenticTasks(tasksFile, cwd)
      await generateAgenticTemplates(tasks, {
        cwd,
        baseDir,
        force,
        format,
      })
      return
    }

    let folderName: string | undefined
    if (!output && !name) {
      const generated = createTimestampFolderName()
      const answer = await input({
        message: '提示词将写入哪个文件夹？（可回车确认或自定义）',
        default: generated,
      })
      folderName = (answer?.trim?.() ?? generated) || generated
    }

    await generateAgenticTemplate({
      cwd,
      output,
      force,
      format,
      baseDir,
      name,
      folderName,
    })
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
