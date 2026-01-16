import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

export const packageDir = path.resolve(fileURLToPath(new URL('../', import.meta.url)))
export const templatesDir = path.join(packageDir, 'templates')
export const skeletonDir = path.join(packageDir, 'skeleton')
export const assetsDir = path.join(packageDir, 'assets')
