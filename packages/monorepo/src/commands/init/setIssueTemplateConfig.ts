import type { Context } from '../../core/context'
import fs from 'fs-extra'
import path from 'pathe'
import { updateIssueTemplateConfig } from '../../utils'

/**
 * 同步 Issue 模版里的 discussions 链接到当前仓库。
 */
export default async function (ctx: Context) {
  const repoName = ctx.gitUrl?.full_name
  if (!repoName) {
    return
  }

  const configPath = path.resolve(ctx.cwd, '.github/ISSUE_TEMPLATE/config.yml')
  if (!await fs.pathExists(configPath)) {
    return
  }

  const source = await fs.readFile(configPath, 'utf8')
  const next = updateIssueTemplateConfig(source, repoName)
  if (next !== source) {
    await fs.writeFile(configPath, next, 'utf8')
  }
}
