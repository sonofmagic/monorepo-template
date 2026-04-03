import type { Command } from '@icebreakers/monorepo-templates'
import type { AgenticTemplateFormat, GenerateAgenticTemplateOptions } from '../../commands/ai'
import { input } from '@icebreakers/monorepo-templates'
import { createTimestampFolderName, defaultAgenticBaseDir, generateAgenticTemplate, generateAgenticTemplates, loadAgenticTasks } from '../../commands'
import { resolveCommandConfig } from '../../core/config'

interface AiTemplateCommandOptions {
  output?: string
  force?: boolean
  format?: AgenticTemplateFormat
  dir?: string
  name?: string
  tasks?: string
}

async function handleAiPromptCreate(cwd: string, opts: AiTemplateCommandOptions) {
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

export function registerAiCommands(program: Command, cwd: string) {
  const aiCommand = program.command('ai').description('AI 助手工具集')
  const aiPromptCommand = aiCommand.command('prompt').alias('p').description('Prompt 模板命令')

  aiPromptCommand.command('create')
    .alias('new')
    .description('生成 Agentic 任务提示词模板')
    .option('-o, --output <path>', '输出到指定文件')
    .option('-f, --force', '允许覆盖已存在文件')
    .option('--format <md|json>', '模板格式，默认 md')
    .option('-d, --dir <path>', '默认输出目录（默认 agentic/prompts，下级自动创建时间文件夹），配合 --name / --tasks 使用')
    .option('-n, --name <name>', '使用名称快速生成文件，自动添加后缀')
    .option('-t, --tasks <file>', '从 JSON 数组批量生成模板')
    .action(async (opts: AiTemplateCommandOptions) => {
      await handleAiPromptCreate(cwd, opts)
    })
}
