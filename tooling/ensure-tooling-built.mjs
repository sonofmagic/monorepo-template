import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const toolingMarkerPaths = [
  ['packages', 'monorepo', 'dist', 'tooling-entry.mjs'],
  ['packages', 'repoctl', 'dist', 'tooling-entry.mjs'],
]

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export async function ensureToolingBuilt() {
  const missingBuildOutput = toolingMarkerPaths.some(segments => !existsSync(path.join(rootDir, ...segments)))

  if (!missingBuildOutput) {
    return
  }

  execSync('pnpm tooling:build', {
    cwd: rootDir,
    stdio: 'inherit',
  })
}
