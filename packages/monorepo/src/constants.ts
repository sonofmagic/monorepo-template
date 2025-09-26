import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { name, version } from '../package.json'

export {
  name,
  version,
}

const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url))

export const packageDir = path.dirname(packageJsonPath)

export const templatesDir = path.join(packageDir, 'templates')

export const assetsDir = path.join(packageDir, 'assets')

export const rootDir = path.resolve(packageDir, '..', '..')
