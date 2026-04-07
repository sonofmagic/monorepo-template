import fs from 'node:fs'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

describe('CLI entrypoint', () => {
  it('invokes program.parse on startup when arguments are present', async () => {
    const parseMock = vi.fn()
    const outputHelpMock = vi.fn()
    vi.doMock('node:process', () => ({
      default: {
        argv: ['node', 'repoctl', 'init'],
      },
    }))
    vi.doMock('@/cli/program', () => ({ default: { parse: parseMock, outputHelp: outputHelpMock } }))

    await import('@/cli')

    expect(parseMock).toHaveBeenCalledTimes(1)
    expect(outputHelpMock).not.toHaveBeenCalled()
  })

  it('prints help instead of staying silent when no arguments are provided', async () => {
    const parseMock = vi.fn()
    const outputHelpMock = vi.fn()
    vi.doMock('node:process', () => ({
      default: {
        argv: ['node', 'repoctl'],
      },
    }))
    vi.doMock('@/cli/program', () => ({ default: { parse: parseMock, outputHelp: outputHelpMock } }))

    await import('@/cli')

    expect(outputHelpMock).toHaveBeenCalledTimes(1)
    expect(parseMock).not.toHaveBeenCalled()
  })

  it('publishes repoctl, repo, rc, monorepo, and mo bin commands', () => {
    const packageJsonPath = path.resolve(import.meta.dirname, '../package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      bin: Record<string, string>
    }

    expect(packageJson.bin).toEqual({
      rc: 'bin/rc.js',
      repo: 'bin/repo.js',
      repoctl: 'bin/repoctl.js',
      monorepo: 'bin/monorepo.js',
      mo: 'bin/mo.js',
    })
  })
})
