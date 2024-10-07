import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import path from 'pathe'
import { logger } from '../src/logger'
import { getAssetTargets, getTemplateTargets } from '../src/targets'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../../..')
const assetsDir = path.join(__dirname, '../assets')
const templatesDir = path.join(__dirname, '../templates')

await fs.ensureDir(assetsDir)

const assetTargets = getAssetTargets()

for (const t of assetTargets) {
  const from = path.resolve(rootDir, t)
  const to = path.resolve(assetsDir, t)
  if (t === '.husky') {
    await fs.copy(from, to, {
      filter(src) {
        return !/[\\/]_$/.test(src)
      },
    })
  }
  else {
    await fs.copy(from, to)
  }

  logger.success(`assets/${path.relative(assetsDir, to)}`)
}

const templateTargets = getTemplateTargets()

for (const t of templateTargets) {
  const from = path.resolve(rootDir, 'packages', t)
  const to = path.resolve(templatesDir, t)
  await fs.copy(from, to)

  logger.success(`templates/${path.relative(templatesDir, to)}`)
}

logger.success('prepare ok!')
