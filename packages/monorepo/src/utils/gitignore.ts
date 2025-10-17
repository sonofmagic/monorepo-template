/**
 * Utilities to handle renaming `.gitignore` files when packaging templates.
 * pnpm publish strips `.gitignore`, so we temporarily rename them to `gitignore`
 * and convert them back when writing into workspaces.
 */
const publishBasename = 'gitignore'
const workspaceBasename = '.gitignore'

function replaceBasename(input: string, from: string, to: string) {
  if (!input) {
    return input
  }
  const segments = input.split(/[\\/]/)
  const lastIndex = segments.length - 1
  if (lastIndex >= 0 && segments[lastIndex] === from) {
    segments[lastIndex] = to
    return segments.join('/')
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
  const target = name.split(/[\\/]/).pop()
  return target === workspaceBasename || target === publishBasename
}
