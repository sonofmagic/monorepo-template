interface MarkdownSection {
  key: string
  lines: string[]
}

interface ParsedMarkdown {
  preamble: string[]
  sections: MarkdownSection[]
}

function normalizeEol(input: string) {
  return input.replace(/\r\n/g, '\n')
}

function normalizeHeadingKey(line: string) {
  return line.replace(/^##\s+/, '').trim().toLowerCase()
}

function trimEdgeEmptyLines(lines: string[]) {
  const next = [...lines]
  while (next.length) {
    const first = next[0]
    if (first === undefined || first.trim().length > 0) {
      break
    }
    next.shift()
  }
  while (next.length) {
    const last = next.at(-1)
    if (last === undefined || last.trim().length > 0) {
      break
    }
    next.pop()
  }
  return next
}

function parseMarkdownByH2(content: string): ParsedMarkdown {
  const normalized = normalizeEol(content)
  const lines = normalized.split('\n')
  const preamble: string[] = []
  const sections: MarkdownSection[] = []
  let current: MarkdownSection | undefined

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (current) {
        sections.push(current)
      }
      current = {
        key: normalizeHeadingKey(line),
        lines: [line],
      }
      continue
    }

    if (current) {
      current.lines.push(line)
      continue
    }

    preamble.push(line)
  }

  if (current) {
    sections.push(current)
  }

  return {
    preamble,
    sections,
  }
}

function mergePlainText(source: string, target: string) {
  const sourceLines = trimEdgeEmptyLines(normalizeEol(source).split('\n'))
  const result = trimEdgeEmptyLines(normalizeEol(target).split('\n'))
  const seen = new Set(result)

  for (const line of sourceLines) {
    if (!line.trim()) {
      continue
    }
    if (seen.has(line)) {
      continue
    }
    seen.add(line)
    result.push(line)
  }

  return `${result.join('\n')}\n`
}

/**
 * Merge AGENTS instructions by keeping existing sections and filling missing sections
 * from source defaults. This avoids destructive overwrite while still syncing updates.
 */
export function mergeAgentsMarkdown(source: string, target: string) {
  const sourceParsed = parseMarkdownByH2(source)
  const targetParsed = parseMarkdownByH2(target)

  if (!sourceParsed.sections.length || !targetParsed.sections.length) {
    return mergePlainText(source, target)
  }

  const sourceSectionKeys = new Set(sourceParsed.sections.map(section => section.key))
  const targetSectionMap = new Map(targetParsed.sections.map(section => [section.key, section]))
  const mergedSections: MarkdownSection[] = []

  for (const section of sourceParsed.sections) {
    mergedSections.push(targetSectionMap.get(section.key) ?? section)
  }

  for (const section of targetParsed.sections) {
    if (!sourceSectionKeys.has(section.key)) {
      mergedSections.push(section)
    }
  }

  const preamble = trimEdgeEmptyLines(
    targetParsed.preamble.length ? targetParsed.preamble : sourceParsed.preamble,
  )
  const blocks: string[] = []
  if (preamble.length) {
    blocks.push(preamble.join('\n'))
  }
  for (const section of mergedSections) {
    blocks.push(trimEdgeEmptyLines(section.lines).join('\n'))
  }

  return `${blocks.filter(Boolean).join('\n\n')}\n`
}
