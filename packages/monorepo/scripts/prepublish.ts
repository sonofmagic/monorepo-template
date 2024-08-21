import { fileURLToPath } from 'node:url'
import path from 'pathe'
import fs from 'fs-extra'
import { getTargets } from '../src/targets'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../../..')
const assetsDir = path.join(__dirname, '../assets')

await fs.ensureDir(assetsDir)

const targets = getTargets()

for (const t of targets) {
  await fs.copy(path.resolve(rootDir, t), path.resolve(assetsDir, t))
}

console.log('prepare ok!')
