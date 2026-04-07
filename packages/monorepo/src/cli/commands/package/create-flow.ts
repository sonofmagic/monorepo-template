import type { CreateNewProjectOptions } from '../../../commands'
import { input, select } from '@icebreakers/monorepo-templates'
import { createNewProject, getCreateChoices } from '../../../commands'
import { defaultTemplate } from '../../../commands/create'
import { resolveCommandConfig } from '../../../core/config'
import { createIntentChoices } from './intents'

function normalizeTargetName(name: string, baseDir: 'packages' | 'apps') {
  if (name.includes('/')) {
    return name
  }
  return `${baseDir}/${name}`
}

export async function runCreateFlow(cwd: string, inputName: string) {
  const createConfig = await resolveCommandConfig('create', cwd)
  const explicitTemplate = createConfig?.type ?? createConfig?.defaultTemplate

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

    await createNewProject(createOptions)
    return
  }

  if (!packageName) {
    packageName = await input({
      message: '请输入包名',
      default: createConfig?.name ?? 'my-package',
    })
  }

  const type: CreateNewProjectOptions['type'] = await select({
    message: '请选择模板类型',
    choices: getCreateChoices(createConfig?.choices),
    default: explicitTemplate ?? defaultTemplate,
  })

  const createOptions = {
    name: packageName,
    cwd,
    ...(type !== undefined ? { type } : {}),
  }

  await createNewProject(createOptions)
}
