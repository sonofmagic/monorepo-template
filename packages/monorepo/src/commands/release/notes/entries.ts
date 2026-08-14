import type { PackageReleaseSource, ReleaseCategory, ReleaseCommit, ReleaseNoteEntry } from './model'
import { uniqueCommits } from './model'

function parseReferences(commits: ReleaseCommit[], content: string) {
  const pullRequests = new Set<number>()
  const issues = new Set<number>()
  for (const message of [...commits.map(commit => [commit.subject, commit.body ?? ''].join('\n')), content]) {
    for (const match of message.matchAll(/\(#(\d+)\)/g)) {
      pullRequests.add(Number(match[1]))
    }
    for (const match of message.matchAll(/(?:^|\W)#(\d+)\b/g)) {
      const number = Number(match[1])
      if (!pullRequests.has(number)) {
        issues.add(number)
      }
    }
    for (const match of message.matchAll(/\bGH[- ]?(\d+)\b/gi)) {
      issues.add(Number(match[1]))
    }
  }
  for (const number of pullRequests) {
    issues.delete(number)
  }
  return {
    issues: [...issues].sort((a, b) => a - b),
    pullRequests: [...pullRequests].sort((a, b) => a - b),
  }
}

function sourceCategory(commits: ReleaseCommit[]) {
  for (const commit of commits) {
    const subject = commit.subject.toLowerCase()
    const conventional = /^([a-z]+)(?:\([^)]*\))?(!)?:/.exec(subject)
    if (conventional?.[2] || subject.startsWith('breaking')) {
      return 'breaking' as const
    }
    if (conventional?.[1] === 'feat' || conventional?.[1] === 'feature' || subject.includes('🚀')) {
      return 'features' as const
    }
    if (conventional?.[1] === 'fix' || subject.includes('🐛') || subject.includes('🐞')) {
      return 'fixes' as const
    }
    if (conventional?.[1] === 'perf' || subject.includes('🏎')) {
      return 'performance' as const
    }
    if (['doc', 'docs', 'documentation'].includes(conventional?.[1] ?? '') || subject.includes('📚')) {
      return 'docs' as const
    }
    if (['chore', 'ci', 'test', 'refactor', 'dep', 'deps'].includes(conventional?.[1] ?? '') || /dependencies|maintenance/i.test(subject)) {
      return 'maintenance' as const
    }
  }
  return undefined
}

function classifyChange(heading: string, summary: string, commits: ReleaseCommit[]): ReleaseCategory {
  const fromCommit = sourceCategory(commits)
  if (fromCommit) {
    return fromCommit
  }
  const categoryHint = [heading, summary].join(' ').toLowerCase()
  if (/major|breaking|重大|破坏/.test(categoryHint)) {
    return 'breaking'
  }
  if (/minor|feature|🚀|新增|功能/.test(categoryHint)) {
    return 'features'
  }
  if (/fix|bug|🐛|🐞|修复|错误|问题/.test(categoryHint)) {
    return 'fixes'
  }
  if (/perf|🏎|性能/.test(categoryHint)) {
    return 'performance'
  }
  if (/doc|📚|文档/.test(categoryHint)) {
    return 'docs'
  }
  if (/dependenc|chore|ci|test|refactor|maintenance|📦|依赖|维护/.test(categoryHint)) {
    return 'maintenance'
  }
  return 'other'
}

function readMarkdownEntries(content: string) {
  const headings = [...content.matchAll(/^### ([^\n]+)$/gm)]
  if (!headings.length) {
    return [{ heading: 'Patch Changes', summary: content.trim() }]
  }

  const entries: Array<{ heading: string, summary: string }> = []
  for (let index = 0; index < headings.length; index++) {
    const heading = headings[index]
    if (!heading || heading.index === undefined) {
      continue
    }
    const start = heading.index + heading[0].length
    const end = headings[index + 1]?.index ?? content.length
    const lines = content.slice(start, end).trim().split('\n')
    let current = ''
    for (const line of lines) {
      if (line.startsWith('- ')) {
        if (current) {
          entries.push({ heading: heading[1] as string, summary: current.trim() })
        }
        current = line.slice(2).trim()
      }
      else if (line.trim()) {
        current = current ? [current, line.trim()].join('\n') : line.trim()
      }
    }
    if (current) {
      entries.push({ heading: heading[1] as string, summary: current.trim() })
    }
  }
  return entries.length ? entries : [{ heading: 'Patch Changes', summary: content.trim() }]
}

function commitsForPackage(commits: ReleaseCommit[], packageName: string) {
  return uniqueCommits(commits.filter(commit => !commit.packages?.length || commit.packages.includes(packageName)))
}

function normalizeForMatch(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
}

function commitsForEntry(commits: ReleaseCommit[], summary: string) {
  const normalizedSummary = normalizeForMatch(summary)
  const matched = commits.filter((commit) => {
    const summaries = [commit.summary, ...(commit.summaries ?? [])].filter((value): value is string => Boolean(value))
    if (!summaries.length) {
      return false
    }
    return summaries.some((summary) => {
      const normalizedIntent = normalizeForMatch(summary)
      return normalizedIntent === normalizedSummary
        || normalizedSummary.includes(normalizedIntent)
        || normalizedIntent.includes(normalizedSummary)
    })
  })
  if (matched.length) {
    return matched
  }
  return commits.length === 1 ? commits : []
}

export function buildEntries(release: PackageReleaseSource, commits: ReleaseCommit[]) {
  const packageCommits = commitsForPackage(commits, release.name)
  return readMarkdownEntries(release.content).flatMap((item): ReleaseNoteEntry[] => {
    const summary = item.summary.replace(/^[-*]\s+/, '').replace(/\n+/g, ' ').trim()
    if (!summary) {
      return []
    }
    const entryCommits = commitsForEntry(packageCommits, summary)
    const refs = parseReferences(entryCommits, summary)
    return [{
      packageName: release.name,
      version: release.version,
      category: classifyChange(item.heading, summary, entryCommits),
      summary,
      commits: entryCommits,
      pullRequests: refs.pullRequests,
      issues: refs.issues,
      authors: entryCommits.map(commit => commit.author).filter((author): author is string => Boolean(author)),
    }]
  })
}
