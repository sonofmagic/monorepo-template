import type { AgenticTemplateFormat, GenerateAgenticTemplateOptions } from '../commands/ai'
import type { InitToolingTarget } from '../commands/init'
import type { CleanCommandConfig, CliOpts } from '../types'
import process from 'node:process'
import { input, program, select } from '@icebreakers/monorepo-templates'
import { cleanProjects, createNewProject, createTimestampFolderName, defaultAgenticBaseDir, generateAgenticTemplate, generateAgenticTemplates, getCreateChoices, initMetadata, initTooling, initToolingTargets, loadAgenticTasks, normalizeInitToolingTargets, setVscodeBinaryMirror, skillTargets, syncSkills, upgradeMonorepo, verifyCommitMsg, verifyPreCommit, verifyPrePush, verifyStagedTypecheck } from '../commands'
import { defaultTemplate } from '../commands/create'
import { name as cliName, version } from '../constants'
import { resolveCommandConfig } from '../core/config'
import { logger } from '../core/logger'

type SkillTarget = typeof skillTargets[number]
type CreateNewProjectOptions = NonNullable<Parameters<typeof createNewProject>[0]>

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

interface InitCommandOptions {
  all?: boolean
  force?: boolean
}

interface SkillsSyncCommandOptions {
  codex?: boolean
  claude?: boolean
  all?: boolean
}

const cwd = process.cwd()

program.name(cliName).version(version)

function normalizeCliOpts(opts: CliOpts): CliOpts {
  return {
    ...opts,
    core: opts.core ?? false,
    cwd,
  }
}

function normalizeCleanOptions(opts: CleanCommandOptions) {
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
  return overrides
}

function normalizeToolingTargets(tooling: string[]) {
  return tooling.length ? normalizeInitToolingTargets(tooling) : undefined
}

async function handleWorkspaceUpgrade(opts: CliOpts) {
  await upgradeMonorepo(normalizeCliOpts(opts))
  logger.success('workspace upgrade finished!')
}

async function handleWorkspaceInit() {
  await initMetadata(cwd)
  logger.success('workspace init finished!')
}

async function handleToolingInit(tooling: string[] = [], opts: InitCommandOptions) {
  const normalizedTooling: InitToolingTarget[] | undefined = normalizeToolingTargets(tooling)
  await initTooling(cwd, {
    ...(normalizedTooling ? { targets: normalizedTooling } : {}),
    ...(opts.all !== undefined ? { all: opts.all } : {}),
    ...(opts.force !== undefined ? { force: opts.force } : {}),
  })
  logger.success('tooling init finished!')
}

async function handleWorkspaceClean(opts: CleanCommandOptions) {
  await cleanProjects(cwd, normalizeCleanOptions(opts))
  logger.success('workspace clean finished!')
}

async function handleEnvMirror() {
  await setVscodeBinaryMirror(cwd)
  logger.success('env mirror finished!')
}

