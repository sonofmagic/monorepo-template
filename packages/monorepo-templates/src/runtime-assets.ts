import { access, open, rm } from 'node:fs/promises'
import path from 'node:path'
import { assetsDir, packageDir, templatesDir } from './paths'
import { prepareAssets } from './prepare'

const lockFileName = '.prepare-assets.lock'
const lockPollIntervalMs = 200
const lockTimeoutMs = 30_000

let ensurePromise: Promise<void> | null = null

async function pathExists(targetPath: string) {
  try {
    await access(targetPath)
    return true
  }
  catch {
    return false
  }
}

async function acquireLock(lockPath: string) {
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

async function isPrepared() {
  const checks = [
    path.join(assetsDir, 'AGENTS.md'),
    path.join(assetsDir, 'LICENSE'),
    path.join(templatesDir, 'unbuild'),
  ]
  const results = await Promise.all(checks.map(pathExists))
  return results.every(Boolean)
}

async function waitForPrepared() {
  const deadline = Date.now() + lockTimeoutMs
  while (Date.now() < deadline) {
    if (await isPrepared()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, lockPollIntervalMs))
  }
  return false
}

async function runEnsure() {
  if (await isPrepared()) {
    return
  }

  const lockPath = path.join(packageDir, lockFileName)
  let lockHandle = await acquireLock(lockPath)
  if (!lockHandle) {
    const prepared = await waitForPrepared()
    if (prepared) {
      return
    }
    lockHandle = await acquireLock(lockPath)
    if (!lockHandle) {
      throw new Error(`Failed to prepare template assets: lock is held at ${lockPath}`)
    }
  }

  try {
    // Preserve existing files when multiple processes race on the same workspace.
    await prepareAssets({ overwriteExisting: false, silent: true })
  }
  finally {
    await lockHandle.close().catch(() => {})
    await rm(lockPath, { force: true }).catch(() => {})
  }
}

export async function ensureTemplateAssetsPrepared() {
  if (!ensurePromise) {
    ensurePromise = runEnsure().finally(() => {
      ensurePromise = null
    })
  }
  await ensurePromise
}
