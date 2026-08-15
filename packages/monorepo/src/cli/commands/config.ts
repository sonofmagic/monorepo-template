import type { Command } from '@icebreakers/monorepo-templates'
import type { ConfigInspection } from '../../commands/config'
import os from 'node:os'
import path from 'pathe'
import { logger } from '../../core/logger'
import { localize } from '../../i18n'
import fs from '../../utils/fs'

interface ConfigInspectCliOptions {
  json?: boolean
  markdown?: boolean
  out?: string
  redact?: boolean
}

function formatConfigInspection(inspection: ConfigInspection) {
  const commandKeys = Object.keys(inspection.config.commands ?? {})
  const toolingKeys = Object.keys(inspection.config.tooling ?? {})
  return [
    localize(`cwd: ${inspection.cwd}`, `当前目录：${inspection.cwd}`),
    localize(`file: ${inspection.file ?? '-'}`, `文件：${inspection.file ?? '-'}`),
    localize(`commands: ${commandKeys.length > 0 ? commandKeys.join(', ') : '-'}`, `命令：${commandKeys.length > 0 ? commandKeys.join(', ') : '-'}`),
    localize(`tooling: ${toolingKeys.length > 0 ? toolingKeys.join(', ') : '-'}`, `Tooling：${toolingKeys.length > 0 ? toolingKeys.join(', ') : '-'}`),
  ].join('\n')
}

function formatMarkdownTable(rows: Array<[string, string | number | undefined]>) {
  const formatCell = (value: string | number | undefined) => String(value ?? '-')
    .split('|')
    .join('\\|')
    .split('\n')
    .join('<br>')

  return [
    localize('| Field | Value |', '| 字段 | 值 |'),
    '| --- | --- |',
    ...rows.map(([label, value]) => `| ${label} | ${formatCell(value)} |`),
  ].join('\n')
}

function formatConfigInspectionMarkdown(inspection: ConfigInspection) {
  const commandKeys = Object.keys(inspection.config.commands ?? {})
  const toolingKeys = Object.keys(inspection.config.tooling ?? {})

  return [
    localize('# Repo config inspection', '# Repo 配置检查'),
    '',
    formatMarkdownTable([
      ['cwd', inspection.cwd],
      ['file', inspection.file ?? '-'],
      ['commands', commandKeys.length],
      ['tooling', toolingKeys.length],
    ]),
    '',
    localize('## Commands', '## 命令'),
    '',
    ...(commandKeys.length > 0 ? commandKeys.map(key => `- ${key}`) : ['- -']),
    '',
    localize('## Tooling', '## Tooling 配置'),
    '',
    ...(toolingKeys.length > 0 ? toolingKeys.map(key => `- ${key}`) : ['- -']),
  ].join('\n')
}

function replaceAll(value: string, search: string, replacement: string) {
  return search.length > 0 ? value.split(search).join(replacement) : value
}

function redactConfigInspectionValue(value: unknown, replacements: Array<[string, string]>): unknown {
  if (typeof value === 'string') {
    return replacements.reduce((result, [search, replacement]) => replaceAll(result, search, replacement), value)
  }
  if (Array.isArray(value)) {
    return value.map(item => redactConfigInspectionValue(item, replacements))
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redactConfigInspectionValue(item, replacements)]),
    )
  }
  return value
}

function redactConfigInspection(inspection: ConfigInspection): ConfigInspection {
  const candidates: Array<[string, string]> = [
    [inspection.cwd, '<cwd>'],
    [inspection.file ? path.dirname(inspection.file) : '', '<configDir>'],
    [os.homedir(), '<home>'],
  ]
  const replacements = candidates
    .filter(([search], index, entries) => search.length > 0 && entries.findIndex(([value]) => value === search) === index)
    .sort(([left], [right]) => right.length - left.length)

  return redactConfigInspectionValue(inspection, replacements) as ConfigInspection
}

async function emitConfigInspection(inspection: ConfigInspection, opts: ConfigInspectCliOptions, cwd: string) {
  const outputInspection = opts.redact ? redactConfigInspection(inspection) : inspection
  const content = opts.json
    ? JSON.stringify(outputInspection, null, 2)
    : opts.markdown
      ? formatConfigInspectionMarkdown(outputInspection)
      : formatConfigInspection(outputInspection)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(cwd, opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(localize(`Wrote ${path.relative(cwd, outFile)}`, `已写入 ${path.relative(cwd, outFile)}`))
}

export function registerConfigCommands(program: Command, cwd: string) {
  const configCommand = program.command('config').alias('cfg').description(localize('Configuration commands', '配置命令'))

  configCommand.command('inspect')
    .description(localize('Show the active repoctl config file and resolved configuration', '输出当前 repoctl 配置文件和已解析配置'))
    .alias('i')
    .option('--json', localize('Output JSON for scripts', '输出 JSON，方便脚本消费'))
    .option('--markdown', localize('Output Markdown', '输出 Markdown，方便粘贴到 issue 或 PR'))
    .option('--out <file>', localize('Write output to a file', '把当前输出写入文件'))
    .option('--redact', localize('Redact cwd, configDir, and home paths', '脱敏 cwd/configDir/home 绝对路径后再输出'))
    .action(async (opts: ConfigInspectCliOptions) => {
      const { inspectMonorepoConfig } = await import('@/commands')
      await emitConfigInspection(await inspectMonorepoConfig(cwd), opts, cwd)
    })
}
