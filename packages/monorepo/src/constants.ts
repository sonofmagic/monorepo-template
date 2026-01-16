import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assetsDir, templatesDir } from '@icebreakers/monorepo-templates'
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
 * @icebreakers/monorepo 包的根目录。
 */
export const packageDir = path.dirname(packageJsonPath)

/**
 * CLI 提供的模板/资产目录来源于 @icebreakers/monorepo-templates。
 */
export { assetsDir, templatesDir }

/**
 * monorepo 根目录，方便需要跳出当前包的逻辑（例如定位工作区文件）。
 */
export const rootDir = path.resolve(packageDir, '..', '..')
