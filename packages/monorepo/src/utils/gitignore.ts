/**
 * Utilities to handle renaming `.gitignore` files when packaging templates.
 * pnpm publish strips `.gitignore`, so we temporarily rename them to `gitignore`
 * and convert them back when writing into workspaces.
 */
const publishBasename = 'gitignore'
const workspaceBasename = '.gitignore'

function detectSeparator(input: string) {
  if (input.includes('\\') && !input.includes('/')) {
    return '\\'
  }
  return '/'
}

function replaceBasename(input: string, from: string, to: string) {
  if (!input) {
    return input
  }
  const separator = detectSeparator(input)
  const normalized = input.replace(/[\\/]/g, separator)
  const hasTrailingSeparator = normalized.endsWith(separator)
  const segments = normalized.split(separator)
  if (hasTrailingSeparator && segments[segments.length - 1] === '') {
    segments.pop()
  }
  const lastIndex = segments.length - 1
  if (lastIndex >= 0 && segments[lastIndex] === from) {
    segments[lastIndex] = to
    const rebuilt = segments.join(separator)
    return hasTrailingSeparator ? `${rebuilt}${separator}` : rebuilt
  }
  return input
}

/**
 * Map a workspace path (containing `.gitignore`) to its packaged variant.
 */
export function toPublishGitignorePath(input: string) {
  return replaceBasename(input, workspaceBasename, publishBasename)
}

/**
 * Map a packaged path (containing `gitignore`) back to the workspace form.
 */
export function toWorkspaceGitignorePath(input: string) {
  return replaceBasename(input, publishBasename, workspaceBasename)
}

/**
 * Convenient helper to check whether a filename (with or without dot prefix)
 * should be treated as a gitignore file.
 */
export function isGitignoreFile(name: string) {
  return toPublishGitignorePath(name) !== name || toWorkspaceGitignorePath(name) !== name
}
