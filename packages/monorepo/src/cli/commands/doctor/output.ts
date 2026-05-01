import type { DoctorReport, DoctorStatus } from '../../../commands/doctor'
import pc from 'picocolors'

interface DoctorOutputOptions {
  json?: boolean
  markdown?: boolean
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

export function createDoctorReportOutput(report: DoctorReport, opts: DoctorOutputOptions) {
  if (opts.json) {
    return JSON.stringify(report, null, 2)
  }
  if (opts.markdown) {
    return formatDoctorMarkdown(report)
  }
  return formatDoctorReport(report)
}

export function createInteractiveDoctorReportOutput(report: DoctorReport) {
  return formatDoctorReport(report, true)
}

export function hasDoctorBlockingIssues(report: DoctorReport, opts: DoctorOutputOptions) {
  return report.summary.fail > 0 || (opts.strict === true && report.summary.warn > 0)
}
