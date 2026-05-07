import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { updateRootTsconfigReferences } from './tsconfig'

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

describe('updateRootTsconfigReferences', () => {
  it('writes references for existing workspace packages only', async () => {
    const targetDir = await mkdtemp(path.join(tmpdir(), 'create-icebreaker-tsconfig-'))

    try {
      await writeJson(path.join(targetDir, 'tsconfig.json'), {
        extends: 'repoctl/tsconfig.json',
        files: [],
        references: [
          { path: './packages/repoctl' },
        ],
      })

      await Promise.all([
        mkdir(path.join(targetDir, 'packages/tool-a'), { recursive: true }),
        mkdir(path.join(targetDir, 'packages/tool-b'), { recursive: true }),
        mkdir(path.join(targetDir, 'templates/cli'), { recursive: true }),
      ])
      await Promise.all([
        writeJson(path.join(targetDir, 'packages/tool-a/package.json'), { name: 'tool-a' }),
        writeJson(path.join(targetDir, 'packages/tool-a/tsconfig.json'), {}),
        writeJson(path.join(targetDir, 'packages/tool-b/package.json'), { name: 'tool-b' }),
        writeJson(path.join(targetDir, 'templates/cli/package.json'), { name: 'cli' }),
        writeJson(path.join(targetDir, 'templates/cli/tsconfig.json'), {}),
      ])

      await updateRootTsconfigReferences(targetDir)

      const tsconfig = JSON.parse(await readFile(path.join(targetDir, 'tsconfig.json'), 'utf8')) as {
        references: Array<{ path: string }>
      }
      expect(tsconfig.references).toEqual([
        { path: './packages/tool-a' },
        { path: './templates/cli' },
      ])
    }
    finally {
      await rm(targetDir, { force: true, recursive: true })
    }
  })
})
