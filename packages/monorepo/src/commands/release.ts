import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'

const prereleaseBranches = new Set(['alpha', 'beta', 'rc', 'next'])

export class ReleaseCommandError extends Error {
  constructor(message: string, public readonly exitCode = 1) {
    super(message)
    this.name = 'ReleaseCommandError'
  }
}

export interface ReleaseOptions {
  cwd: string
  branch?: string
  spawn?: typeof spawnSync
}

function run(command: string, args: string[], options: ReleaseOptions) {
  const result = (options.spawn ?? spawnSync)(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    shell: false,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new ReleaseCommandError(`command failed: ${command} ${args.join(' ')}`, result.status ?? 1)
  }
}

function capture(command: string, args: string[], options: ReleaseOptions) {
  const result = (options.spawn ?? spawnSync)(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    shell: false,
    stdio: ['ignore', 'pipe', 'inherit'],
  })

  if (result.status !== 0) {
    throw new ReleaseCommandError(`command failed: ${command} ${args.join(' ')}`, result.status ?? 1)
  }

  return result.stdout?.toString().trim() ?? ''
}

async function readPreState(cwd: string) {
  try {
    const content = await readFile(path.join(cwd, '.changeset/pre.json'), 'utf8')
    return JSON.parse(content) as { mode?: string, tag?: string }
  }
  catch {
    return null
  }
}

function resolveBranch(options: ReleaseOptions) {
  return options.branch?.trim() || process.env['GITHUB_REF_NAME']?.trim() || capture('git', ['rev-parse', '--abbrev-ref', 'HEAD'], options)
}

export async function releaseStable(options: ReleaseOptions) {
  const branch = resolveBranch(options)

  if (branch !== 'main') {
    throw new ReleaseCommandError(`repo release stable is only allowed on main, got ${branch}`)
  }

  const preState = await readPreState(options.cwd)
  if (preState?.mode === 'pre') {
    throw new ReleaseCommandError('stable releases must not run while Changesets prerelease mode is active')
  }

  run('pnpm', ['run', 'build'], options)
  run('pnpm', ['run', 'lint'], options)
  run('pnpm', ['run', 'test'], options)
  run('pnpm', ['exec', 'changeset', 'version'], options)
  run('pnpm', ['exec', 'changeset', 'publish'], options)
}

export async function releasePrerelease(options: ReleaseOptions) {
  const branch = resolveBranch(options)

  if (!prereleaseBranches.has(branch)) {
    throw new ReleaseCommandError(`repo release pre is only allowed on alpha, beta, rc, or next branches, got ${branch}`)
  }

  const preState = await readPreState(options.cwd)
  if (preState?.mode !== 'pre' || preState.tag !== branch) {
    throw new ReleaseCommandError([
      `prerelease branch ${branch} must already be in Changesets pre mode with matching tag`,
      `Run \`repo release pre enter ${branch}\`, commit the resulting .changeset/pre.json, and push again.`,
    ].join('\n'))
  }

  run('pnpm', ['run', 'build'], options)
  run('pnpm', ['run', 'lint'], options)
  run('pnpm', ['run', 'test'], options)
  run('pnpm', ['exec', 'changeset', 'version'], options)

  const hasVersionChanges = (options.spawn ?? spawnSync)('git', ['diff', '--quiet', '--exit-code'], {
    cwd: options.cwd,
    encoding: 'utf8',
    shell: false,
    stdio: 'ignore',
  }).status !== 0

  if (!hasVersionChanges) {
    return
  }

  run('git', ['add', '-A'], options)
  run('git', ['commit', '-m', `chore(release): ${branch} [skip ci]`], options)
  run('pnpm', ['exec', 'changeset', 'publish'], options)
  run('git', ['push', '--follow-tags', 'origin', `HEAD:${branch}`], options)
}

export function enterPrerelease(tag: string, options: ReleaseOptions) {
  if (!prereleaseBranches.has(tag)) {
    throw new ReleaseCommandError(`unknown prerelease tag ${tag}; expected alpha, beta, rc, or next`)
  }
  run('pnpm', ['exec', 'changeset', 'pre', 'enter', tag], options)
}

export function exitPrerelease(options: ReleaseOptions) {
  run('pnpm', ['exec', 'changeset', 'pre', 'exit'], options)
}
