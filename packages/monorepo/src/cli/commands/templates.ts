import type { Command, TemplateCategory, TemplateChoice } from '@icebreakers/monorepo-templates'
import type { TemplateHealthReport } from '../../commands'
import process from 'node:process'
import path from 'pathe'
import pc from 'picocolors'
import { logger } from '../../core/logger'
import fs from '../../utils/fs'

interface TemplatesCliOptions {
  json?: boolean
  markdown?: boolean
  category?: string
  check?: boolean
  out?: string
}

function formatTemplateTable(choices: TemplateChoice[]) {
  const rows = choices.map(choice => ({
    key: choice.key,
    category: choice.category ?? '-',
    target: choice.target,
    description: choice.description ?? '',
  }))

  const headers = {
    key: 'key',
    category: 'category',
    target: 'target',
    description: 'description',
  }

  const widths = {
    key: Math.max(headers.key.length, ...rows.map(row => row.key.length)),
    category: Math.max(headers.category.length, ...rows.map(row => row.category.length)),
    target: Math.max(headers.target.length, ...rows.map(row => row.target.length)),
  }

  const lines = [
    `${headers.key.padEnd(widths.key)}  ${headers.category.padEnd(widths.category)}  ${headers.target.padEnd(widths.target)}  ${headers.description}`,
    `${'-'.repeat(widths.key)}  ${'-'.repeat(widths.category)}  ${'-'.repeat(widths.target)}  ${'-'.repeat(headers.description.length)}`,
    ...rows.map(row => `${row.key.padEnd(widths.key)}  ${row.category.padEnd(widths.category)}  ${row.target.padEnd(widths.target)}  ${row.description}`),
  ]

  return lines.join('\n')
}

function formatTemplateDetail(choice: TemplateChoice) {
  return [
    `key: ${choice.key}`,
    `label: ${choice.label}`,
    `category: ${choice.category ?? '-'}`,
    `source: templates/${choice.source}`,
    `default target: ${choice.target}`,
    `description: ${choice.description ?? '-'}`,
  ].join('\n')
}

function escapeMarkdownTableCell(value: string) {
  return value.replaceAll('|', '\\|')
}

function formatTemplateMarkdownTable(choices: TemplateChoice[]) {
  return [
    '| Key | Category | Source | Default target | Description |',
    '| --- | --- | --- | --- | --- |',
    ...choices.map(choice => [
      `\`${choice.key}\``,
      choice.category ?? '-',
      `\`templates/${choice.source}\``,
      `\`${choice.target}\``,
      choice.description ?? '',
    ].map(value => escapeMarkdownTableCell(value)).join(' | ')).map(row => `| ${row} |`),
  ].join('\n')
}

function formatTemplateMarkdownDetail(choice: TemplateChoice) {
  return [
    `# ${choice.key}`,
    '',
    choice.description ?? '',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Label | ${escapeMarkdownTableCell(choice.label)} |`,
    `| Category | ${escapeMarkdownTableCell(choice.category ?? '-')} |`,
    `| Source | \`templates/${escapeMarkdownTableCell(choice.source)}\` |`,
    `| Default target | \`${escapeMarkdownTableCell(choice.target)}\` |`,
  ].join('\n')
}

function formatTemplateHealthStatus(status: 'pass' | 'warn' | 'fail') {
  if (status === 'pass') {
    return pc.green('PASS')
  }
  if (status === 'warn') {
    return pc.yellow('WARN')
  }
  return pc.red('FAIL')
}

function formatTemplateHealthReport(report: TemplateHealthReport, color = false) {
  const status = color
    ? formatTemplateHealthStatus
    : (value: 'pass' | 'warn' | 'fail') => value.toUpperCase()

  const lines = [
    `templates: ${report.templatesDir}`,
    `count: ${report.templateCount}`,
    '',
  ]

  for (const check of report.checks) {
    const prefix = check.template ? `${check.template}: ` : ''
    lines.push(`[${status(check.status)}] ${prefix}${check.title}`)
    lines.push(`  ${check.detail}`)
    if (check.fix) {
      lines.push(`  fix: ${check.fix}`)
    }
  }

  lines.push('')
  lines.push(
    color
      ? `summary: ${pc.green(String(report.summary.pass))} pass, ${pc.yellow(String(report.summary.warn))} warn, ${pc.red(String(report.summary.fail))} fail`
      : `summary: ${report.summary.pass} pass, ${report.summary.warn} warn, ${report.summary.fail} fail`,
  )

  return lines.join('\n')
}

async function emitTemplateOutput(content: string, options: TemplatesCliOptions) {
  if (!options.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(process.cwd(), options.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(process.cwd(), outFile)}`)
}

export function registerTemplatesCommands(program: Command) {
  program.command('templates')
    .alias('tpl')
    .description('列出可用的内置模板')
    .argument('[key]', '查看指定模板详情')
    .option('-c, --category <category>', '按模板分类过滤：library / app / service / docs / tool')
    .option('--check', '检查内置模板元数据、目录和临时文件')
    .option('--json', '输出 JSON，方便脚本消费')
    .option('--markdown', '输出 Markdown，方便同步文档')
    .option('--out <file>', '把当前输出写入文件')
    .action(async (key: string | undefined, opts: TemplatesCliOptions) => {
      const {
        getTemplateChoice,
        getTemplateChoices,
        isTemplateCategory,
        templateCategories,
      } = await import('@icebreakers/monorepo-templates')

      if (opts.check) {
        const { checkTemplates } = await import('@/commands')
        const report = await checkTemplates()
        if (opts.json) {
          await emitTemplateOutput(JSON.stringify(report, null, 2), opts)
        }
        else {
          await emitTemplateOutput(formatTemplateHealthReport(report, !opts.out), opts)
        }
        if (report.summary.fail > 0) {
          process.exitCode = 1
        }
        return
      }

      if (key) {
        const choice = getTemplateChoice(key)
        if (!choice) {
          logger.error(`unknown template: ${key}`)
          logger.info('run `repo templates` to list available templates')
          process.exitCode = 1
          return
        }
        if (opts.json) {
          await emitTemplateOutput(JSON.stringify(choice, null, 2), opts)
          return
        }
        if (opts.markdown) {
          await emitTemplateOutput(formatTemplateMarkdownDetail(choice), opts)
          return
        }
        await emitTemplateOutput(`Template detail:\n${formatTemplateDetail(choice)}`, opts)
        if (!opts.out) {
          logger.info(`next: run \`repo new <name> --template ${choice.key}\``)
        }
        return
      }

      let category: TemplateCategory | undefined
      if (opts.category) {
        if (!isTemplateCategory(opts.category)) {
          logger.error(`unknown template category: ${opts.category}`)
          logger.info(`available categories: ${templateCategories.join(', ')}`)
          process.exitCode = 1
          return
        }
        category = opts.category
      }

      const choices = getTemplateChoices(category ? { category } : {})
      if (opts.json) {
        await emitTemplateOutput(JSON.stringify(choices, null, 2), opts)
        return
      }
      if (opts.markdown) {
        await emitTemplateOutput(formatTemplateMarkdownTable(choices), opts)
        return
      }

      await emitTemplateOutput(`Available templates:\n${formatTemplateTable(choices)}`, opts)
      if (!opts.out) {
        logger.info('next: run `repo new <name> --template <key>`')
      }
    })
}
