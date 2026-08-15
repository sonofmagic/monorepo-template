import type { EnvInfo, EnvSupportBundle } from '../../../commands/env'
import os from 'node:os'
import { localize } from '../../../i18n'

interface EnvSupportOutputOptions {
  json?: boolean
  markdown?: boolean
  redact?: boolean
}

function formatEnvInfo(info: EnvInfo) {
  return [
    `cwd: ${info.cwd}`,
    `workspace: ${info.workspaceDir}`,
    `packages: ${info.packageCount}`,
    `node: ${info.nodeVersion}${info.nodeRange ? ` (${info.nodeRange})` : ''}`,
    `pnpm: ${info.pnpmVersion ?? '-'}`,
    `packageManager: ${info.packageManager ?? '-'}`,
    `platform: ${info.platform}/${info.arch}`,
  ].join('\n')
}

function formatEnvSupportBundle(bundle: EnvSupportBundle) {
  return [
    `generatedAt: ${bundle.generatedAt}`,
    '',
    formatEnvInfo(bundle.env),
    '',
    `config: ${bundle.config.file ?? '-'}`,
    `doctor: ${bundle.doctor.summary.pass} pass, ${bundle.doctor.summary.warn} warn, ${bundle.doctor.summary.fail} fail`,
    `check: ${bundle.checkPlan.mode}`,
    `paths: ${bundle.paths.workspaceDir}`,
    ...bundle.checkPlan.commands.map(command => `- ${command.command}`),
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

function formatSupportBundleMarkdown(bundle: EnvSupportBundle) {
  const warningsAndFailures = bundle.doctor.checks.filter(check => check.status !== 'pass')

  return [
    localize('# Repo support bundle', '# Repo 支持信息包'),
    '',
    localize(`Generated at: ${bundle.generatedAt}`, `生成时间：${bundle.generatedAt}`),
    '',
    localize('## Environment', '## 环境'),
    '',
    formatMarkdownTable([
      ['cwd', bundle.env.cwd],
      ['workspace', bundle.env.workspaceDir],
      ['packages', bundle.env.packageCount],
      ['node', bundle.env.nodeRange ? `${bundle.env.nodeVersion} (${bundle.env.nodeRange})` : bundle.env.nodeVersion],
      ['pnpm', bundle.env.pnpmVersion],
      ['packageManager', bundle.env.packageManager],
      ['platform', `${bundle.env.platform}/${bundle.env.arch}`],
    ]),
    '',
    localize('## Diagnostics', '## 诊断'),
    '',
    formatMarkdownTable([
      ['doctor pass', bundle.doctor.summary.pass],
      ['doctor warn', bundle.doctor.summary.warn],
      ['doctor fail', bundle.doctor.summary.fail],
      ['check mode', bundle.checkPlan.mode],
      ['config file', bundle.config.file ?? '-'],
    ]),
    '',
    ...(warningsAndFailures.length > 0
      ? [
          localize('## Doctor findings', '## Doctor 问题'),
          '',
          ...warningsAndFailures.map(check => localize(`- ${check.status}: ${check.title}${check.fix ? ` (fix: ${check.fix})` : ''}`, `- ${check.status}: ${check.title}${check.fix ? `（修复：${check.fix}）` : ''}`)),
          '',
        ]
      : []),
    localize('## Check plan', '## 检查计划'),
    '',
    ...bundle.checkPlan.commands.map(command => `- \`${command.command}\` - ${command.description}`),
    '',
    localize('## Report paths', '## 报告路径'),
    '',
    formatMarkdownTable([
      ['doctor', bundle.paths.paths.doctorReport.relativePath],
      ['env', bundle.paths.paths.envReport.relativePath],
      ['snapshot', bundle.paths.paths.snapshotReport.relativePath],
      ['check plan', bundle.paths.paths.checkPlanReport.relativePath],
    ]),
  ].join('\n')
}

function replaceAll(value: string, search: string, replacement: string) {
  return search.length > 0 ? value.split(search).join(replacement) : value
}

function redactSupportBundleValue(value: unknown, replacements: Array<[string, string]>): unknown {
  if (typeof value === 'string') {
    return replacements.reduce((result, [search, replacement]) => replaceAll(result, search, replacement), value)
  }
  if (Array.isArray(value)) {
    return value.map(item => redactSupportBundleValue(item, replacements))
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redactSupportBundleValue(item, replacements)]),
    )
  }
  return value
}

function redactSupportBundle(bundle: EnvSupportBundle): EnvSupportBundle {
  const candidates: Array<[string, string]> = [
    [bundle.env.workspaceDir, '<workspace>'],
    [bundle.env.cwd, '<cwd>'],
    [os.homedir(), '<home>'],
  ]
  const replacements = candidates
    .filter(([search], index, entries) => search.length > 0 && entries.findIndex(([value]) => value === search) === index)
    .sort(([left], [right]) => right.length - left.length)

  return redactSupportBundleValue(bundle, replacements) as EnvSupportBundle
}

export function createEnvSupportBundleOutput(bundle: EnvSupportBundle, opts: EnvSupportOutputOptions) {
  const outputBundle = opts.redact ? redactSupportBundle(bundle) : bundle
  return opts.json
    ? JSON.stringify(outputBundle, null, 2)
    : opts.markdown
      ? formatSupportBundleMarkdown(outputBundle)
      : formatEnvSupportBundle(outputBundle)
}

export function hasStrictSupportBundleIssues(bundle: EnvSupportBundle) {
  return bundle.doctor.summary.fail > 0 || bundle.doctor.summary.warn > 0
}
