import { parse, stringify } from 'comment-json'
import fs from 'fs-extra'
import path from 'pathe'
import { resolveCommandConfig } from '../../core/config'
import { chinaMirrorsEnvs } from './sources'
import { setMirror } from './utils'

export async function setVscodeBinaryMirror(cwd: string) {
  const mirrorConfig = await resolveCommandConfig('mirror', cwd)
  const targetJsonPath = path.resolve(cwd, '.vscode/settings.json')

  await fs.ensureFile(targetJsonPath)

  const json = parse(await fs.readFile(targetJsonPath, 'utf8'), undefined, false)

  const env = mirrorConfig?.env ? { ...chinaMirrorsEnvs, ...mirrorConfig.env } : chinaMirrorsEnvs

  json && typeof json === 'object' && setMirror(json, env)

  await fs.writeFile(targetJsonPath, `${stringify(json, undefined, 2)}\n`, 'utf8')
}
