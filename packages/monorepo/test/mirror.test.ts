import { tmpdir } from 'node:os'
import fs from 'fs-extra'
import path from 'pathe'
import { afterEach } from 'vitest'
import { setVscodeBinaryMirror } from '@/monorepo/mirror/binaryMirror'
import { chinaMirrorsEnvs } from '@/monorepo/mirror/sources'
import { setMirror } from '@/monorepo/mirror/utils'

const tempDirs: string[] = []

afterEach(async () => {
  while (tempDirs.length) {
    const dir = tempDirs.pop()
    if (dir) {
      await fs.remove(dir)
    }
  }
})

describe('mirror', () => {
  it('setMirror', () => {
    const settingsJson = {}
    setMirror(settingsJson)
    expect(settingsJson).toMatchSnapshot()
  })

  it('setVscodeBinaryMirror merges mirrors into settings', async () => {
    const root = await fs.mkdtemp(path.join(tmpdir(), 'monorepo-mirror-'))
    tempDirs.push(root)
    const vscodeDir = path.join(root, '.vscode')
    await fs.ensureDir(vscodeDir)
    const settingsPath = path.join(vscodeDir, 'settings.json')
    await fs.writeJSON(settingsPath, {
      'terminal.integrated.env.linux': {
        EXISTING: '1',
      },
    })

    await setVscodeBinaryMirror(root)

    const content = await fs.readJSON(settingsPath)
    expect(content['terminal.integrated.env.linux']).toMatchObject(chinaMirrorsEnvs)
    expect(content['terminal.integrated.env.linux']).not.toHaveProperty('EXISTING')
    expect(content['terminal.integrated.env.windows']).toMatchObject(chinaMirrorsEnvs)
    expect(content['terminal.integrated.env.osx']).toMatchObject(chinaMirrorsEnvs)
  })
})
