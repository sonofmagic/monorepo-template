import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { templateChoices } from '../template-data.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageDir = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(packageDir, '..', '..')
const templatesDir = path.join(packageDir, 'templates')
const skeletonDir = path.join(packageDir, 'skeleton')

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
    const to = path.join(skeletonDir, file)
    await fs.cp(from, to, { recursive: true })
  }
}

async function copyTemplates() {
  for (const template of templateChoices) {
    const from = path.join(repoRoot, 'templates', template.source)
    const to = path.join(templatesDir, template.source)
    await fs.mkdir(path.dirname(to), { recursive: true })
    await fs.cp(from, to, { recursive: true })
  }
}

async function main() {
  await resetDir(templatesDir)
  await resetDir(skeletonDir)
  await copySkeleton()
  await copyTemplates()
}

main().catch((error) => {
  console.error('[monorepo-templates]', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
