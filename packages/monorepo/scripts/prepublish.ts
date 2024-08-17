import { fileURLToPath } from 'node:url'
import path from 'pathe'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../../..')
const assetsDir = path.join(__dirname, '../dist/assets')

await fs.ensureDir(assetsDir)

const targets = [
  '.github',
  '.husky',
  '.vscode',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.npmrc',
  'CODE_OF_CONDUCT.md',
  'commitlint.config.ts',
  'CONTRIBUTING.md',
  'eslint.config.js',
  'LICENSE',
  'lint-staged.config.js',
  'package.json',
  'pnpm-workspace.yaml',
  'renovate.json',
  'SECURITY.md',
  'tsconfig.json',
  'turbo.json',
  'vitest.workspace.ts',
]

for (const t of targets) {
  await fs.copy(path.resolve(rootDir, t), path.resolve(assetsDir, t))
}

console.log('prepare ok!')
