import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const prereleaseBranches = new Set(['alpha', 'beta', 'rc', 'next'])

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

if (!prereleaseBranches.has(branch)) {
  console.error(`release:pre is only allowed on alpha, beta, rc, or next branches, got ${branch}`)
  process.exit(1)
}

const preState = await readPreState()
if (preState?.mode !== 'pre' || preState.tag !== branch) {
  console.error(`prerelease branch ${branch} must already be in Changesets pre mode with matching tag`)
  console.error(`Run \`pnpm pr:${branch}\` locally, commit the resulting .changeset/pre.json, and push again.`)
  process.exit(1)
}

run('pnpm', ['run', 'build'])
run('pnpm', ['run', 'lint'])
run('pnpm', ['run', 'test'])
run('pnpm', ['exec', 'changeset', 'version'])

const hasVersionChanges = spawnSync('git', ['diff', '--quiet', '--exit-code'], {
  cwd: repoRoot,
  encoding: 'utf8',
  shell: false,
  stdio: 'ignore',
}).status !== 0

if (!hasVersionChanges) {
  console.log(`No prerelease version changes detected on ${branch}.`)
  process.exit(0)
}

run('git', ['add', '-A'])
run('git', ['commit', '-m', `chore(release): ${branch} [skip ci]`])
run('pnpm', ['exec', 'changeset', 'publish'])
run('git', ['push', '--follow-tags', 'origin', `HEAD:${branch}`])
