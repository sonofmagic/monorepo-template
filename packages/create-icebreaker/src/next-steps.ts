import path from 'node:path'
import process from 'node:process'

export function formatNextSteps(targetDir: string) {
  const relative = path.relative(process.cwd(), targetDir) || '.'
  return [
    '',
    'All set! Next steps:',
    `  cd ${relative}`,
    '  pnpm install',
    '  pnpm setup',
    '  pnpm new my-package',
    '  pnpm check',
    '',
  ].join('\n')
}
