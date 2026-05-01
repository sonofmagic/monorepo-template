import type { EnvInfo, EnvSupportBundle } from '../../../commands/env'
import os from 'node:os'

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
    '| Field | Value |',
    '| --- | --- |',
    ...rows.map(([label, value]) => `| ${label} | ${formatCell(value)} |`),
  ].join('\n')
}

function formatSupportBundleMarkdown(bundle: EnvSupportBundle) {
  const warningsAndFailures = bundle.doctor.checks.filter(check => check.status !== 'pass')

  return [
    '# Repo support bundle',
    '',
    `Generated at: ${bundle.generatedAt}`,
    '',
    '## Environment',
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
    '## Diagnostics',
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
          '## Doctor findings',
          '',
          ...warningsAndFailures.map(check => `- ${check.status}: ${check.title}${check.fix ? ` (fix: ${check.fix})` : ''}`),
          '',
        ]
      : []),
    '## Check plan',
    '',
    ...bundle.checkPlan.commands.map(command => `- \`${command.command}\` - ${command.description}`),
    '',
    '## Report paths',
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
