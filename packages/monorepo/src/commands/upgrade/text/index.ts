const crlfPattern = /\r\n/g

function normalizeEol(input: string) {
  return input.replace(crlfPattern, '\n')
}

function normalizeGitignoreLine(line: string) {
  const trimmed = line.trim()
  if (!trimmed) {
    return ''
  }
  if (trimmed.startsWith('#')) {
    return `#${trimmed.slice(1).trim()}`
  }
  return trimmed
}

export function isTextEquivalent(left: string, right: string) {
  return normalizeEol(left).trimEnd() === normalizeEol(right).trimEnd()
}

export function mergeGitignore(source: string, target: string) {
  const sourceLines = normalizeEol(source).split('\n')
  const result = normalizeEol(target).split('\n')
  const seen = new Set(
    result
      .map(line => normalizeGitignoreLine(line))
      .filter(Boolean),
  )

  for (const line of sourceLines) {
    const normalized = normalizeGitignoreLine(line)
    if (!normalized || seen.has(normalized)) {
      continue
    }
    seen.add(normalized)
    result.push(line)
  }

  while (result.length) {
    const last = result.at(-1)
    if (last === undefined || last.trim().length > 0) {
      break
    }
    result.pop()
  }

  return `${result.join('\n')}\n`
}
