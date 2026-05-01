import type { RecommendedCheckPlan } from '../../../commands/check'
import os from 'node:os'

interface CheckOutputOptions {
  json?: boolean
  markdown?: boolean
  redact?: boolean
}

function formatCheckPlan(plan: RecommendedCheckPlan) {
  const lines = [
    `cwd: ${plan.cwd}`,
    `mode: ${plan.mode}`,
    '',
  ]

  for (const command of plan.commands) {
    lines.push(`- ${command.command}`)
    lines.push(`  ${command.description}`)
  }

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

function formatCheckPlanMarkdown(plan: RecommendedCheckPlan) {
  return [
    '# Repo check plan',
    '',
    formatMarkdownTable([
      ['cwd', plan.cwd],
      ['mode', plan.mode],
      ['commands', plan.commands.length],
    ]),
    '',
    '## Commands',
    '',
    ...plan.commands.map(command => `- \`${command.command}\` - ${command.description}`),
  ].join('\n')
}

function replaceAll(value: string, search: string, replacement: string) {
  return search.length > 0 ? value.split(search).join(replacement) : value
}

function redactCheckPlanValue(value: unknown, replacements: Array<[string, string]>): unknown {
  if (typeof value === 'string') {
    return replacements.reduce((result, [search, replacement]) => replaceAll(result, search, replacement), value)
  }
  if (Array.isArray(value)) {
    return value.map(item => redactCheckPlanValue(item, replacements))
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redactCheckPlanValue(item, replacements)]),
    )
  }
  return value
}

function redactCheckPlan(plan: RecommendedCheckPlan): RecommendedCheckPlan {
  const candidates: Array<[string, string]> = [
    [plan.cwd, '<cwd>'],
    [os.homedir(), '<home>'],
  ]
  const replacements = candidates
    .filter(([search], index, entries) => search.length > 0 && entries.findIndex(([value]) => value === search) === index)
    .sort(([left], [right]) => right.length - left.length)

  return redactCheckPlanValue(plan, replacements) as RecommendedCheckPlan
}

export function createCheckPlanOutput(plan: RecommendedCheckPlan, opts: CheckOutputOptions) {
  const outputPlan = opts.redact ? redactCheckPlan(plan) : plan
  if (opts.json) {
    return JSON.stringify(outputPlan, null, 2)
  }
  if (opts.markdown) {
    return formatCheckPlanMarkdown(outputPlan)
  }
  return formatCheckPlan(outputPlan)
}
