import type { RecommendedCheckPlan } from '../../../commands/check'

interface CheckOutputOptions {
  json?: boolean
  markdown?: boolean
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

export function createCheckPlanOutput(plan: RecommendedCheckPlan, opts: CheckOutputOptions) {
  if (opts.json) {
    return JSON.stringify(plan, null, 2)
  }
  if (opts.markdown) {
    return formatCheckPlanMarkdown(plan)
  }
  return formatCheckPlan(plan)
}
