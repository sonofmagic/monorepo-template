import path from 'node:path'
import process from 'node:process'

export function formatNextSteps(targetDir: string) {
  const relative = path.relative(process.cwd(), targetDir) || '.'
  return [
    '',
    'All set! Next steps:',
    `  cd ${relative}`,
    '  pnpm install',
    '  pnpm exec repoctl init',
    '  pnpm exec repoctl new',
    '  pnpm exec repoctl check',
    '',
  ].join('\n')
}
