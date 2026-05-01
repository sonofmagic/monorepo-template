import type { DoctorReport, DoctorStatus } from '../../../commands/doctor'
import os from 'node:os'
import pc from 'picocolors'

interface DoctorOutputOptions {
  json?: boolean
  markdown?: boolean
  redact?: boolean
  strict?: boolean
}

function formatDoctorStatus(status: DoctorStatus) {
  if (status === 'pass') {
    return pc.green('PASS')
  }
  if (status === 'warn') {
    return pc.yellow('WARN')
  }
  return pc.red('FAIL')
}

function formatDoctorReport(report: DoctorReport, color = false) {
  const status = color
    ? formatDoctorStatus
    : (value: DoctorStatus) => value.toUpperCase()

  const lines = [
    `workspace: ${report.workspaceDir}`,
    `packages: ${report.packageCount}`,
    '',
  ]

  for (const check of report.checks) {
    lines.push(`[${status(check.status)}] ${check.title}`)
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

function formatDoctorMarkdown(report: DoctorReport) {
  const warningsAndFailures = report.checks.filter(check => check.status !== 'pass')

  return [
    '# Repo doctor report',
    '',
    formatMarkdownTable([
      ['workspace', report.workspaceDir],
      ['packages', report.packageCount],
      ['pass', report.summary.pass],
      ['warn', report.summary.warn],
      ['fail', report.summary.fail],
    ]),
    '',
    ...(warningsAndFailures.length > 0
      ? [
          '## Findings',
          '',
          ...warningsAndFailures.map(check => `- ${check.status}: ${check.title}${check.fix ? ` (fix: ${check.fix})` : ''}`),
          '',
        ]
      : []),
    '## Checks',
    '',
    ...report.checks.map(check => `- ${check.status}: ${check.title}`),
  ].join('\n')
}

function replaceAll(value: string, search: string, replacement: string) {
  return search.length > 0 ? value.split(search).join(replacement) : value
}

function redactDoctorReportValue(value: unknown, replacements: Array<[string, string]>): unknown {
  if (typeof value === 'string') {
    return replacements.reduce((result, [search, replacement]) => replaceAll(result, search, replacement), value)
  }
  if (Array.isArray(value)) {
    return value.map(item => redactDoctorReportValue(item, replacements))
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redactDoctorReportValue(item, replacements)]),
    )
  }
  return value
}

function redactDoctorReport(report: DoctorReport): DoctorReport {
  const candidates: Array<[string, string]> = [
    [report.workspaceDir, '<workspace>'],
    [report.cwd, '<cwd>'],
    [os.homedir(), '<home>'],
  ]
  const replacements = candidates
    .filter(([search], index, entries) => search.length > 0 && entries.findIndex(([value]) => value === search) === index)
    .sort(([left], [right]) => right.length - left.length)

  return redactDoctorReportValue(report, replacements) as DoctorReport
}

export function createDoctorReportOutput(report: DoctorReport, opts: DoctorOutputOptions) {
  const outputReport = opts.redact ? redactDoctorReport(report) : report
  if (opts.json) {
    return JSON.stringify(outputReport, null, 2)
  }
  if (opts.markdown) {
    return formatDoctorMarkdown(outputReport)
  }
  return formatDoctorReport(outputReport)
}

export function createInteractiveDoctorReportOutput(report: DoctorReport, opts: DoctorOutputOptions) {
  const outputReport = opts.redact ? redactDoctorReport(report) : report
  return formatDoctorReport(outputReport, true)
}

export function hasDoctorBlockingIssues(report: DoctorReport, opts: DoctorOutputOptions) {
  return report.summary.fail > 0 || (opts.strict === true && report.summary.warn > 0)
}
