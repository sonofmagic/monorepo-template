import { createContext } from '../../core/context'
import setChangeset from './setChangeset'
import setPkgJson from './setPkgJson'
import setReadme from './setReadme'

/**
 * 初始化命令入口，根据配置逐步生成基础文件。
 */
export async function init(cwd: string) {
  const ctx = await createContext(cwd)
  const initConfig = ctx.config.commands?.init ?? {}

  if (!initConfig.skipChangeset) {
    await setChangeset(ctx)
  }
  if (!initConfig.skipPkgJson) {
    await setPkgJson(ctx)
  }
  if (!initConfig.skipReadme) {
    await setReadme(ctx)
  }
}
