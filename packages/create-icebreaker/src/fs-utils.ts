import fs from 'node:fs/promises'
import path from 'node:path'
import { shouldSkipTemplatePath, toWorkspaceGitignorePath } from '@icebreakers/monorepo-templates'

export async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath)
    return true
  }
  catch (error) {
    if (error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw error
  }
}

export async function isEmptyDir(dir: string) {
  try {
    const entries = await fs.readdir(dir)
    return entries.length === 0
  }
  catch (error) {
    if (error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return true
    }
    throw error
  }
}

export async function prepareTarget(dir: string, force: boolean) {
  const empty = await isEmptyDir(dir)
  if (empty) {
    await fs.mkdir(dir, { recursive: true })
    return
  }
  if (!force) {
    throw new Error(`Target directory ${dir} is not empty. Pass --force to overwrite.`)
  }
  await fs.rm(dir, { recursive: true, force: true })
  await fs.mkdir(dir, { recursive: true })
}

export async function copyDirContents(sourceDir: string, targetDir: string, rootDir = sourceDir) {
  await fs.mkdir(targetDir, { recursive: true })
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  for (const entry of entries) {
    const from = path.join(sourceDir, entry.name)
    if (shouldSkipTemplatePath(rootDir, from)) {
      continue
    }
    const targetName = toWorkspaceGitignorePath(entry.name)
    const to = path.join(targetDir, targetName)
    if (entry.isDirectory()) {
      await copyDirContents(from, to, rootDir)
      continue
    }
    if (entry.isSymbolicLink()) {
      const link = await fs.readlink(from)
      await fs.symlink(link, to)
      continue
    }
    await fs.cp(from, to)
  }
}

export async function removeIfEmpty(dir: string) {
  try {
    const entries = await fs.readdir(dir)
    if (entries.length === 0) {
      await fs.rm(dir, { recursive: true, force: true })
    }
  }
  catch (error) {
    if (error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return
    }
    throw error
  }
}

export async function removePaths(rootDir: string, paths: string[]) {
  await Promise.all(paths.map(async (relative) => {
    await fs.rm(path.join(rootDir, relative), { recursive: true, force: true })
  }))
}
