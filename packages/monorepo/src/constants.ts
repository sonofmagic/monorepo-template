import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { name, version } from '../package.json'

/**
 * CLI 本身的基础信息，直接复用 package.json 里的 name/version，避免重复维护。
 */
export {
  name,
  version,
}

/**
 * 还原出 package.json 所在的绝对路径，方便后续按目录组织资源文件。
 */
const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url))

/**
 * @icebreakers/monorepo 包的根目录，所有模板与资产目录都以此为基准。
 */
export const packageDir = path.dirname(packageJsonPath)

/**
 * CLI 提供的模板目录，`monorepo new` 会从这里复制目标工程骨架。
 */
export const templatesDir = path.join(packageDir, 'templates')

/**
 * 升级命令需要写入的静态文件集合，位于 assets 目录中。
 */
export const assetsDir = path.join(packageDir, 'assets')

/**
 * monorepo 根目录，方便需要跳出当前包的逻辑（例如定位工作区文件）。
 */
export const rootDir = path.resolve(packageDir, '..', '..')
