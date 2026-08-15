import type { ReleaseBodyMetadata, ReleaseCategory, ReleaseNoteDocument, ReleaseNoteEntry } from './model'
import { categoryOrder, categoryTitles, isAutomationContributor } from './model'

function formatReferenceLinks(entry: ReleaseNoteEntry, metadata: ReleaseBodyMetadata) {
  const repository = metadata.repository && /^[^/]+\/[^/]+$/.test(metadata.repository) ? metadata.repository : undefined
  const serverUrl = (metadata.serverUrl || 'https://github.com').replace(/\/$/, '')
  const baseUrl = repository ? `${serverUrl}/${repository}` : undefined
  const links: string[] = []
  for (const commit of entry.commits) {
    const label = commit.sha.slice(0, 7)
    links.push(baseUrl ? `[\`${label}\`](${baseUrl}/commit/${commit.sha})` : `\`${label}\``)
  }
  for (const number of entry.pullRequests) {
    links.push(baseUrl ? `[#${number}](${baseUrl}/pull/${number})` : `#${number}`)
  }
  for (const number of entry.issues) {
    links.push(baseUrl ? `[#${number}](${baseUrl}/issues/${number})` : `#${number}`)
  }
  return links.length ? ` ${links.join(' · ')}` : ''
}

function formatEntry(entry: ReleaseNoteEntry, metadata: ReleaseBodyMetadata, linkNpmVersion: boolean) {
  const packageLabel = linkNpmVersion && entry.npmUrl
    ? `[${entry.packageName}@${entry.version}](${entry.npmUrl})`
    : `${entry.packageName}@${entry.version}`
  return `- **${packageLabel}**: ${entry.summary}${formatReferenceLinks(entry, metadata)}`
}

function formatCategoryEntries(
  entries: ReleaseNoteEntry[],
  category: ReleaseCategory,
  metadata: ReleaseBodyMetadata,
  headingLevel: 2 | 3,
  linkNpmVersion: boolean,
) {
  const matching = entries.filter(entry => entry.category === category)
  if (!matching.length) {
    return []
  }
  return [
    `${'#'.repeat(headingLevel)} ${categoryTitles[category]}`,
    '',
    ...matching.map(entry => formatEntry(entry, metadata, linkNpmVersion)),
  ]
}

function formatContributor(value: string) {
  if (value.startsWith('@')) {
    return value
  }
  return /^[\w-]+$/.test(value) ? `@${value}` : value
}

function formatContributors(contributors: string[]) {
  const unique = [...new Set(contributors.map(value => value.trim()).filter(value => value && !isAutomationContributor(value)))].sort((a, b) => a.localeCompare(b))
  return unique.length
    ? ['## ❤️ Contributors', '', `Thanks to ${unique.map(formatContributor).join(' · ')}`]
    : []
}

function formatVersion(version: string, npmUrl?: string) {
  return npmUrl ? `[\`${version}\`](${npmUrl})` : `\`${version}\``
}

function formatPackages(packages: ReleaseNoteDocument['packages'], linkNpmVersion: boolean) {
  if (!packages.length) {
    return []
  }
  return [
    '## Packages',
    '',
    '| Package | From | To |',
    '| --- | --- | --- |',
    ...packages.map((pkg) => {
      const previous = pkg.previousVersion ? formatVersion(pkg.previousVersion, pkg.previousNpmUrl) : '—'
      const current = formatVersion(pkg.version, linkNpmVersion ? pkg.npmUrl : undefined)
      return `| \`${pkg.name}\` | ${previous} | ${current} |`
    }),
  ]
}

export function renderReleasePullRequest(document: ReleaseNoteDocument, metadata: ReleaseBodyMetadata = {}) {
  const packageWord = `${document.packages.length} package${document.packages.length === 1 ? '' : 's'}`
  const changeWord = `${document.entries.length} change${document.entries.length === 1 ? '' : 's'}`
  const sections = ['# Release Notes', '', `> ${packageWord} updated · ${changeWord}`]

  for (const category of categoryOrder.filter(category => category !== 'maintenance')) {
    const section = formatCategoryEntries(document.entries, category, metadata, 2, false)
    if (section.length) {
      sections.push('', '', ...section)
    }
  }

  const maintenance = formatCategoryEntries(document.entries, 'maintenance', metadata, 2, false)
  if (maintenance.length) {
    sections.push('', '', '<details>', '<summary>🧰 Maintenance</summary>', '', ...maintenance.slice(2), '', '</details>')
  }

  sections.push('', '', ...formatPackages(document.packages, false))
  sections.push('', '', ...formatContributors(document.contributors))
  return sections.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function renderGitHubRelease(document: ReleaseNoteDocument, metadata: ReleaseBodyMetadata = {}) {
  if (!document.entries.length) {
    return 'No significant changes.'
  }

  const sections: string[] = []
  for (const category of categoryOrder) {
    const section = formatCategoryEntries(document.entries, category, metadata, 3, true)
    if (section.length) {
      sections.push(...(sections.length ? ['', ...section] : section))
    }
  }

  const contributors = [...new Set(document.contributors)].filter(value => !isAutomationContributor(value)).sort((a, b) => a.localeCompare(b))
  if (contributors.length) {
    sections.push('', '### ❤️ Contributors', '', `Thanks to ${contributors.map(formatContributor).join(' · ')}`)
  }
  if (document.compareUrls.length) {
    sections.push('', `##### [View changes on GitHub](${document.compareUrls[0]})`)
  }
  return sections.join('\n')
}
