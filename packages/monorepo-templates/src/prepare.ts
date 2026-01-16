import fs from 'node:fs/promises'
import path from 'node:path'
import { assetTargets } from '../assets-data.mjs'
import { templateChoices } from '../template-data.mjs'
import { assetsDir, packageDir, skeletonDir, templatesDir } from './paths'

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

const publishBasename = 'gitignore'
const workspaceBasename = '.gitignore'

function detectSeparator(input: string) {
  if (input.includes('\\') && !input.includes('/')) {
    return '\\'
  }
  return '/'
}

function replaceBasename(input: string, from: string, to: string) {
  if (!input) {
    return input
  }
  const separator = detectSeparator(input)
  const normalized = input.replace(/[\\/]/g, separator)
  const hasTrailingSeparator = normalized.endsWith(separator)
  const segments = normalized.split(separator)
  if (hasTrailingSeparator && segments[segments.length - 1] === '') {
    segments.pop()
  }
  const lastIndex = segments.length - 1
  if (lastIndex >= 0 && segments[lastIndex] === from) {
    segments[lastIndex] = to
    const rebuilt = segments.join(separator)
    return hasTrailingSeparator ? `${rebuilt}${separator}` : rebuilt
  }
  return input
}

function toPublishGitignorePath(input: string) {
  return replaceBasename(input, workspaceBasename, publishBasename)
}

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
  const entries = await fs.readdir(targetDir, { withFileTypes: true })
  await Promise.all(entries.map(async (entry) => {
    const current = path.join(targetDir, entry.name)
    if (entry.isDirectory()) {
      await renameGitignoreFiles(current)
      return
    }
    if (entry.name === workspaceBasename) {
      await fs.rename(current, path.join(targetDir, publishBasename))
    }
  }))
}

async function resetDir(targetDir: string, overwriteExisting: boolean) {
  if (!overwriteExisting && await pathExists(targetDir)) {
    return
  }
  await fs.rm(targetDir, { recursive: true, force: true })
  await fs.mkdir(targetDir, { recursive: true })
}

async function copyEntry(from: string, to: string, overwriteExisting: boolean, filter?: (src: string) => boolean) {
  if (!overwriteExisting && await pathExists(to)) {
    return
  }
  await fs.cp(from, to, {
    recursive: true,
    force: overwriteExisting,
    filter,
  })
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
    await copyEntry(from, to, overwriteExisting)
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
