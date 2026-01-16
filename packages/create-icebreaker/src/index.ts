import type { SourceType } from './types'
import path from 'node:path'
import process from 'node:process'
import { Command } from '@icebreakers/monorepo-templates'
import { DEFAULT_BRANCH, DEFAULT_REPO, DEFAULT_SOURCE, DEFAULT_TARGET } from './constants'
import { prepareTarget } from './fs-utils'
import { updateRootPackageJson } from './package-json'
import { promptTargetDir, promptTemplates } from './prompts'
import { scaffoldFromRepo } from './scaffold'
import { cloneRepo } from './source-git'
import { scaffoldFromNpm } from './source-npm'
import { resolveTemplateSelections } from './templates'

interface CreateOptions {
  source?: string
  repo?: string
  branch?: string
  templates?: string
  force?: boolean
}

function printNextSteps(targetDir: string) {
  const relative = path.relative(process.cwd(), targetDir) || '.'
  process.stdout.write([
    '',
    'All set! Next steps:',
    `  cd ${relative}`,
    '  pnpm install',
    '  pnpm dev',
    '',
  ].join('\n'))
}

function normalizeSource(value?: string): SourceType {
  const normalized = value?.toLowerCase()
  if (normalized === 'npm' || normalized === 'git') {
    return normalized
  }
  return DEFAULT_SOURCE
}

async function runCreate(targetDirInput: string, options: CreateOptions) {
  const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY)
  const source = normalizeSource(options.source)
  const repo = options.repo ?? DEFAULT_REPO
  const branch = options.branch ?? DEFAULT_BRANCH
  let targetInput = targetDirInput || DEFAULT_TARGET

  if (isInteractive) {
    targetInput = await promptTargetDir(targetInput)
  }

  let selectedTemplates: string[] = []
  if (options.templates) {
    const { selections, unknown } = resolveTemplateSelections(options.templates)
    if (unknown.length) {
      process.stderr.write(`忽略未知模板：${unknown.join(', ')}\n`)
    }
    selectedTemplates = selections
  }
  else if (isInteractive) {
    selectedTemplates = await promptTemplates()
  }

  const targetDir = path.resolve(process.cwd(), targetInput)
  const projectName = path.basename(targetDir) || targetInput

  await prepareTarget(targetDir, Boolean(options.force))
  if (source === 'git') {
    await cloneRepo(repo, branch, targetDir)
    await scaffoldFromRepo(targetDir, selectedTemplates)
  }
  else {
    await scaffoldFromNpm(targetDir, selectedTemplates)
  }
  await updateRootPackageJson(targetDir, projectName)
  printNextSteps(targetDir)
}

const program = new Command()
program
  .name('create-icebreaker')
  .description('Bootstrap the icebreaker monorepo template')
  .argument('[dir]', 'Target directory', DEFAULT_TARGET)
  .option('-s, --source <source>', 'Source for templates (npm|git)', DEFAULT_SOURCE)
  .option('-r, --repo <repo>', 'GitHub repo or git url to clone', DEFAULT_REPO)
  .option('-b, --branch <branch>', 'Branch or tag to checkout', DEFAULT_BRANCH)
  .option('-t, --templates <list>', 'Comma-separated template keys or indexes to keep')
  .option('-f, --force', 'Remove existing target directory before cloning', false)
  .action(async (dir: string, options: CreateOptions) => {
    try {
      await runCreate(dir, options)
    }
    catch (error) {
      process.stderr.write(`[create-icebreaker] ${error instanceof Error ? error.message : error}\n`)
      process.exitCode = 1
    }
  })

program.parseAsync(process.argv).catch((error: unknown) => {
  process.stderr.write(`[create-icebreaker] ${error instanceof Error ? error.message : error}\n`)
  process.exitCode = 1
})
