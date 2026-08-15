import process from 'node:process'
import path from 'pathe'
import fs from '@/utils/fs'
import { logger } from '../core/logger'
import { localize } from '../i18n'

export type AgenticTemplateFormat = 'md' | 'json'

export interface GenerateAgenticTemplateOptions {
  cwd?: string
  output?: string
  force?: boolean
  format?: AgenticTemplateFormat
  /**
   * 任务名，用于快速生成带目录与后缀的文件。
   */
  name?: string
  /**
   * 基础目录，配合 name 使用。
   * @default 'agentic/prompts'
   */
  baseDir?: string
  /**
   * 自动生成目录时使用的自定义文件夹名称。
   * @default 自动生成的时间戳
   */
  folderName?: string
}

export type AgenticTemplateTask = string | (Omit<GenerateAgenticTemplateOptions, 'cwd'> & { name?: string })

const agenticSections = [
  ['Goal and deliverables', '目标与产物'],
  ['Constraints (performance, style, compatibility, and protected scope)', '约束（性能、风格、兼容性和不可改动范围）'],
  ['Acceptance criteria (commands, expected output, and files)', '验收标准（命令、预期输出和文件）'],
  ['Repository paths', '仓库路径'],
  ['Allowed operations (file writes, commands, and network access)', '允许操作（文件写入、可运行命令和网络访问）'],
  ['Context (logs, files, modules, and related issues)', '上下文（日志、文件、模块和相关 issue）'],
  ['Milestones (root cause, design, implementation, and verification)', '里程碑（根因、设计、实现和验证）'],
] as const

export const defaultAgenticBaseDir = 'agentic/prompts'

function renderMarkdownTemplate() {
  return `${agenticSections.map(([english, chinese]) => `## ${localize(english, chinese)}\n- `).join('\n\n')}\n`
}

function renderJsonTemplate() {
  const payload: Record<string, string> = {}
  for (const [english] of agenticSections) {
    payload[english] = ''
  }
  return `${JSON.stringify(payload, null, 2)}\n`
}

export function createTimestampFolderName(date = new Date()) {
  const pad = (value: number) => value.toString().padStart(2, '0')
  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getUTCDate())
  const hour = pad(date.getUTCHours())
  const minute = pad(date.getUTCMinutes())
  const second = pad(date.getUTCSeconds())
  return `${year}${month}${day}-${hour}${minute}${second}`
}

/**
 * 生成 Agentic 任务提示词模板，默认写入 agentic/prompts/<timestamp>/prompt.md，可自定义输出路径。
 */
export async function generateAgenticTemplate(options: GenerateAgenticTemplateOptions = {}) {
  const cwd = options.cwd ?? process.cwd()
  const format = options.format ?? 'md'
  const baseDir = options.baseDir ?? defaultAgenticBaseDir

  if (format !== 'md' && format !== 'json') {
    throw new Error(localize(`Unsupported template format: ${format}`, `不支持的模板格式：${format}`))
  }

  const template = format === 'md'
    ? renderMarkdownTemplate()
    : renderJsonTemplate()

  const ext = format === 'json' ? 'json' : 'md'
  let outputPath = options.output
  if (!outputPath && options.name) {
    outputPath = path.join(baseDir, `${options.name}.${ext}`)
  }

  if (!outputPath) {
    const folderName = options.folderName ?? createTimestampFolderName()
    outputPath = path.join(baseDir, folderName, `prompt.${ext}`)
  }

  const targetPath = path.resolve(cwd, outputPath)
  const targetDir = path.dirname(targetPath)
  await fs.ensureDir(targetDir)
  const exists = await fs.pathExists(targetPath)

  if (exists && !options.force) {
    throw new Error(localize(`Target file already exists: ${path.relative(cwd, targetPath)}`, `目标文件已存在：${path.relative(cwd, targetPath)}`))
  }

  await fs.outputFile(targetPath, template, 'utf8')
  const actionLabel = exists
    ? localize('Overwrote template', '已覆盖模板')
    : localize('Generated template', '已生成模板')
  logger.success(`${actionLabel}: ${path.relative(cwd, targetPath)}`)

  return template
}

export async function loadAgenticTasks(filePath: string, cwd: string) {
  const fullPath = path.resolve(cwd, filePath)
  const tasks = await fs.readJson(fullPath)
  if (!Array.isArray(tasks)) {
    throw new TypeError(localize('The task list must be an array.', '任务清单需要是数组'))
  }
  return tasks as AgenticTemplateTask[]
}

export async function generateAgenticTemplates(tasks: AgenticTemplateTask[], defaults: GenerateAgenticTemplateOptions = {}) {
  const results: string[] = []
  for (const task of tasks) {
    const normalized = typeof task === 'string'
      ? { ...defaults, name: task }
      : { ...defaults, ...task }
    results.push(await generateAgenticTemplate(normalized))
  }
  return results
}
