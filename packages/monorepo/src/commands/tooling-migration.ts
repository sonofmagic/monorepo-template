const legacyToolingLoaderImportPattern
  = /import\s+\{\s*load(?:Repoctl|Monorepo)ToolingModule\s*\}\s+from\s+['"][^'"]*tooling\/load-tooling-module\.mjs['"]\s*;?\n?/g
const legacyToolingLoaderCallPattern
  = /const\s+\{\s*([\w$]+(?:\s*,\s*[\w$]+)*)\s*\}\s*=\s*await\s+load(?:Repoctl|Monorepo)ToolingModule\(\)\s*;?\n?/g
const legacyToolingEntryPattern = /packages\/(?:monorepo|repoctl)\/dist\/tooling-entry\.mjs/

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
    return nextContent
      .replace(legacyToolingLoaderImportPattern, '')
      .replace(/\n{3,}/g, '\n\n')
  }

  nextContent = nextContent.replace(legacyToolingLoaderImportPattern, '')
  const toolingImport = `import { ${normalizeNamedImports(importNames.join(',')).join(', ')} } from '${importSource}'\n`

  return `${toolingImport}${nextContent}`
    .replace(/\n{3,}/g, '\n\n')
    .trimStart()
}
