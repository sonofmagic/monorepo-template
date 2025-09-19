import fs from 'fs-extra'
import path from 'pathe'
import { assetsDir, rootDir, templatesDir } from '../src/constants'
import { logger } from '../src/logger'
import { getAssetTargets } from '../src/targets'

import { getTemplateTargets } from './getTemplateTargets'

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

const templateTargets = await getTemplateTargets()

for (const t of templateTargets) {
  const from = path.resolve(rootDir, t)
  const to = path.resolve(templatesDir, t)
  await fs.copy(from, to)

  logger.success(`templates/${path.relative(templatesDir, to)}`)
}

logger.success('prepare ok!')
