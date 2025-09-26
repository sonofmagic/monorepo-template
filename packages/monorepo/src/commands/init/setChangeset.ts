import type { Context } from '../../core/context'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'

/**
 * 将 changeset 配置中的仓库地址指向当前项目，方便自动生成变更日志链接。
 */
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
