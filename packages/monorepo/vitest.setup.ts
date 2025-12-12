import fs from 'fs-extra'
import path from 'pathe'
import { assetsDir } from '@/constants'
import { prepareAssets } from './scripts/prepublish'

async function ensureAssetsPrepared(): Promise<void> {
  const licensePath = path.join(assetsDir, 'LICENSE')
  if (await fs.pathExists(licensePath)) {
    return
  }

  // Avoid overwriting existing assets/templates when multiple workers race on Windows.
  await prepareAssets({ silent: true, overwriteExisting: false })
}

// eslint-disable-next-line antfu/no-top-level-await
await ensureAssetsPrepared()
