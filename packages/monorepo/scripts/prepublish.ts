import { fileURLToPath } from 'node:url'
import path from 'pathe'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../../..')
const assetsDir = path.join(__dirname, '../dist/assets')

await fs.ensureDir(assetsDir)

const targets = [
  '.changeset',
  '.github',
  '.husky',
  '.vscode',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.npmrc',
  'commitlint.config.ts',
  'eslint.config.js',
  'LICENSE',
  'lint-staged.config.js',
  'package.json',
  // pnpm
  'pnpm-workspace.yaml',
  // renovate
  'renovate.json',
  // base tsconfig
  'tsconfig.json',
  // turbo
  'turbo.json',
  // vitest
  'vitest.workspace.ts',
  // #region docker
  'Dockerfile',
  '.dockerignore',
  // #endregion
  // #region markdown
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  // #endregion
]

for (const t of targets) {
  await fs.copy(path.resolve(rootDir, t), path.resolve(assetsDir, t))
}

console.log('prepare ok!')
