import type { ReleaseOptions } from './types'
import { readdir, readFile } from 'node:fs/promises'
import path from 'pathe'
import { getWorkspacePackages } from '../../core/workspace'
import { capture } from './shared'

interface PackageJsonVersion {
  name?: unknown
  version?: unknown
}

interface PackageRelease {
  name: string
  version: string
  content: string
}

export interface ReleaseCommit {
  sha: string
  subject: string
  body?: string
}

export interface ReleaseBodyMetadata {
  commits?: ReleaseCommit[]
  repository?: string
  serverUrl?: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readVersionSection(changelog: string, version: string) {
  const header = new RegExp(`^## ${escapeRegExp(version)}$`, 'm')
  const match = header.exec(changelog)
  if (!match || match.index === undefined) {
    return undefined
  }

  const sectionStart = match.index
  const nextSection = /^## /gm
  nextSection.lastIndex = sectionStart + match[0].length
  const nextMatch = nextSection.exec(changelog)
  const section = changelog.slice(sectionStart, nextMatch?.index ?? changelog.length).trim()
  const content = section.slice(match[0].length).trim()
  return content || undefined
}

async function readPackageRelease(name: string, version: string, rootDir: string) {
  let changelog: string
  try {
    changelog = await readFile(path.join(rootDir, 'CHANGELOG.md'), 'utf8')
  }
  catch {
    return undefined
  }

  const content = readVersionSection(changelog, version)
  if (!content) {
    return undefined
  }
  return { name, version, content }
}

function formatReleases(releases: PackageRelease[]) {
  if (!releases.length) {
    return 'No package changelog entries were generated.'
  }

  const summary = [
    '| Package | Version |',
    '| --- | --- |',
    ...releases.map(release => `| \`${release.name}\` | \`${release.version}\` |`),
  ].join('\n')
  const details = releases
    .map(release => [`## \`${release.name}\` \`${release.version}\``, '', release.content].join('\n'))
    .join('\n\n')

  return [summary, '', '---', '', details].join('\n')
}

function parseReferences(commits: ReleaseCommit[], releaseContent: string) {
  const pullRequests = new Set<string>()
  const issues = new Set<string>()

  for (const message of [
    ...commits.map(commit => `${commit.subject}\n${commit.body ?? ''}`),
    releaseContent,
  ]) {
    for (const match of message.matchAll(/\(#(\d+)\)/g)) {
      pullRequests.add(match[1] as string)
    }
    for (const match of message.matchAll(/(?:^|\W)#(\d+)\b/g)) {
      if (!pullRequests.has(match[1] as string)) {
        issues.add(match[1] as string)
      }
    }
    for (const match of message.matchAll(/\bGH[- ]?(\d+)\b/gi)) {
      issues.add(match[1] as string)
    }
  }

  return { issues, pullRequests }
}

function formatRelatedLinks(metadata: ReleaseBodyMetadata = {}, releases: PackageRelease[] = []) {
  const commits = [...new Map((metadata.commits ?? []).map(commit => [commit.sha, commit])).values()]
  if (!commits.length) {
    return ''
  }

  const repository = metadata.repository && /^[^/]+\/[^/]+$/.test(metadata.repository)
    ? metadata.repository
    : undefined
  const serverUrl = (metadata.serverUrl || 'https://github.com').replace(/\/$/, '')
  const baseUrl = repository ? `${serverUrl}/${repository}` : undefined
  const { issues, pullRequests } = parseReferences(commits, releases.map(release => release.content).join('\n'))
  const sections = [
    '## Related links',
    '',
    '### Commits',
    ...commits.map((commit) => {
      const label = commit.sha.slice(0, 7)
      const link = baseUrl ? `[\`${label}\`](${baseUrl}/commit/${commit.sha})` : `\`${label}\``
      return `- ${link} ${commit.subject || 'Release source change'}`
    }),
  ]

  if (pullRequests.size) {
    sections.push('', '### Pull requests', ...[...pullRequests].sort((a, b) => Number(a) - Number(b)).map(number => (
      `- [#${number}](${baseUrl ? `${baseUrl}/pull/${number}` : `#${number}`})`
    )))
  }
  if (issues.size) {
    sections.push('', '### Issues', ...[...issues].sort((a, b) => Number(a) - Number(b)).map(number => (
      `- [#${number}](${baseUrl ? `${baseUrl}/issues/${number}` : `#${number}`})`
    )))
  }

  return sections.join('\n')
}

/**
 * Captures the commits that introduced pending intents before pnpm consumes them.
 * The intent files are the only reliable local association between a release
 * entry and its source change; the version commit itself is deliberately excluded.
 */
export async function readPendingIntentCommits(options: ReleaseOptions) {
  let entries
  try {
    entries = await readdir(path.join(options.cwd, '.changeset'), { withFileTypes: true })
  }
  catch {
    return []
  }

  const commits: ReleaseCommit[] = []
  for (const entry of entries) {
    if (!entry.isFile() || entry.name === 'README.md' || !entry.name.endsWith('.md')) {
      continue
    }
    try {
      const intentPath = `.changeset/${entry.name}`
      const sha = capture('git', ['log', '-1', '--format=%H', '--', intentPath], options)
      if (!sha) {
        continue
      }
      const metadata = capture('git', ['show', '-s', '--format=%H%x1F%s%x1F%b', sha], options)
      const [fullSha, subject, body] = metadata.split('\x1F')
      if (fullSha) {
        commits.push({ sha: fullSha, subject: subject ?? '', body: body ?? '' })
      }
    }
    catch {
      // Release metadata must not block version preparation when git history is shallow.
    }
  }
  return [...new Map(commits.map(commit => [commit.sha, commit])).values()]
}

/**
 * Builds the release PR body from the changelog sections generated by pnpm.
 * Package manifests are re-read because workspace discovery may be cached
 * before `pnpm version -r` updates their versions.
 */
export async function readWorkspaceVersions(cwd: string) {
  const packages = await getWorkspacePackages(cwd)
  const versions = new Map<string, string>()

  for (const pkg of packages) {
    try {
      const manifest = JSON.parse(await readFile(pkg.pkgJsonPath, 'utf8')) as PackageJsonVersion
      if (typeof manifest.name === 'string' && typeof manifest.version === 'string') {
        versions.set(manifest.name, manifest.version)
      }
    }
    catch {
      // Ignore malformed packages here; pnpm versioning will report them.
    }
  }
  return versions
}

export async function buildReleasePullRequestBody(cwd: string, previousVersions?: Map<string, string>, metadata?: ReleaseBodyMetadata) {
  const packages = await getWorkspacePackages(cwd)
  const releases: PackageRelease[] = []

  for (const pkg of packages) {
    let manifest: PackageJsonVersion
    try {
      manifest = JSON.parse(await readFile(pkg.pkgJsonPath, 'utf8')) as PackageJsonVersion
    }
    catch {
      continue
    }

    if (typeof manifest.name !== 'string' || typeof manifest.version !== 'string') {
      continue
    }
    if (previousVersions?.get(manifest.name) === manifest.version) {
      continue
    }
    const release = await readPackageRelease(manifest.name, manifest.version, pkg.rootDir)
    if (release) {
      releases.push(release)
    }
  }

  const sections = ['# Releases', '', formatReleases(releases)]
  const relatedLinks = formatRelatedLinks(metadata, releases)
  if (relatedLinks) {
    sections.push('', '', relatedLinks)
  }
  return sections.join('\n')
}
