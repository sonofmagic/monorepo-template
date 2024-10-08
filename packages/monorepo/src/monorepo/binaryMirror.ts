import { parse, stringify } from 'comment-json'
import fs from 'fs-extra'
import path from 'pathe'
import { setMirror } from './mirror'

export async function setVscodeBinaryMirror(cwd: string) {
  const targetJsonPath = path.resolve(cwd, '.vscode/settings.json')

  await fs.ensureFile(targetJsonPath)

  const json = parse(await fs.readFile(targetJsonPath, 'utf8'), undefined, false)

  json && typeof json === 'object' && setMirror(json)

  await fs.writeFile(targetJsonPath, `${stringify(json, undefined, 2)}\n`, 'utf8')
}
