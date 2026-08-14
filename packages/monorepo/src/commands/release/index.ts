import { spawnSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import YAML from 'yaml'
import { getWorkspaceData } from '../../core/workspace'

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

export interface PublishedPackage {
  name: string
  version: string
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

function hasGitChanges(options: ReleaseOptions) {
  return (options.spawn ?? spawnSync)('git', ['diff', '--quiet', '--exit-code'], {
    cwd: options.cwd,
    encoding: 'utf8',
    shell: false,
    stdio: 'ignore',
  }).status !== 0
}

async function hasPendingIntents(cwd: string) {
  try {
    const entries = await readdir(path.join(cwd, '.changeset'), { withFileTypes: true })
    return entries.some(entry => entry.isFile() && entry.name.endsWith('.md'))
  }
  catch {
    return false
  }
}

function resolveBranch(options: ReleaseOptions) {
  return options.branch?.trim() || process.env['GITHUB_REF_NAME']?.trim() || capture('git', ['rev-parse', '--abbrev-ref', 'HEAD'], options)
}

async function getPublishablePackageNames(cwd: string) {
  const { packages } = await getWorkspaceData(cwd)
  const names = packages
    .map(pkg => pkg.manifest.name)
    .filter((name): name is string => Boolean(name))
  if (!names.length) {
    throw new ReleaseCommandError('no publishable workspace packages were found')
  }
  return names
}

function packageFilters(names: string[]) {
  return names.flatMap(name => ['--filter', name])
}

async function runLane(lane: string, options: ReleaseOptions) {
  const names = await getPublishablePackageNames(options.cwd)
  run('pnpm', ['lane', lane, ...packageFilters(names)], options)
}

async function readLaneAssignments(cwd: string) {
  try {
    const workspaceFile = await readFile(path.join(cwd, 'pnpm-workspace.yaml'), 'utf8')
    const manifest = YAML.parse(workspaceFile) as { versioning?: { lanes?: Record<string, string> } }
    return manifest.versioning?.lanes ?? {}
  }
  catch {
    return {}
  }
}

async function assertLaneAssignments(lane: string, options: ReleaseOptions) {
  const names = await getPublishablePackageNames(options.cwd)
  const assignments = await readLaneAssignments(options.cwd)
  const mismatched = names.filter(name => assignments[name] !== lane)
  if (mismatched.length) {
    throw new ReleaseCommandError([
      `all publishable packages must be on the ${lane} lane before prerelease publishing`,
      `mismatched packages: ${mismatched.join(', ')}`,
      `Run \`repo release pre enter ${lane}\`, commit pnpm-workspace.yaml, and push again.`,
    ].join('\n'))
  }
}

async function assertStableLaneAssignments(options: ReleaseOptions) {
  const assignments = await readLaneAssignments(options.cwd)
  const active = Object.entries(assignments).filter(([, lane]) => lane !== 'main')
  if (active.length) {
    throw new ReleaseCommandError(`stable releases require all packages on the main lane, found ${active.map(([name, lane]) => `${name}:${lane}`).join(', ')}`)
  }
}

async function runQualityChecks(options: ReleaseOptions) {
  run('pnpm', ['run', 'build'], options)
  run('pnpm', ['run', 'lint'], options)
  run('pnpm', ['run', 'test'], options)
}

export async function prepareStable(options: ReleaseOptions) {
  const branch = resolveBranch(options)
  if (branch !== 'main') {
    throw new ReleaseCommandError(`repo release stable prepare is only allowed on main, got ${branch}`)
  }
  await assertStableLaneAssignments(options)
  await runQualityChecks(options)
  if (!await hasPendingIntents(options.cwd)) {
    return false
  }
  run('pnpm', ['version', '-r', '--no-git-checks'], options)
  return hasGitChanges(options)
}

export async function publishStable(options: ReleaseOptions) {
  const branch = resolveBranch(options)
  if (branch !== 'main') {
    throw new ReleaseCommandError(`repo release stable publish is only allowed on main, got ${branch}`)
  }
  await assertStableLaneAssignments(options)
  await runQualityChecks(options)
  run('pnpm', ['publish', '-r', '--report-summary', '--provenance', '--no-git-checks'], options)
}

/** Compatibility entry point retained for existing generated repositories. */
export async function releaseStable(options: ReleaseOptions) {
  await publishStable(options)
}

export async function releasePrerelease(options: ReleaseOptions) {
  const branch = resolveBranch(options)
  if (!prereleaseBranches.has(branch)) {
    throw new ReleaseCommandError(`repo release pre is only allowed on alpha, beta, rc, or next branches, got ${branch}`)
  }

  await assertLaneAssignments(branch, options)
  await runQualityChecks(options)
  if (!await hasPendingIntents(options.cwd)) {
    return
  }

  run('pnpm', ['version', '-r', '--no-git-checks'], options)
  if (!hasGitChanges(options)) {
    return
  }

  run('git', ['add', '-A'], options)
  run('git', ['commit', '-m', `chore(release): ${branch} [skip ci]`], options)
  run('pnpm', ['publish', '-r', '--tag', branch, '--report-summary', '--provenance', '--no-git-checks'], options)
  run('git', ['push', '--follow-tags', 'origin', `HEAD:${branch}`], options)
}

export async function enterPrerelease(tag: string, options: ReleaseOptions) {
  if (!prereleaseBranches.has(tag)) {
    throw new ReleaseCommandError(`unknown prerelease lane ${tag}; expected alpha, beta, rc, or next`)
  }
  await runLane(tag, options)
}

export async function exitPrerelease(options: ReleaseOptions) {
  await runLane('main', options)
}

export function parsePublishSummary(content: string): PublishedPackage[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  }
  catch {
    throw new ReleaseCommandError('pnpm-publish-summary.json is not valid JSON')
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as { publishedPackages?: unknown }).publishedPackages)) {
    throw new ReleaseCommandError('pnpm-publish-summary.json does not contain publishedPackages')
  }

  return (parsed as { publishedPackages: unknown[] }).publishedPackages.map((item) => {
    if (!item || typeof item !== 'object' || typeof (item as { name?: unknown }).name !== 'string' || typeof (item as { version?: unknown }).version !== 'string') {
      throw new ReleaseCommandError('pnpm-publish-summary.json contains an invalid package entry')
    }
    return {
      name: (item as { name: string }).name,
      version: (item as { version: string }).version,
    }
  })
}
