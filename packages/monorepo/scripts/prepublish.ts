import fs from 'fs-extra'
import path from 'pathe'
import { getAssetTargets } from '../src/commands/upgrade/targets'
import { assetsDir, rootDir, templatesDir } from '../src/constants'
import { logger } from '../src/core/logger'

import { getTemplateTargets } from './getTemplateTargets'

await fs.ensureDir(assetsDir)

const assetTargets = getAssetTargets()

for (const t of assetTargets) {
  const from = path.resolve(rootDir, t)
  const to = path.resolve(assetsDir, t.endsWith('.gitignore') ? t.replace(/\.gitignore$/, 'gitignore') : t)
  if (!await fs.pathExists(from)) {
    continue
  }
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

const templateTargets = await getTemplateTargets()

for (const t of templateTargets) {
  const from = path.resolve(rootDir, t)
  const to = path.resolve(templatesDir, t.endsWith('.gitignore') ? t.replace(/\.gitignore$/, 'gitignore') : t)
  await fs.copy(from, to)

  logger.success(`templates/${path.relative(templatesDir, to)}`)
}

logger.success('prepare ok!')
