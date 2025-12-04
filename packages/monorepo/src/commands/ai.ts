import process from 'node:process'
import fs from 'fs-extra'
import path from 'pathe'
import { logger } from '../core/logger'

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
  '目标/产物',
  '约束（性能/风格/兼容/不可改动范围）',
  '验收标准（要跑的命令、预期输出/文件）',
  '仓库路径',
  '允许操作（可/不可写文件，可运行的命令清单，可否联网）',
  '上下文线索（日志/文件/模块/相关 issue）',
  '里程碑（根因→设计→实现→验证）',
] as const

export const defaultAgenticBaseDir = 'agentic/prompts'

function renderMarkdownTemplate() {
  return `${agenticSections.map(title => `## ${title}\n- `).join('\n\n')}\n`
}

function renderJsonTemplate() {
  const payload: Record<string, string> = {}
  for (const title of agenticSections) {
    payload[title] = ''
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
    throw new Error(`不支持的模板格式：${format}`)
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
    throw new Error(`目标文件已存在：${path.relative(cwd, targetPath)}`)
  }

  await fs.outputFile(targetPath, template, 'utf8')
  const actionLabel = exists ? '已覆盖模板' : '已生成模板'
  logger.success(`${actionLabel}：${path.relative(cwd, targetPath)}`)

  return template
}

export async function loadAgenticTasks(filePath: string, cwd: string) {
  const fullPath = path.resolve(cwd, filePath)
  const tasks = await fs.readJson(fullPath)
  if (!Array.isArray(tasks)) {
    throw new TypeError('任务清单需要是数组')
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
