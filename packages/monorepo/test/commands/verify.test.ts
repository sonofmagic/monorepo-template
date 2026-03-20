import type { Buffer } from 'node:buffer'
import type { SpawnSyncReturns } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { verifyPrePush, verifyStagedTypecheck } from '@/commands'

function createSpawnResult(status = 0) {
  return { status } as SpawnSyncReturns<Buffer>
}

const repoRoot = path.resolve(__dirname, '../../../..')

describe('verify commands', () => {
  it('runs pre-push tasks for changed workspace and root files', async () => {
    const execFileMock = vi.fn((command: string, args: string[]) => {
      expect(command).toBe('git')
      if (args[0] === 'diff') {
        return 'packages/monorepo/src/index.ts\npackage.json\n'
      }
      throw new Error(`unexpected git args: ${args.join(' ')}`)
    })
    const spawnMock = vi.fn(() => createSpawnResult())

    await verifyPrePush({
      cwd: repoRoot,
      stdinText: 'refs/heads/main local-sha refs/remotes/origin/main remote-sha',
      execFile: execFileMock as unknown as typeof import('node:child_process').execFileSync,
      spawn: spawnMock as unknown as typeof import('node:child_process').spawnSync,
    })

    expect(spawnMock.mock.calls).toEqual([
      ['pnpm', ['--dir', 'packages/monorepo', 'build'], expect.objectContaining({ cwd: repoRoot, stdio: 'inherit' })],
      ['pnpm', ['--dir', 'packages/monorepo', 'test'], expect.objectContaining({ cwd: repoRoot, stdio: 'inherit' })],
      ['pnpm', ['--dir', 'packages/monorepo', 'tsd'], expect.objectContaining({ cwd: repoRoot, stdio: 'inherit' })],
      ['pnpm', ['build'], expect.objectContaining({ cwd: repoRoot, stdio: 'inherit' })],
      ['pnpm', ['test'], expect.objectContaining({ cwd: repoRoot, stdio: 'inherit' })],
      ['pnpm', ['tsd'], expect.objectContaining({ cwd: repoRoot, stdio: 'inherit' })],
    ])
  })

  it('runs staged typecheck once per resolved workspace', () => {
    const spawnMock = vi.fn(() => createSpawnResult())

    verifyStagedTypecheck([
      'packages/monorepo/src/index.ts',
      'packages/monorepo/test/program.test.ts',
      'README.md',
      'vitest.config.ts',
    ], {
      cwd: repoRoot,
      spawn: spawnMock as unknown as typeof import('node:child_process').spawnSync,
    })

    expect(spawnMock.mock.calls).toEqual([
      ['pnpm', ['--dir', path.join(repoRoot, 'packages/monorepo'), 'typecheck'], expect.objectContaining({ cwd: repoRoot, stdio: 'inherit' })],
      ['pnpm', ['--dir', repoRoot, 'typecheck'], expect.objectContaining({ cwd: repoRoot, stdio: 'inherit' })],
    ])
  })
})
