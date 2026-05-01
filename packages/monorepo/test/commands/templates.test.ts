import { tmpdir } from 'node:os'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import fs from '@/utils/fs'

async function createTempTemplatesDir() {
  return fs.mkdtemp(path.join(tmpdir(), 'monorepo-template-health-'))
}

describe('checkTemplates', () => {
  it('reports healthy packaged templates', async () => {
    const { checkTemplates } = await import('@/commands/templates')
    const report = await checkTemplates()

    expect(report.templateCount).toBeGreaterThan(0)
    expect(report.summary.fail).toBe(0)
    expect(report.checks.some(check => check.id === 'unique-source' && check.status === 'pass')).toBe(true)
    expect(report.checks.some(check => check.id === 'metadata' && check.status === 'pass')).toBe(true)
  })

  it('flags missing sources when checking another templates directory', async () => {
    const templatesDir = await createTempTemplatesDir()

    const { checkTemplates } = await import('@/commands/templates')
    const report = await checkTemplates({ templatesDir })

    expect(report.summary.fail).toBeGreaterThan(0)
    expect(report.checks.some(check => check.id === 'source-dir' && check.status === 'fail')).toBe(true)

    await fs.remove(templatesDir)
  })
})
