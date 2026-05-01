import type { TemplateChoice } from '@icebreakers/monorepo-templates'
import { readdir } from 'node:fs/promises'
import { getTemplateChoices, shouldSkipTemplatePath } from '@icebreakers/monorepo-templates'
import path from 'pathe'
import { templatesDir as defaultTemplatesDir } from '../constants'
import fs from '../utils/fs'

export type TemplateHealthStatus = 'pass' | 'warn' | 'fail'

export interface TemplateHealthCheck {
  id: string
  status: TemplateHealthStatus
  title: string
  detail: string
  template?: string
  fix?: string
}

export interface TemplateHealthSummary {
  pass: number
  warn: number
  fail: number
}

export interface TemplateHealthReport {
  templatesDir: string
  templateCount: number
  checks: TemplateHealthCheck[]
  summary: TemplateHealthSummary
}

export interface CheckTemplatesOptions {
  templatesDir?: string
}

async function collectFiles(rootDir: string) {
  const files: string[] = []

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })
    await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await walk(entryPath)
        return
      }
      if (entry.isFile()) {
        files.push(entryPath)
      }
    }))
  }

  await walk(rootDir)
  return files
}

function summarizeTemplateChecks(checks: TemplateHealthCheck[]): TemplateHealthSummary {
  return checks.reduce<TemplateHealthSummary>((summary, check) => {
    summary[check.status] += 1
    return summary
  }, {
    pass: 0,
    warn: 0,
    fail: 0,
  })
}

function checkDuplicates(choices: TemplateChoice[], field: 'source' | 'target') {
  const seen = new Map<string, string>()
  const duplicates: Array<[string, string, string]> = []

  for (const choice of choices) {
    const value = choice[field]
    const previous = seen.get(value)
    if (previous) {
      duplicates.push([value, previous, choice.key])
      continue
    }
    seen.set(value, choice.key)
  }

  return duplicates
}

export async function checkTemplates(options: CheckTemplatesOptions = {}): Promise<TemplateHealthReport> {
  const templatesDir = options.templatesDir ?? defaultTemplatesDir
  const choices = getTemplateChoices()
  const checks: TemplateHealthCheck[] = []

  const sourceDuplicates = checkDuplicates(choices, 'source')
  checks.push(sourceDuplicates.length
    ? {
        id: 'unique-source',
        status: 'fail',
        title: '模板 source 唯一性',
        detail: `存在重复 source：${sourceDuplicates.map(([value, first, second]) => `${value} (${first}, ${second})`).join(', ')}`,
        fix: '调整 template-data.mjs，确保每个模板 key 指向独立 source。',
      }
    : {
        id: 'unique-source',
        status: 'pass',
        title: '模板 source 唯一性',
        detail: '所有模板 source 都是唯一的。',
      })

  const targetDuplicates = checkDuplicates(choices, 'target')
  checks.push(targetDuplicates.length
    ? {
        id: 'unique-target',
        status: 'fail',
        title: '模板 target 唯一性',
        detail: `存在重复 target：${targetDuplicates.map(([value, first, second]) => `${value} (${first}, ${second})`).join(', ')}`,
        fix: '调整 template-data.mjs，避免多个模板默认写入同一目标目录。',
      }
    : {
        id: 'unique-target',
        status: 'pass',
        title: '模板 target 唯一性',
        detail: '所有模板 target 都是唯一的。',
      })

  for (const choice of choices) {
    const sourceDir = path.join(templatesDir, choice.source)
    const packageJsonPath = path.join(sourceDir, 'package.json')
    const sourceExists = await fs.pathExists(sourceDir)

    checks.push(sourceExists
      ? {
          id: 'source-dir',
          template: choice.key,
          status: 'pass',
          title: '模板目录',
          detail: `${choice.key} source exists: ${path.relative(templatesDir, sourceDir)}`,
        }
      : {
          id: 'source-dir',
          template: choice.key,
          status: 'fail',
          title: '模板目录',
          detail: `${choice.key} 缺少 source 目录：${sourceDir}`,
          fix: '补齐模板目录，或修正 template-data.mjs 中的 source。',
        })

    checks.push(await fs.pathExists(packageJsonPath)
      ? {
          id: 'package-json',
          template: choice.key,
          status: 'pass',
          title: '模板 package.json',
          detail: `${choice.key} 包含 package.json。`,
        }
      : {
          id: 'package-json',
          template: choice.key,
          status: 'fail',
          title: '模板 package.json',
          detail: `${choice.key} 缺少 package.json。`,
          fix: '模板根目录应包含 package.json，脚手架会基于它重写 name/version/repository。',
        })

    checks.push(choice.category && choice.description
      ? {
          id: 'metadata',
          template: choice.key,
          status: 'pass',
          title: '模板元数据',
          detail: `${choice.key} 已声明 category 和 description。`,
        }
      : {
          id: 'metadata',
          template: choice.key,
          status: 'warn',
          title: '模板元数据',
          detail: `${choice.key} 缺少 category 或 description。`,
          fix: '补充 template-data.mjs 中的 category 和 description，方便 CLI 和文档展示。',
        })

    if (!sourceExists) {
      continue
    }

    const skippedFiles = (await collectFiles(sourceDir))
      .filter(file => shouldSkipTemplatePath(sourceDir, file))
      .map(file => path.relative(sourceDir, file))

    checks.push(skippedFiles.length
      ? {
          id: 'filtered-files',
          template: choice.key,
          status: 'fail',
          title: '模板临时文件',
          detail: `${choice.key} 包含会被脚手架过滤的文件：${skippedFiles.join(', ')}`,
          fix: '删除模板源目录里的临时、缓存或生成文件。',
        }
      : {
          id: 'filtered-files',
          template: choice.key,
          status: 'pass',
          title: '模板临时文件',
          detail: `${choice.key} 没有检测到会被过滤的临时文件。`,
        })
  }

  return {
    templatesDir,
    templateCount: choices.length,
    checks,
    summary: summarizeTemplateChecks(checks),
  }
}
