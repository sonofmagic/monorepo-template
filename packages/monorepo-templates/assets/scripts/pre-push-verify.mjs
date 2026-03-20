import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const hookStdin = fs.readFileSync(process.stdin.fd, 'utf8').trim()
const hookLines = hookStdin.length > 0 ? hookStdin.split('\n') : []
const zeroSha = '0'.repeat(40)

const workspaces = [
  'packages/create-icebreaker',
  'packages/monorepo',
  'packages/monorepo-templates',
  'templates/cli',
  'templates/client',
  'templates/server',
  'templates/tsdown',
  'templates/tsup',
  'templates/unbuild',
  'templates/vitepress',
  'templates/vue-lib',
].sort((left, right) => right.length - left.length)

function getChangedFilesForRange(base, head) {
  const output = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', `${base}...${head}`], {
    cwd: rootDir,
    encoding: 'utf8',
  })
  return output.split('\n').filter(Boolean)
}

function getChangedFilesForNewRemote(head) {
  const emptyTree = execFileSync('git', ['hash-object', '-t', 'tree', '--stdin'], {
    cwd: rootDir,
    encoding: 'utf8',
    input: '',
  }).trim()
  const output = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', emptyTree, head], {
    cwd: rootDir,
    encoding: 'utf8',
  })
  return output.split('\n').filter(Boolean)
}

function getRootLevelTasksForFile(filePath) {
  const basename = path.basename(filePath)
  if (filePath.startsWith('.github/')) {
    return ['build', 'test', 'tsd']
  }
  if (filePath === 'package.json' || filePath === 'pnpm-lock.yaml' || filePath === 'turbo.json' || filePath === 'pnpm-workspace.yaml') {
    return ['build', 'test', 'tsd']
  }
  if (basename.startsWith('tsconfig') || filePath === 'lint-staged.config.js' || filePath.startsWith('scripts/')) {
    return ['build', 'test', 'tsd']
  }
  return []
}

function resolveWorkspaceDir(filePath) {
  const normalized = filePath.split(path.sep).join('/')
  for (const workspace of workspaces) {
    if (normalized === workspace || normalized.startsWith(`${workspace}/`)) {
      return workspace
    }
  }
  return null
}

function getPackageScripts(dir) {
  const packageJsonPath = path.join(rootDir, dir, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    return {}
  }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  return packageJson.scripts ?? {}
}

const tasksByWorkspace = new Map()
const rootTasks = new Set()

for (const line of hookLines) {
  const [, localSha, , remoteSha] = line.trim().split(/\s+/)
  if (!localSha || localSha === zeroSha) {
    continue
  }

  const changedFiles = remoteSha && remoteSha !== zeroSha
    ? getChangedFilesForRange(remoteSha, localSha)
    : getChangedFilesForNewRemote(localSha)

  for (const file of changedFiles) {
    const workspace = resolveWorkspaceDir(file)
    if (workspace) {
      const tasks = tasksByWorkspace.get(workspace) ?? new Set()
      tasks.add('build')
      tasks.add('test')
      tasks.add('tsd')
      tasksByWorkspace.set(workspace, tasks)
      continue
    }

    for (const task of getRootLevelTasksForFile(file)) {
      rootTasks.add(task)
    }
  }
}

for (const [workspace, tasks] of tasksByWorkspace) {
  const scripts = getPackageScripts(workspace)
  for (const task of [...tasks]) {
    if (typeof scripts[task] !== 'string' || scripts[task].length === 0) {
      tasks.delete(task)
    }
  }
}

if (tasksByWorkspace.size === 0 && rootTasks.size === 0) {
  process.exit(0)
}

for (const [workspace, tasks] of [...tasksByWorkspace.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  for (const task of ['build', 'test', 'tsd']) {
    if (!tasks.has(task)) {
      continue
    }

    console.log(`[pre-push:${task}] ${workspace}`)
    const result = spawnSync('pnpm', ['--dir', workspace, task], {
      cwd: rootDir,
      stdio: 'inherit',
    })

    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  }
}

for (const task of ['build', 'test', 'tsd']) {
  if (!rootTasks.has(task)) {
    continue
  }

  console.log(`[pre-push:${task}] .`)
  const result = spawnSync('pnpm', [task], {
    cwd: rootDir,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
