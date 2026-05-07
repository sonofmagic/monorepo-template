import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function capture(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    stdio: ['ignore', 'pipe', 'inherit'],
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }

  return result.stdout.trim()
}

async function readPreState() {
  try {
    const content = await readFile(path.join(repoRoot, '.changeset/pre.json'), 'utf8')
    return JSON.parse(content)
  }
  catch {
    return null
  }
}

const branch = process.env.GITHUB_REF_NAME?.trim() || capture('git', ['rev-parse', '--abbrev-ref', 'HEAD'])

if (branch !== 'main') {
  console.error(`publish-packages is only allowed on main, got ${branch}`)
  process.exit(1)
}

const preState = await readPreState()
if (preState?.mode === 'pre') {
  console.error('main releases must not run while prerelease mode is active')
  process.exit(1)
}

run('pnpm', ['run', 'build'])
run('pnpm', ['run', 'lint'])
run('pnpm', ['run', 'test'])
run('pnpm', ['exec', 'changeset', 'version'])
run('pnpm', ['exec', 'changeset', 'publish'])
