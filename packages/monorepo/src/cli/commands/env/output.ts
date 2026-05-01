import type { EnvInfo, EnvPaths, EnvSnapshot } from '../../../commands/env'
import os from 'node:os'

export interface EnvOutputOptions {
  json?: boolean
  markdown?: boolean
  redact?: boolean
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

function formatEnvInfoMarkdown(info: EnvInfo) {
  return [
    '# Repo environment',
    '',
    formatMarkdownTable([
      ['cwd', info.cwd],
      ['workspace', info.workspaceDir],
      ['packages', info.packageCount],
      ['node', info.nodeRange ? `${info.nodeVersion} (${info.nodeRange})` : info.nodeVersion],
      ['pnpm', info.pnpmVersion],
      ['packageManager', info.packageManager],
      ['platform', `${info.platform}/${info.arch}`],
    ]),
  ].join('\n')
}

function formatEnvPathEntry(label: string, entry: EnvPaths['paths']['packageJson']) {
  return `${label}: ${entry.relativePath} (${entry.exists ? 'exists' : 'missing'})`
}

function formatEnvPaths(paths: EnvPaths) {
  return [
    `cwd: ${paths.cwd}`,
    `workspace: ${paths.workspaceDir}`,
    '',
    formatEnvPathEntry('packageJson', paths.paths.packageJson),
    formatEnvPathEntry('workspaceManifest', paths.paths.workspaceManifest),
    formatEnvPathEntry('repoctlConfig', paths.paths.repoctlConfig),
    ...paths.paths.repoctlConfigs.map(entry => formatEnvPathEntry('repoctlConfigCandidate', entry)),
    formatEnvPathEntry('legacyConfig', paths.paths.legacyConfig),
    ...paths.paths.legacyConfigs.map(entry => formatEnvPathEntry('legacyConfigCandidate', entry)),
    formatEnvPathEntry('toolingDir', paths.paths.toolingDir),
    formatEnvPathEntry('reportsDir', paths.paths.reportsDir),
    formatEnvPathEntry('doctorReport', paths.paths.doctorReport),
    formatEnvPathEntry('envReport', paths.paths.envReport),
    formatEnvPathEntry('snapshotReport', paths.paths.snapshotReport),
    formatEnvPathEntry('checkPlanReport', paths.paths.checkPlanReport),
  ].join('\n')
}

function formatEnvPathsMarkdown(paths: EnvPaths) {
  return [
    '# Repo paths',
    '',
    formatMarkdownTable([
      ['cwd', paths.cwd],
      ['workspace', paths.workspaceDir],
    ]),
    '',
    '## Files',
    '',
    '| Path | Relative path | Status |',
    '| --- | --- | --- |',
    ...Object.entries(paths.paths)
      .flatMap(([label, value]) => Array.isArray(value)
        ? value.map(entry => [label, entry] as const)
        : [[label, value] as const])
      .map(([label, entry]) => `| ${label} | ${entry.relativePath} | ${entry.exists ? 'exists' : 'missing'} |`),
  ].join('\n')
}

function formatEnvSnapshot(snapshot: EnvSnapshot) {
  return [
    `generatedAt: ${snapshot.generatedAt}`,
    '',
    formatEnvInfo(snapshot.env),
    '',
    `doctor: ${snapshot.doctor.summary.pass} pass, ${snapshot.doctor.summary.warn} warn, ${snapshot.doctor.summary.fail} fail`,
    `check: ${snapshot.checkPlan.mode}`,
    ...snapshot.checkPlan.commands.map(command => `- ${command.command}`),
  ].join('\n')
}

function formatEnvSnapshotMarkdown(snapshot: EnvSnapshot) {
  const warningsAndFailures = snapshot.doctor.checks.filter(check => check.status !== 'pass')

  return [
    '# Repo environment snapshot',
    '',
    `Generated at: ${snapshot.generatedAt}`,
    '',
    '## Environment',
    '',
    formatMarkdownTable([
      ['cwd', snapshot.env.cwd],
      ['workspace', snapshot.env.workspaceDir],
      ['packages', snapshot.env.packageCount],
      ['node', snapshot.env.nodeRange ? `${snapshot.env.nodeVersion} (${snapshot.env.nodeRange})` : snapshot.env.nodeVersion],
      ['pnpm', snapshot.env.pnpmVersion],
      ['packageManager', snapshot.env.packageManager],
      ['platform', `${snapshot.env.platform}/${snapshot.env.arch}`],
    ]),
    '',
    '## Diagnostics',
    '',
    formatMarkdownTable([
      ['doctor pass', snapshot.doctor.summary.pass],
      ['doctor warn', snapshot.doctor.summary.warn],
      ['doctor fail', snapshot.doctor.summary.fail],
      ['check mode', snapshot.checkPlan.mode],
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
    ...snapshot.checkPlan.commands.map(command => `- \`${command.command}\` - ${command.description}`),
  ].join('\n')
}

function replaceAll(value: string, search: string, replacement: string) {
  return search.length > 0 ? value.split(search).join(replacement) : value
}

function redactValue(value: unknown, replacements: Array<[string, string]>): unknown {
  if (typeof value === 'string') {
    return replacements.reduce((result, [search, replacement]) => replaceAll(result, search, replacement), value)
  }
  if (Array.isArray(value)) {
    return value.map(item => redactValue(item, replacements))
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redactValue(item, replacements)]),
    )
  }
  return value
}

