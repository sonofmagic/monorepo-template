type PathInput = readonly string[] | string

const arrayIndexPattern = /^\d+$/

function isArrayIndex(value: string) {
  return arrayIndexPattern.test(value)
}

function parsePath(input: string) {
  const segments: string[] = []
  let current = ''
  let escaped = false

  for (const char of input) {
    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '.') {
      segments.push(current)
      current = ''
      continue
    }

    current += char
  }

  segments.push(current)
  return segments
}

export function setByPath(target: Record<PropertyKey, any>, path: PathInput, value: unknown) {
  const segments = typeof path === 'string'
    ? parsePath(path)
    : [...path]
  if (!segments.length) {
    return target
  }

  let current: any = target

  for (let index = 0; index < segments.length - 1; index++) {
    const segment = segments[index]!
    const nextSegment = segments[index + 1]!
    const key = Array.isArray(current) && isArrayIndex(segment)
      ? Number(segment)
      : segment

    const existing = current[key]
    if (typeof existing !== 'object' || existing === null) {
      current[key] = isArrayIndex(nextSegment) ? [] : {}
    }

    current = current[key]
  }

  const lastSegment = segments.at(-1)!
  const lastKey = Array.isArray(current) && isArrayIndex(lastSegment)
    ? Number(lastSegment)
    : lastSegment

  current[lastKey] = value
  return target
}
