import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

function mockProgram() {
  vi.doMock('@icebreakers/monorepo-templates', async () => {
    const actual = await vi.importActual<typeof import('@icebreakers/monorepo-templates')>('@icebreakers/monorepo-templates')
    return {
      ...actual,
      program: new actual.Command(),
    }
  })
}

function createWorkspaceSummary() {
  return {
    cwd: '/repo',
    workspaceDir: '/repo',
    packages: [
      {
        name: 'pkg-a',
        private: false,
        rootDir: '/repo/packages/a',
        relativeDir: 'packages/a',
        pkgJsonPath: '/repo/packages/a/package.json',
      },
    ],
  }
}

describe('commander program workspace command', () => {
  it('writes workspace list json to a file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-workspace-list-'))
    const reportPath = path.join(root, 'reports/workspaces.json')
    const getWorkspacePackageSummariesMock = vi.fn(async () => createWorkspaceSummary())

    try {
      mockProgram()
      vi.doMock('@/core/workspace', () => ({
        getWorkspacePackageSummaries: getWorkspacePackageSummariesMock,
      }))

      const logMock = vi.fn()
      const successMock = vi.fn()
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: logMock,
          success: successMock,
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'workspace', 'list', '--json', '--out', reportPath])

      expect(JSON.parse(await readFile(reportPath, 'utf8'))).toEqual(expect.objectContaining({
        workspaceDir: '/repo',
        packages: [expect.objectContaining({ name: 'pkg-a' })],
      }))
      expect(logMock).not.toHaveBeenCalledWith(expect.stringContaining('"packages"'))
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('workspaces.json'))
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('writes workspace list text to a file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'repo-workspace-list-'))
    const reportPath = path.join(root, 'reports/workspaces.txt')
    const getWorkspacePackageSummariesMock = vi.fn(async () => createWorkspaceSummary())

    try {
      mockProgram()
      vi.doMock('@/core/workspace', () => ({
        getWorkspacePackageSummaries: getWorkspacePackageSummariesMock,
      }))

      const logMock = vi.fn()
      const successMock = vi.fn()
      vi.doMock('@/core/logger', () => ({
        logger: {
          log: logMock,
          success: successMock,
        },
      }))

      const { default: program } = await import('@/cli/program')
      await program.parseAsync(['node', 'repo', 'ws', 'ls', '--out', reportPath])

      expect(await readFile(reportPath, 'utf8')).toContain('- pkg-a packages/a')
      expect(logMock).not.toHaveBeenCalled()
      expect(successMock).toHaveBeenCalledWith(expect.stringContaining('workspaces.txt'))
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
