import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { assetTargets } from '../assets-data.mjs'
import { templateChoices } from '../template-data.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageDir = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(packageDir, '..', '..')
const templatesDir = path.join(packageDir, 'templates')
const skeletonDir = path.join(packageDir, 'skeleton')
const assetsDir = path.join(packageDir, 'assets')
const templateSkipDirs = new Set([
  'node_modules',
  'dist',
  '.turbo',
  '.cache',
  '.vite',
  '.tmp',
  '.vue-global-types',
])

const publishBasename = 'gitignore'
const workspaceBasename = '.gitignore'

function detectSeparator(input) {
  if (input.includes('\\') && !input.includes('/')) {
    return '\\'
  }
  return '/'
}

function replaceBasename(input, from, to) {
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

function toPublishGitignorePath(input) {
  return replaceBasename(input, workspaceBasename, publishBasename)
}

function shouldSkipTemplatePath(rootDir, targetPath) {
  const relative = path.relative(rootDir, targetPath)
  if (!relative || relative.startsWith('..')) {
    return false
  }
  const segments = relative.split(path.sep)
  if (segments.some(segment => templateSkipDirs.has(segment))) {
    return true
  }
  const basename = path.basename(targetPath)
  if (basename.endsWith('.tsbuildinfo')) {
    return true
  }
  if (basename === 'typed-router.d.ts' && segments.includes('types')) {
    return true
  }
  return false
}

async function renameGitignoreFiles(targetDir) {
  const entries = await fs.readdir(targetDir, { withFileTypes: true })
  await Promise.all(entries.map(async (entry) => {
    const current = path.join(targetDir, entry.name)
    if (entry.isDirectory()) {
      await renameGitignoreFiles(current)
      return
    }
    if (entry.name === workspaceBasename) {
      const renamed = path.join(targetDir, publishBasename)
      await fs.rename(current, renamed)
    }
  }))
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

async function resetDir(targetDir) {
  await fs.rm(targetDir, { recursive: true, force: true })
  await fs.mkdir(targetDir, { recursive: true })
}

async function copySkeleton() {
  for (const file of skeletonFiles) {
    const from = path.join(repoRoot, file)
    const to = path.join(skeletonDir, toPublishGitignorePath(file))
    await fs.cp(from, to, { recursive: true })
  }
}

async function copyAssets() {
  for (const target of assetTargets) {
    const from = path.join(repoRoot, target)
    const to = path.join(assetsDir, toPublishGitignorePath(target))
    const stats = await fs.stat(from)
    const copyOptions = { recursive: true }
    if (target === '.husky') {
      await fs.cp(from, to, {
        ...copyOptions,
        filter(src) {
          return !/[\\/]_$/.test(src)
        },
      })
      continue
    }
    await fs.cp(from, to, copyOptions)
    if (stats.isDirectory()) {
      await renameGitignoreFiles(to)
    }
  }
}

async function copyTemplates() {
  for (const template of templateChoices) {
    const from = path.join(repoRoot, 'templates', template.source)
    const to = path.join(templatesDir, template.source)
    await fs.mkdir(path.dirname(to), { recursive: true })
    await fs.cp(from, to, {
      recursive: true,
      filter: src => !shouldSkipTemplatePath(from, src),
    })
    await renameGitignoreFiles(to)
  }
}

async function main() {
  await resetDir(assetsDir)
  await resetDir(templatesDir)
  await resetDir(skeletonDir)
  await copySkeleton()
  await copyAssets()
  await copyTemplates()
}

main().catch((error) => {
  console.error('[monorepo-templates]', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
