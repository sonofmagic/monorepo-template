#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_REPO = 'sonofmagic/monorepo-template'
const DEFAULT_BRANCH = 'main'

function printHelp() {
  console.log([
    'Usage: create-icebreaker [dir] [--repo <repo>] [--branch <branch>]',
    'Options:',
    '  --repo <repo>          GitHub repo or git url to clone (default sonofmagic/monorepo-template)',
    '  --branch <branch>      Branch or tag to checkout (default main)',
    '  --no-clean             Skip running monorepo clean after download',
    '  --include-private      Run clean with private packages included',
    '  --force                Remove existing target directory before cloning',
    '  --agent <pnpm|npm>     Force package manager used for cleanup (default auto-detect)',
    '  -h, --help             Show this help message',
  ].join('\n'))
}

function parseArgs(argv) {
  const options = {
    targetDir: 'icebreaker-monorepo',
    repo: DEFAULT_REPO,
    branch: DEFAULT_BRANCH,
    clean: true,
    force: false,
    includePrivate: false,
    agent: undefined,
  }
  const positionals = []
  for (let i = 0; i < argv.length; i++) {
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
    if (arg === '--no-clean') {
      options.clean = false
      continue
    }
    if (arg === '--clean') {
      options.clean = true
      continue
    }
    if (arg === '--include-private') {
      options.includePrivate = true
      continue
    }
    if (arg === '--force') {
      options.force = true
      continue
    }
    if (arg === '--agent' && argv[i + 1]) {
      options.agent = argv[++i]
      continue
    }
    if (arg.startsWith('--agent=')) {
      options.agent = arg.split('=')[1] || options.agent
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

function normalizeRepo(repo) {
  if (repo.startsWith('http')) {
    return repo
  }
  if (repo.startsWith('gh:')) {
    return `https://github.com/${repo.slice(3)}.git`
  }
  if (/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return `https://github.com/${repo}.git`
  }
  return repo
}

async function isEmptyDir(dir) {
  try {
    const entries = await fs.readdir(dir)
    return entries.length === 0
  }
  catch (error) {
    if (error && error.code === 'ENOENT') {
      return true
    }
    throw error
  }
}

async function prepareTarget(dir, force) {
  const empty = await isEmptyDir(dir)
  if (empty) {
    await fs.mkdir(dir, { recursive: true })
    return
  }
  if (!force) {
    throw new Error(`Target directory ${dir} is not empty. Pass --force to overwrite.`)
  }
  await fs.rm(dir, { recursive: true, force: true })
  await fs.mkdir(dir, { recursive: true })
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code && code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
        return
      }
      resolve()
    })
  })
}

async function cloneRepo(repo, branch, targetDir) {
  const normalized = normalizeRepo(repo)
  console.log(`Cloning ${normalized} (branch ${branch})...`)
  await runCommand('git', ['clone', '--depth', '1', '--branch', branch, normalized, targetDir])
  await fs.rm(path.join(targetDir, '.git'), { recursive: true, force: true })
}

function detectAgent(userAgent) {
  if (!userAgent) {
    return 'pnpm'
  }
  const first = userAgent.split(' ')[0] || ''
  if (first.startsWith('pnpm/')) {
    return 'pnpm'
  }
  if (first.startsWith('npm/')) {
    return 'npm'
  }
  return 'pnpm'
}

function getCleanCommand(agent, includePrivate) {
  const usePnpm = agent === 'pnpm'
  const runner = usePnpm ? 'pnpm' : 'npx'
  const args = usePnpm
    ? ['dlx', '@icebreakers/monorepo@latest', 'clean', '--yes']
    : ['--yes', '@icebreakers/monorepo@latest', 'clean', '--yes']
  if (includePrivate) {
    args.push('--include-private')
  }
  return { runner, args }
}

async function runClean(targetDir, agent, includePrivate) {
  const { runner, args } = getCleanCommand(agent, includePrivate)
  console.log(`Running ${runner} ${args.join(' ')} in ${targetDir}`)
  await runCommand(runner, args, { cwd: targetDir })
}

function printNextSteps(targetDir, cleanRan) {
  const relative = path.relative(process.cwd(), targetDir) || '.'
  console.log('\nAll set! Next steps:')
  console.log(`  cd ${relative}`)
  if (!cleanRan) {
    console.log('  pnpm dlx @icebreakers/monorepo@latest clean --yes')
  }
  console.log('  pnpm install')
  console.log('  pnpm dev')
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.help) {
    printHelp()
    return
  }
  const targetDir = path.resolve(process.cwd(), parsed.targetDir)
  try {
    await prepareTarget(targetDir, parsed.force)
    await cloneRepo(parsed.repo, parsed.branch, targetDir)
    if (parsed.clean) {
      const agent = parsed.agent || detectAgent(process.env.npm_config_user_agent)
      await runClean(targetDir, agent, parsed.includePrivate)
    }
    else {
      console.log('Skip clean step per --no-clean')
    }
    printNextSteps(targetDir, parsed.clean)
  }
  catch (error) {
    console.error('[create-icebreaker]', error?.message || error)
    process.exitCode = 1
  }
}

main()
