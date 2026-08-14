import type { Context } from '../../core/context'
import path from 'pathe'
import fs from '@/utils/fs'

/**
 * 保留兼容的初始化入口，并确保 pnpm change 有可写入的 intent 目录。
 */
export default async function (ctx: Context) {
  if (await fs.exists(ctx.workspaceDir)) {
    await fs.ensureDir(path.join(ctx.workspaceDir, '.changeset'))
  }
}
