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
    if (arg === '--repo' && argv[i + 1]) {
      options.repo = argv[++i]
      continue
    }
    if (arg.startsWith('--repo=')) {
      options.repo = arg.split('=')[1] || options.repo
      continue
    }
    if (arg === '--branch' && argv[i + 1]) {
      options.branch = argv[++i]
      continue
    }
    if (arg.startsWith('--branch=')) {
      options.branch = arg.split('=')[1] || options.branch
      continue
    }
    if (arg === '--templates' && argv[i + 1]) {
      options.templates = argv[++i]
      continue
    }
    if (arg.startsWith('--templates=')) {
      options.templates = arg.split('=')[1] || options.templates
      continue
    }
    if (arg === '--source' && argv[i + 1]) {
      const normalized = normalizeSource(argv[i + 1])
      if (normalized) {
        options.source = normalized
      }
      i += 1
      continue
    }
    if (arg.startsWith('--source=')) {
      const normalized = normalizeSource(arg.split('=')[1])
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
    options.targetDir = positionals[0]
  }

  return options
}