async function handlePackageCreate(inputName: string) {
  const createConfig = await resolveCommandConfig('create', cwd)
  let packageName = inputName
  if (!packageName) {
    packageName = await input({
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
    name: packageName,
    cwd,
    type,
  })
  logger.success('package create finished!')
}

const workspaceCommand = program.command('workspace').alias('ws').description('工作区命令')

workspaceCommand.command('upgrade')
  .description('升级/同步 monorepo 相关包')
  .alias('up')
  .option('-i,--interactive')
  .option('-c,--core', '仅同步核心配置，跳过 GitHub 相关资产')
  .option('--outDir <dir>', 'Output directory')
  .option('-s,--skip-overwrite', 'skip overwrite')
  .action(handleWorkspaceUpgrade)

workspaceCommand.command('init')
  .description('初始化工作区元信息（README、package.json、changeset、issue template）')
  .alias('i')
  .action(handleWorkspaceInit)

workspaceCommand.command('clean')
  .description('清除选中的包')
  .alias('rm')
  .option('-y, --yes', '跳过交互直接清理（等价 autoConfirm）')
  .option('--include-private', '包含 private 包')
  .option('--pinned-version <version>', '覆盖写入的 @icebreakers/monorepo 版本')
  .action(handleWorkspaceClean)

const toolingCommand = program.command('tooling').alias('tg').description('工程化配置命令')

toolingCommand.command('init')
  .description(`生成 tooling 配置（可选值：${initToolingTargets.join(', ')}）`)
  .alias('i')
  .argument('[tooling...]')
  .option('-a, --all', '生成全部 tooling 配置')
  .option('-f, --force', '覆盖已存在的 tooling 配置文件')
  .action(handleToolingInit)

const envCommand = program.command('env').alias('e').description('环境命令')

envCommand.command('mirror')
  .description('设置 VS Code binary mirror')
  .alias('m')
  .action(handleEnvMirror)

const skillsCommand = program.command('skills').alias('sk').description('技能工具集')

skillsCommand.command('sync')
  .description('同步 resources/skills/icebreakers-monorepo-cli 到全局目录')
  .alias('s')
  .option('--codex', '同步到 ~/.codex/skills')
  .option('--claude', '同步到 ~/.claude/skills')
  .option('--all', '同步全部目标')
  .action(async (opts: SkillsSyncCommandOptions) => {
    const selected = new Set<SkillTarget>()
    if (opts.all) {
      for (const target of skillTargets) {
        selected.add(target)
      }
    }
    else {
      if (opts.codex) {
        selected.add('codex')
      }
      if (opts.claude) {
        selected.add('claude')
      }
    }

    const options = selected.size
      ? { cwd, targets: [...selected] }
      : { cwd }
    const results = await syncSkills(options)
    if (!results.length) {
      logger.info('未选择任何目标，已跳过同步。')
      return
    }
    logger.info(`[已同步的目标]:\n${results.map(item => `- ${item.target}: ${item.dest}`).join('\n')}\n`)
    logger.success('skills sync finished!')
  })

const verifyCommand = program.command('verify').alias('v').description('本地校验工具集')

verifyCommand.command('pre-push')
  .description('按推送变更范围执行 build/test/tsd 校验')
  .alias('push')
  .action(async () => {
    await verifyPrePush({ cwd })
  })

verifyCommand.command('pre-commit')
  .description('执行 lint-staged 校验')
  .alias('commit')
  .action(async () => {
    await verifyPreCommit({ cwd })
  })

verifyCommand.command('commit-msg')
  .description('执行 commitlint 校验')
  .alias('msg')
  .argument('<edit-file>')
  .action(async (editFile: string) => {
    await verifyCommitMsg({ cwd, editFile })
  })

verifyCommand.command('staged-typecheck')
  .description('按暂存文件所在 workspace 执行 typecheck')
  .alias('tc')
  .argument('[files...]')
  .action((files: string[] = []) => {
    verifyStagedTypecheck(files, { cwd })
  })

const aiCommand = program.command('ai').description('AI 助手工具集')
const aiPromptCommand = aiCommand.command('prompt').alias('p').description('Prompt 模板命令')

async function handleAiPromptCreate(opts: AiTemplateCommandOptions) {
  const aiConfig = await resolveCommandConfig('ai', cwd)
  const format = opts.format ?? aiConfig?.format ?? 'md'
  const force = opts.force ?? aiConfig?.force ?? false
  const output = opts.output ?? aiConfig?.output
  const baseDir = opts.dir ?? aiConfig?.baseDir ?? defaultAgenticBaseDir
  const tasksFile = opts.tasks ?? aiConfig?.tasksFile
  const templateName = opts.name

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
  if (!output && !templateName) {
    const generated = createTimestampFolderName()
    const answer = await input({
      message: '提示词将写入哪个文件夹？（可回车确认或自定义）',
      default: generated,
    })
    folderName = (answer?.trim?.() ?? generated) || generated
  }

  const templateOptions: GenerateAgenticTemplateOptions = {
    cwd,
    force,
    format,
    baseDir,
  }
  if (output !== undefined) {
    templateOptions.output = output
  }
  if (templateName !== undefined) {
    templateOptions.name = templateName
  }
  if (folderName !== undefined) {
    templateOptions.folderName = folderName
  }

  await generateAgenticTemplate(templateOptions)
}

aiPromptCommand.command('create')
  .alias('new')
  .description('生成 Agentic 任务提示词模板')
  .option('-o, --output <path>', '输出到指定文件')
  .option('-f, --force', '允许覆盖已存在文件')
  .option('--format <md|json>', '模板格式，默认 md')
  .option('-d, --dir <path>', '默认输出目录（默认 agentic/prompts，下级自动创建时间文件夹），配合 --name / --tasks 使用')
  .option('-n, --name <name>', '使用名称快速生成文件，自动添加后缀')
  .option('-t, --tasks <file>', '从 JSON 数组批量生成模板')
  .action(handleAiPromptCreate)

const packageCommand = program.command('package').alias('pkg').description('子包命令')

packageCommand.command('create')
  .description('创建一个新的子包')
  .alias('new')
  .argument('[name]')
  .action(handlePackageCreate)

export default program