function createPathReplacements(cwd: string, workspaceDir: string) {
  const candidates: Array<[string, string]> = [
    [workspaceDir, '<workspace>'],
    [cwd, '<cwd>'],
    [os.homedir(), '<home>'],
  ]

  return candidates
    .filter(([search], index, entries) => search.length > 0 && entries.findIndex(([value]) => value === search) === index)
    .sort(([left], [right]) => right.length - left.length)
}

function redactEnvInfo(info: EnvInfo): EnvInfo {
  return redactValue(info, createPathReplacements(info.cwd, info.workspaceDir)) as EnvInfo
}

function redactEnvPaths(paths: EnvPaths): EnvPaths {
  return redactValue(paths, createPathReplacements(paths.cwd, paths.workspaceDir)) as EnvPaths
}

function redactEnvSnapshot(snapshot: EnvSnapshot): EnvSnapshot {
  return redactValue(snapshot, createPathReplacements(snapshot.env.cwd, snapshot.env.workspaceDir)) as EnvSnapshot
}

export function createEnvInfoOutput(info: EnvInfo, opts: EnvOutputOptions) {
  const outputInfo = opts.redact ? redactEnvInfo(info) : info
  if (opts.json) {
    return JSON.stringify(outputInfo, null, 2)
  }
  if (opts.markdown) {
    return formatEnvInfoMarkdown(outputInfo)
  }
  return formatEnvInfo(outputInfo)
}

export function createEnvPathsOutput(paths: EnvPaths, opts: EnvOutputOptions) {
  const outputPaths = opts.redact ? redactEnvPaths(paths) : paths
  if (opts.json) {
    return JSON.stringify(outputPaths, null, 2)
  }
  if (opts.markdown) {
    return formatEnvPathsMarkdown(outputPaths)
  }
  return formatEnvPaths(outputPaths)
}

export function createEnvSnapshotOutput(snapshot: EnvSnapshot, opts: EnvOutputOptions) {
  const outputSnapshot = opts.redact ? redactEnvSnapshot(snapshot) : snapshot
  if (opts.json) {
    return JSON.stringify(outputSnapshot, null, 2)
  }
  if (opts.markdown) {
    return formatEnvSnapshotMarkdown(outputSnapshot)
  }
  return formatEnvSnapshot(outputSnapshot)
}
