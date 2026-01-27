import { open, rm } from 'node:fs/promises'
import { assetsDir, prepareAssets } from '@icebreakers/monorepo-templates'
import fs from 'fs-extra'
import path from 'pathe'

const lockFileName = '.prepare-assets.lock'
const lockPollIntervalMs = 200
const lockTimeoutMs = 30_000

async function acquirePrepareLock(lockPath: string) {
  try {
    return await open(lockPath, 'wx')
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      return null
    }
    throw error
  }
}

async function waitForAssets(licensePath: string) {
  const deadline = Date.now() + lockTimeoutMs
  while (Date.now() < deadline) {
    if (await fs.pathExists(licensePath)) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, lockPollIntervalMs))
  }
  return false
}

async function ensureAssetsPrepared(): Promise<void> {
  const licensePath = path.join(assetsDir, 'LICENSE')
  if (await fs.pathExists(licensePath)) {
    return
  }

  const lockPath = path.join(path.dirname(assetsDir), lockFileName)
  let lockHandle = await acquirePrepareLock(lockPath)
  if (!lockHandle) {
    const prepared = await waitForAssets(licensePath)
    if (prepared) {
      return
    }
    lockHandle = await acquirePrepareLock(lockPath)
    if (!lockHandle) {
      return
    }
  }

  try {
    // Avoid overwriting existing assets/templates when multiple workers race on Windows.
    await prepareAssets({ silent: true, overwriteExisting: false })
  }
  finally {
    await lockHandle.close().catch(() => {})
    await rm(lockPath, { force: true }).catch(() => {})
  }
}

// eslint-disable-next-line antfu/no-top-level-await
await ensureAssetsPrepared()
