import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ensureToolingBuilt } from './ensure-tooling-built.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const toolingEntryPaths = {
  monorepo: path.join(rootDir, 'packages', 'monorepo', 'dist', 'tooling-entry.mjs'),
  repoctl: path.join(rootDir, 'packages', 'repoctl', 'dist', 'tooling-entry.mjs'),
}

function getToolingImportSpecifier(entryPath, cacheBust = false) {
  const fileUrl = pathToFileURL(entryPath)
  return cacheBust ? `${fileUrl.href}?t=${Date.now()}` : fileUrl.href
}

export function isRecoverableToolingLoadError(error) {
  if (!(error instanceof Error)) {
    return false
  }

  const nodeError = /** @type {NodeJS.ErrnoException} */ (error)
  return nodeError.code === 'ERR_MODULE_NOT_FOUND'
    || nodeError.code === 'ENOENT'
    || error.message.includes('Cannot find module')
    || error.message.includes('No such file or directory')
}

async function importToolingEntry(entryPath, cacheBust = false) {
  const specifier = getToolingImportSpecifier(entryPath, cacheBust)
  return import(specifier)
}

export function createToolingModuleLoader({
  ensureBuilt = ensureToolingBuilt,
  importModule = importToolingEntry,
} = {}) {
  return async function loadToolingModule(entryPath) {
    await ensureBuilt()

    try {
      return await importModule(entryPath)
    }
    catch (error) {
      if (!isRecoverableToolingLoadError(error)) {
        throw error
      }

      await ensureBuilt()
      return importModule(entryPath, true)
    }
  }
}

const loadToolingModule = createToolingModuleLoader()

export function loadMonorepoToolingModule() {
  return loadToolingModule(toolingEntryPaths.monorepo)
}

export async function loadRepoctlToolingModule() {
  try {
    return await loadToolingModule(toolingEntryPaths.repoctl)
  }
  catch (error) {
    if (!isRecoverableToolingLoadError(error)) {
      throw error
    }
    return loadToolingModule(toolingEntryPaths.monorepo)
  }
}
