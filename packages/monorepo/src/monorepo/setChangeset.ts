import type { Context } from './context'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'

export default async function (ctx: Context) {
  const { gitUrl, workspaceFilepath } = ctx

  if (gitUrl && await fs.exists(workspaceFilepath)) {
    const changesetConfigPath = path.resolve(path.dirname(workspaceFilepath), '.changeset/config.json')
    if (await fs.exists(changesetConfigPath)) {
      const changesetConfig = await fs.readJson(
        changesetConfigPath,
      )
      if (gitUrl.full_name) {
        set(changesetConfig, 'changelog.1.repo', gitUrl.full_name)
        await fs.outputJson(changesetConfigPath, changesetConfig, { spaces: 2 })
      }
    }
  }
}
