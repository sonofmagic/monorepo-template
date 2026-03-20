import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const stagedFiles = process.argv.slice(2)

const typecheckExtensions = new Set(['.ts', '.tsx', '.mts', '.cts', '.vue'])

function hasTypecheckScript(dir) {
  const packageJsonPath = path.join(dir, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    return false
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    return typeof packageJson.scripts?.typecheck === 'string' && packageJson.scripts.typecheck.length > 0
  }
  catch {
    return false
  }
}

function resolveWorkspaceDir(filePath) {
  let current = path.dirname(path.resolve(rootDir, filePath))

  while (current.startsWith(rootDir)) {
    if (current !== rootDir && hasTypecheckScript(current)) {
      return current
    }

    const next = path.dirname(current)
    if (next === current) {
      break
    }
    current = next
  }

  return rootDir
}

const workspaceDirs = [...new Set(
  stagedFiles
    .filter(file => typecheckExtensions.has(path.extname(file)))
    .map(resolveWorkspaceDir),
)]

if (workspaceDirs.length === 0) {
  process.exit(0)
}

for (const workspaceDir of workspaceDirs) {
  const label = path.relative(rootDir, workspaceDir) || '.'
  console.log(`[lint-staged:typecheck] ${label}`)
  const result = spawnSync('pnpm', ['--dir', workspaceDir, 'typecheck'], {
    cwd: rootDir,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
