import path from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { formatNextSteps } from './next-steps'

describe('formatNextSteps', () => {
  it('guides users to the repoctl onboarding flow after scaffolding', () => {
    const targetDir = path.join(process.cwd(), 'icebreaker-monorepo')

    const output = formatNextSteps(targetDir)

    expect(output).toContain('All set! Next steps:')
    expect(output).toContain('cd icebreaker-monorepo')
    expect(output).toContain('pnpm install')
    expect(output).toContain('pnpm exec repoctl init')
    expect(output).toContain('pnpm exec repoctl new')
    expect(output).toContain('pnpm exec repoctl check')
    expect(output).not.toContain('pnpm dev')
  })
})
