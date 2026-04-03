import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ensureToolingBuilt } from './ensure-tooling-built.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const toolingEntryPaths = {
  monorepo: path.join(rootDir, 'packages', 'monorepo', 'dist', 'tooling-entry.mjs'),
  repoctl: path.join(rootDir, 'packages', 'repoctl', 'dist', 'tooling-entry.mjs'),
}

async function importToolingEntry(entryPath, cacheBust = false) {
  const fileUrl = pathToFileURL(entryPath)
  const specifier = cacheBust ? `${fileUrl.href}?t=${Date.now()}` : fileUrl.href

  return import(specifier)
}

async function loadToolingModule(entryPath) {
  await ensureToolingBuilt()

  try {
    return await importToolingEntry(entryPath)
  }
  catch {
    await ensureToolingBuilt()
    return importToolingEntry(entryPath, true)
  }
}

export function loadMonorepoToolingModule() {
  return loadToolingModule(toolingEntryPaths.monorepo)
}

export async function loadRepoctlToolingModule() {
  try {
    return await loadToolingModule(toolingEntryPaths.repoctl)
  }
  catch {
    return loadToolingModule(toolingEntryPaths.monorepo)
  }
}
