import process from 'node:process'
import { pathToFileURL } from 'node:url'
import fs from 'fs-extra'
import path from 'pathe'
import { getAssetTargets } from '../src/commands/upgrade/targets'
import { assetsDir, rootDir, templatesDir } from '../src/constants'
import { logger } from '../src/core/logger'
import { isIgnorableFsError, toPublishGitignorePath } from '../src/utils'

import { getTemplateTargets } from './getTemplateTargets'

interface PrepareAssetsOptions {
  silent?: boolean
}

export async function prepareAssets(options: PrepareAssetsOptions = {}) {
  const log = options.silent ? (_message: string) => {} : (message: string) => logger.success(message)

  await fs.ensureDir(assetsDir)

  const assetTargets = getAssetTargets()

  for (const t of assetTargets) {
    const from = path.resolve(rootDir, t)
    const to = path.resolve(assetsDir, toPublishGitignorePath(t))
    if (!await fs.pathExists(from)) {
      continue
    }
    try {
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
    }
    catch (error) {
      if (isIgnorableFsError(error)) {
        continue
      }
      throw error
    }

    log(`assets/${path.relative(assetsDir, to)}`)
  }

  const templateTargets = await getTemplateTargets()

  for (const t of templateTargets) {
    const from = path.resolve(rootDir, t)
    const to = path.resolve(templatesDir, toPublishGitignorePath(t))
    try {
      await fs.copy(from, to)
    }
    catch (error) {
      if (isIgnorableFsError(error)) {
        continue
      }
      throw error
    }

    log(`templates/${path.relative(templatesDir, to)}`)
  }

  log('prepare ok!')
}

async function runCli() {
  await prepareAssets()
}

const isDirectInvocation = (() => {
  try {
    return process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url
  }
  catch {
    return false
  }
})()

if (isDirectInvocation) {
  runCli().catch((error) => {
    logger.error(error)
    process.exitCode = 1
  })
}
