import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'
import * as path from 'node:path'
import { assetTargets } from '../assets-data.mjs'
import { templateChoices } from '../template-data.mjs'
import { assetsDir, packageDir, skeletonDir, templatesDir } from './paths'
import { toPublishGitignorePath } from './utils/gitignore'
import { shouldSkipTemplatePath } from './utils/template-filter'

export interface PrepareAssetsOptions {
  overwriteExisting?: boolean
  silent?: boolean
}

const skeletonFiles = [
  '.editorconfig',
  '.gitignore',
  '.npmrc',
  'package.json',
  'pnpm-workspace.yaml',
  'turbo.json',
  'tsconfig.json',
  'eslint.config.js',
  'stylelint.config.js',
  'vitest.config.ts',
  'commitlint.config.ts',
  'lint-staged.config.js',
  'renovate.json',
  'LICENSE',
]

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath)
    return true
  }
  catch {
    return false
  }
}

async function renameGitignoreFiles(targetDir: string) {
  let entries: Dirent[]
  try {
    entries = await fs.readdir(targetDir, { withFileTypes: true })
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return
    }
    throw error
  }
  await Promise.all(entries.map(async (entry) => {
    const current = path.join(targetDir, entry.name)
    if (entry.isDirectory()) {
      await renameGitignoreFiles(current)
      return
    }
    const renamed = toPublishGitignorePath(entry.name)
    if (renamed !== entry.name) {
      await fs.rename(current, path.join(targetDir, renamed))
    }
  }))
}

async function resetDir(targetDir: string, overwriteExisting: boolean) {
  if (!overwriteExisting && await pathExists(targetDir)) {
    return
  }
  try {
    await fs.rm(targetDir, { recursive: true, force: true })
  }
  catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err?.code !== 'ENOTEMPTY' && err?.code !== 'EBUSY' && err?.code !== 'EPERM') {
      throw error
    }
  }
  await fs.mkdir(targetDir, { recursive: true })
}

async function copyEntry(from: string, to: string, overwriteExisting: boolean, filter?: (src: string) => boolean) {
  if (!overwriteExisting && await pathExists(to)) {
    return
  }
  try {
    await fs.cp(from, to, {
      recursive: true,
      force: overwriteExisting,
      filter,
    })
  }
  catch (error) {
    const err = error as NodeJS.ErrnoException
    if (!overwriteExisting && (err?.code === 'EEXIST' || err?.code === 'ENOTEMPTY')) {
      return
    }
    throw error
  }
}

async function copySkeleton(repoRoot: string, overwriteExisting: boolean) {
  for (const file of skeletonFiles) {
    const from = path.join(repoRoot, file)
    if (!await pathExists(from)) {
      continue
    }
    const to = path.join(skeletonDir, toPublishGitignorePath(file))
    await copyEntry(from, to, overwriteExisting)
  }
}

async function copyAssets(repoRoot: string, overwriteExisting: boolean) {
  for (const target of assetTargets) {
    const from = path.join(repoRoot, target)
    if (!await pathExists(from)) {
      continue
    }
    const to = path.join(assetsDir, toPublishGitignorePath(target))
    const stats = await fs.stat(from)
    const filter = target === '.husky'
      ? (src: string) => !/[\\/]_$/.test(src)
      : undefined
    await copyEntry(from, to, overwriteExisting, filter)
    if (stats.isDirectory()) {
      await renameGitignoreFiles(to)
    }
  }
}

async function copyTemplates(repoRoot: string, overwriteExisting: boolean) {
  for (const template of templateChoices) {
    const from = path.join(repoRoot, 'templates', template.source)
    if (!await pathExists(from)) {
      continue
    }
    const to = path.join(templatesDir, template.source)
    const filter = (src: string) => !shouldSkipTemplatePath(from, src)
    await copyEntry(from, to, overwriteExisting, filter)
    await renameGitignoreFiles(to)
  }
}

export async function prepareAssets(options: PrepareAssetsOptions = {}) {
  const overwriteExisting = options.overwriteExisting ?? true
  const repoRoot = path.resolve(packageDir, '..', '..')
  if (!await pathExists(path.join(repoRoot, 'templates'))) {
    return
  }
  await resetDir(assetsDir, overwriteExisting)
  await resetDir(templatesDir, overwriteExisting)
  await resetDir(skeletonDir, overwriteExisting)
  await copySkeleton(repoRoot, overwriteExisting)
  await copyAssets(repoRoot, overwriteExisting)
  await copyTemplates(repoRoot, overwriteExisting)
}
