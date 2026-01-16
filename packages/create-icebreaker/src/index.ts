import type { SourceType } from './types'
import path from 'node:path'
import process from 'node:process'
import { parseArgs } from './args'
import { DEFAULT_SOURCE } from './constants'
import { prepareTarget } from './fs-utils'
import { updateRootPackageJson } from './package-json'
import { promptTargetDir, promptTemplates } from './prompts'
import { scaffoldFromRepo } from './scaffold'
import { cloneRepo } from './source-git'
import { scaffoldFromNpm } from './source-npm'
import { resolveTemplateSelections } from './templates'

function printHelp() {
  process.stdout.write(`${[
    'Usage: create-icebreaker [dir] [--source npm|git] [--repo <repo>] [--branch <branch>]',
    'Options:',
    '  --source <npm|git>     Source for templates (default npm)',
    '  --repo <repo>          GitHub repo or git url to clone (default sonofmagic/monorepo-template)',
    '  --branch <branch>      Branch or tag to checkout (default main)',
    '  --templates <list>     Comma-separated template keys or indexes to keep',
    '  --force                Remove existing target directory before cloning',
    '  -h, --help             Show this help message',
  ].join('\n')}\n`)
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

function normalizeSource(value: SourceType | undefined) {
  return value ?? DEFAULT_SOURCE
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.help) {
    printHelp()
    return
  }

  const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY)
  const source = normalizeSource(parsed.source)
  let targetDirInput = parsed.targetDir

  if (isInteractive) {
    targetDirInput = await promptTargetDir(targetDirInput)
  }

  let selectedTemplates: string[] = []
  if (parsed.templates) {
    const { selections, unknown } = resolveTemplateSelections(parsed.templates)
    if (unknown.length) {
      process.stderr.write(`忽略未知模板：${unknown.join(', ')}\n`)
    }
    selectedTemplates = selections
  }
  else if (isInteractive) {
    selectedTemplates = await promptTemplates()
  }

  const targetDir = path.resolve(process.cwd(), targetDirInput)
  const projectName = path.basename(targetDir) || targetDirInput

  try {
    await prepareTarget(targetDir, parsed.force)
    if (source === 'git') {
      await cloneRepo(parsed.repo, parsed.branch, targetDir)
      await scaffoldFromRepo(targetDir, selectedTemplates)
    }
    else {
      await scaffoldFromNpm(targetDir, selectedTemplates)
    }
    await updateRootPackageJson(targetDir, projectName)
    printNextSteps(targetDir)
  }
  catch (error) {
    process.stderr.write(`[create-icebreaker] ${error instanceof Error ? error.message : error}\n`)
    process.exitCode = 1
  }
}

main()
