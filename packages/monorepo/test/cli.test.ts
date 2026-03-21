import fs from 'node:fs'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

describe('CLI entrypoint', () => {
  it('invokes program.parse on startup', async () => {
    const parseMock = vi.fn()
    vi.doMock('@/cli/program', () => ({ default: { parse: parseMock } }))

    await import('@/cli')

    expect(parseMock).toHaveBeenCalledTimes(1)
  })

  it('publishes repoctl, monorepo, and mo bin commands', () => {
    const packageJsonPath = path.resolve(import.meta.dirname, '../package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      bin: Record<string, string>
    }

    expect(packageJson.bin).toEqual({
      repoctl: 'bin/repoctl.js',
      monorepo: 'bin/monorepo.js',
      mo: 'bin/mo.js',
    })
  })
})
