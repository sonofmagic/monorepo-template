const legacyToolingLoaderImportPattern
  = /import\s+\{\s*load(?:Repoctl|Monorepo)ToolingModule\s*\}\s+from\s+['"][^'"]*tooling\/load-tooling-module\.mjs['"]\s*;?\n?/g
const legacyToolingLoaderCallPattern
  = /const\s+\{\s*([\w$]+(?:\s*,\s*[\w$]+)*)\s*\}\s*=\s*await\s+load(?:Repoctl|Monorepo)ToolingModule\(\)\s*;?\n?/g
const legacyToolingEntryPattern = /packages\/(?:monorepo|repoctl)\/dist\/tooling-entry\.mjs/
const directToolingPackages = [
  {
    source: '@icebreakers/commitlint-config',
    importName: 'defineCommitlintConfig',
    wrapSingleArgument: true,
  },
  {
    source: '@icebreakers/eslint-config',
    importName: 'defineEslintConfig',
    wrapSingleArgument: false,
  },
  {
    source: '@icebreakers/stylelint-config',
    importName: 'defineStylelintConfig',
    wrapSingleArgument: true,
  },
] as const

function normalizeNamedImports(input: string) {
  return [...new Set(input
    .split(',')
    .map(item => item.trim())
    .filter(Boolean))]
    .sort((left, right) => left.localeCompare(right))
}

export function hasLegacyToolingReference(content: string) {
  return content.includes('tooling/load-tooling-module.mjs')
    || content.includes('loadRepoctlToolingModule')
    || content.includes('loadMonorepoToolingModule')
    || legacyToolingEntryPattern.test(content)
    || directToolingPackages.some(pkg => content.includes(pkg.source))
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findMatchingCloseParen(content: string, openParenIndex: number) {
  let depth = 0
  let quote: '\'' | '"' | '`' | null = null
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = openParenIndex; index < content.length; index++) {
    const char = content[index]
    const next = content[index + 1]

    if (lineComment) {
      if (char === '\n') {
        lineComment = false
      }
      continue
    }

    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false
        index++
      }
      continue
    }

    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '/' && next === '/') {
      lineComment = true
      index++
      continue
    }
    if (char === '/' && next === '*') {
      blockComment = true
      index++
      continue
    }
    if (char === '\'' || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '(') {
      depth++
      continue
    }
    if (char === ')') {
      depth--
      if (depth === 0) {
        return index
      }
    }
  }

  return -1
}

function hasTopLevelComma(content: string) {
  const wrapped = `(${content})`
  const closeParen = findMatchingCloseParen(wrapped, 0)
  if (closeParen === -1) {
    return true
  }

  let depth = 0
  let quote: '\'' | '"' | '`' | null = null
  let escaped = false
  for (let index = 0; index < content.length; index++) {
    const char = content[index]!
    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) {
        quote = null
      }
      continue
    }
    if (char === '\'' || char === '"' || char === '`') {
      quote = char
      continue
    }
    if ('([{'.includes(char)) {
      depth++
      continue
    }
    if (')]}'.includes(char)) {
      depth--
      continue
    }
    if (char === ',' && depth === 0) {
      return true
    }
  }
  return false
}

function removeSimpleNamedImport(content: string, source: string) {
  const pattern = new RegExp(
    `import\\s+\\{\\s*icebreaker(?:\\s+as\\s+([\\w$]+))?\\s*\\}\\s+from\\s+['"]${escapeRegExp(source)}['"]\\s*;?\\n?`,
  )
  const match = pattern.exec(content)
  if (!match) {
    return null
  }
  return {
    localName: match[1] ?? 'icebreaker',
    content: content.replace(pattern, ''),
  }
}

function replaceExportDefaultCall(
  content: string,
  localName: string,
  importName: string,
  wrapSingleArgument: boolean,
) {
  const pattern = new RegExp(`export\\s+default\\s+(?:await\\s+)?${escapeRegExp(localName)}\\s*\\(`)
  const match = pattern.exec(content)
  if (!match) {
    return null
  }

  const openParenIndex = match.index + match[0].length - 1
  const closeParenIndex = findMatchingCloseParen(content, openParenIndex)
  if (closeParenIndex === -1) {
    return null
  }

  const args = content.slice(openParenIndex + 1, closeParenIndex).trim()
  if (wrapSingleArgument && args && hasTopLevelComma(args)) {
    return null
  }

  const defineArgs = wrapSingleArgument && args
    ? `{ options: ${args} }`
    : args

  return [
    content.slice(0, match.index),
    `export default await ${importName}(${defineArgs})`,
    content.slice(closeParenIndex + 1),
  ].join('')
}

export function migrateDirectToolingReferences(content: string, importSource = 'repoctl/tooling') {
  let nextContent = content
  const importNames: string[] = []

  for (const pkg of directToolingPackages) {
    if (!nextContent.includes(pkg.source)) {
      continue
    }

    const removed = removeSimpleNamedImport(nextContent, pkg.source)
    if (!removed) {
      continue
    }

    const replaced = replaceExportDefaultCall(
      removed.content,
      removed.localName,
      pkg.importName,
      pkg.wrapSingleArgument,
    )
    if (!replaced) {
      continue
    }

    nextContent = replaced
    importNames.push(pkg.importName)
  }

  if (importNames.length === 0) {
    return content
  }

  const toolingImport = `import { ${normalizeNamedImports(importNames.join(',')).join(', ')} } from '${importSource}'\n\n`

  return `${toolingImport}${nextContent}`
    .replace(/\n{3,}/g, '\n\n')
    .trimStart()
}

export function migrateLegacyToolingReferences(content: string, importSource = 'repoctl/tooling') {
  if (!hasLegacyToolingReference(content)) {
    return content
  }

  const importNames: string[] = []
  let nextContent = content.replace(legacyToolingLoaderCallPattern, (_match, imports: string) => {
    importNames.push(...normalizeNamedImports(imports))
    return ''
  })

  if (importNames.length === 0) {
    return migrateDirectToolingReferences(nextContent, importSource)
      .replace(legacyToolingLoaderImportPattern, '')
      .replace(/\n{3,}/g, '\n\n')
  }

  nextContent = nextContent.replace(legacyToolingLoaderImportPattern, '')
  const toolingImport = `import { ${normalizeNamedImports(importNames.join(',')).join(', ')} } from '${importSource}'\n`

  return migrateDirectToolingReferences(`${toolingImport}${nextContent}`, importSource)
    .replace(/\n{3,}/g, '\n\n')
    .trimStart()
}
