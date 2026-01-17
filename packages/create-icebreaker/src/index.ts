import path from 'node:path'
import process from 'node:process'
import { Command } from '@icebreakers/monorepo-templates'
import { DEFAULT_TARGET } from './constants'
import { updateRootPackageJson } from './package-json'
import { promptTargetDir, promptTemplates } from './prompts'
import { scaffoldFromNpm } from './source-npm'
import { resolveTemplateSelections } from './templates'

interface CreateOptions {
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

async function runCreate(targetDirInput: string, options: CreateOptions) {
  const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY)
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

  await scaffoldFromNpm(targetDir, selectedTemplates, Boolean(options.force))
  await updateRootPackageJson(targetDir, projectName)
  printNextSteps(targetDir)
}

const program = new Command()
program
  .name('create-icebreaker')
  .description('Bootstrap the icebreaker monorepo template')
  .argument('[dir]', 'Target directory', DEFAULT_TARGET)
  .option('-t, --templates <list>', 'Comma-separated template keys or indexes to keep')
  .option('-f, --force', 'Remove existing target directory before scaffolding', false)
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
