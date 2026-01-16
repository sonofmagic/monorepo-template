import type { CliOptions, SourceType } from './types'
import { DEFAULT_BRANCH, DEFAULT_REPO, DEFAULT_SOURCE, DEFAULT_TARGET } from './constants'

function normalizeSource(value?: string): SourceType | undefined {
  if (!value) {
    return undefined
  }
  const normalized = value.toLowerCase()
  if (normalized === 'npm' || normalized === 'git') {
    return normalized
  }
  return undefined
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    targetDir: DEFAULT_TARGET,
    repo: DEFAULT_REPO,
    branch: DEFAULT_BRANCH,
    source: DEFAULT_SOURCE,
    force: false,
  }
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg) {
      continue
    }
    if (arg === '--repo' && argv[i + 1]) {
      const next = argv[i + 1]
      if (next) {
        options.repo = next
      }
      i += 1
      continue
    }
    if (arg.startsWith('--repo=')) {
      const value = arg.slice('--repo='.length)
      if (value) {
        options.repo = value
      }
      continue
    }
    if (arg === '--branch' && argv[i + 1]) {
      const next = argv[i + 1]
      if (next) {
        options.branch = next
      }
      i += 1
      continue
    }
    if (arg.startsWith('--branch=')) {
      const value = arg.slice('--branch='.length)
      if (value) {
        options.branch = value
      }
      continue
    }
    if (arg === '--templates' && argv[i + 1]) {
      const next = argv[i + 1]
      if (next) {
        options.templates = next
      }
      i += 1
      continue
    }
    if (arg.startsWith('--templates=')) {
      const value = arg.slice('--templates='.length)
      if (value) {
        options.templates = value
      }
      continue
    }
    if (arg === '--source' && argv[i + 1]) {
      const next = argv[i + 1]
      const normalized = next ? normalizeSource(next) : undefined
      if (normalized) {
        options.source = normalized
      }
      i += 1
      continue
    }
    if (arg.startsWith('--source=')) {
      const value = arg.slice('--source='.length)
      const normalized = normalizeSource(value)
      if (normalized) {
        options.source = normalized
      }
      continue
    }
    if (arg === '--force') {
      options.force = true
      continue
    }
    if (arg === '-h' || arg === '--help') {
      options.help = true
      continue
    }
    if (!arg.startsWith('-')) {
      positionals.push(arg)
    }
  }

  if (positionals.length) {
    const target = positionals[0]
    if (target) {
      options.targetDir = target
    }
  }

  return options
}
