import type { CreateNewProjectOptions, CreateNewProjectPlan } from '../../../commands'
import process from 'node:process'
import { input, select } from '@icebreakers/monorepo-templates'
import path from 'pathe'
import { createNewProject, getCreateChoices, resolveCreateNewProjectPlan } from '../../../commands'
import { defaultTemplate } from '../../../commands/create'
import { resolveCommandConfig } from '../../../core/config'
import { logger } from '../../../core/logger'
import fs from '../../../utils/fs'
import { createIntentChoices } from './intents'

function normalizeTargetName(name: string, baseDir: 'packages' | 'apps') {
  if (name.includes('/')) {
    return name
  }
  return `${baseDir}/${name}`
}

function resolveBaseDirFromTemplate(type: CreateNewProjectOptions['type']) {
  const intentChoice = createIntentChoices.find(item => item.defaultTemplate === type)
  return intentChoice?.defaultBaseDir
}

function normalizeNameForTemplate(name: string, type: CreateNewProjectOptions['type']) {
  if (!type) {
    return name
  }

  const baseDir = resolveBaseDirFromTemplate(type)
  if (!baseDir) {
    return name
  }

  return normalizeTargetName(name, baseDir)
}

export interface RunCreateFlowOptions {
  template?: CreateNewProjectOptions['type']
  dryRun?: boolean
  json?: boolean
  out?: string
}

export interface RunCreateFlowResult {
  dryRun: boolean
  failed?: boolean
}

function formatPlanPath(cwd: string, targetPath: string) {
  const relative = path.relative(cwd, targetPath)
  return relative && relative !== '.' ? relative : targetPath
}

function printCreatePlan(plan: CreateNewProjectPlan) {
  logger.log('')
  logger.log('Create preview:')
  logger.log(`  template: ${plan.template}${plan.usedFallback ? ` (fallback from ${plan.requestedTemplate})` : ''}`)
  logger.log(`  source: ${formatPlanPath(plan.cwd, plan.sourceDir)}`)
  logger.log(`  target: ${formatPlanPath(plan.cwd, plan.targetDir)}${plan.targetExists ? ' (already exists)' : ''}`)
  logger.log(`  package: ${plan.packageName}`)
  logger.log(`  package json: ${plan.hasPackageJson ? plan.packageJsonFileName : 'not included in template'}`)
  logger.log('')
  logger.info('dry run only; no files were written')
}

function printCreatePlanJson(plan: CreateNewProjectPlan) {
  logger.log(JSON.stringify(plan, null, 2))
}

function formatCreatePlan(plan: CreateNewProjectPlan) {
  return [
    'Create preview:',
    `  template: ${plan.template}${plan.usedFallback ? ` (fallback from ${plan.requestedTemplate})` : ''}`,
    `  source: ${formatPlanPath(plan.cwd, plan.sourceDir)}`,
    `  target: ${formatPlanPath(plan.cwd, plan.targetDir)}${plan.targetExists ? ' (already exists)' : ''}`,
    `  package: ${plan.packageName}`,
    `  package json: ${plan.hasPackageJson ? plan.packageJsonFileName : 'not included in template'}`,
    '',
    'dry run only; no files were written',
  ].join('\n')
}

async function emitCreatePlan(plan: CreateNewProjectPlan, options: RunCreateFlowOptions, cwd: string) {
  if (!options.out) {
    if (options.json) {
      printCreatePlanJson(plan)
    }
    else {
      printCreatePlan(plan)
    }
    return
  }

  const content = options.json ? JSON.stringify(plan, null, 2) : formatCreatePlan(plan)
  const outFile = path.resolve(cwd, options.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(cwd, outFile)}`)
}

function handleCreateFlowError(error: unknown, json = false): RunCreateFlowResult {
  const message = error instanceof Error ? error.message : String(error)
  if (json) {
    logger.log(JSON.stringify({ error: message }, null, 2))
  }
  else {
    logger.error(message)
  }
  process.exitCode = 1
  return { dryRun: false, failed: true }
}

export async function runCreateFlow(cwd: string, inputName: string | undefined, options: RunCreateFlowOptions = {}) {
  try {
    const createConfig = await resolveCommandConfig('create', cwd)
    const explicitTemplate = options.template ?? createConfig?.type ?? createConfig?.defaultTemplate

    let packageName = inputName

    if (!explicitTemplate) {
      const intent = await select({
        message: '你要创建什么？',
        choices: createIntentChoices,
        default: 'library',
      })
      const intentChoice = createIntentChoices.find(item => item.value === intent)
      if (!intentChoice) {
        throw new Error(`未找到 intent: ${intent}`)
      }

      if (!packageName) {
        packageName = await input({
          message: '请输入名称',
          default: 'my-module',
        })
      }

      let type: CreateNewProjectOptions['type'] = intentChoice.defaultTemplate
      if (intent === 'library') {
        type = await select({
          message: '请选择库模板',
          choices: [
            { name: 'TypeScript Library', value: 'tsdown', description: '通用 TS 库' },
            { name: 'Vue Component Library', value: 'vue-lib', description: 'Vue 组件库' },
          ],
          default: 'tsdown',
        })
      }

      const createOptions = {
        name: normalizeTargetName(packageName, intentChoice.defaultBaseDir),
        cwd,
        ...(type !== undefined ? { type } : {}),
      }

      if (options.dryRun) {
        const plan = await resolveCreateNewProjectPlan(createOptions)
        await emitCreatePlan(plan, options, cwd)
        return { dryRun: true }
      }

      await createNewProject(createOptions)
      return { dryRun: false }
    }

    if (!packageName) {
      packageName = await input({
        message: '请输入包名',
        default: createConfig?.name ?? 'my-package',
      })
    }

    const type: CreateNewProjectOptions['type'] = explicitTemplate ?? await select({
      message: '请选择模板类型',
      choices: getCreateChoices(createConfig?.choices),
      default: defaultTemplate,
    })

    const createOptions = {
      name: normalizeNameForTemplate(packageName, type),
      cwd,
      ...(type !== undefined ? { type } : {}),
    }

    if (options.dryRun) {
      const plan = await resolveCreateNewProjectPlan(createOptions)
      await emitCreatePlan(plan, options, cwd)
      return { dryRun: true }
    }

    await createNewProject(createOptions)
    return { dryRun: false }
  }
  catch (error) {
    return handleCreateFlowError(error, options.json)
  }
}
