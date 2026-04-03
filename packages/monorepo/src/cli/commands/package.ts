import type { Command } from '@icebreakers/monorepo-templates'
import type { CreateNewProjectOptions } from '../../commands'
import { input, select } from '@icebreakers/monorepo-templates'
import { createNewProject, getCreateChoices } from '../../commands'
import { defaultTemplate } from '../../commands/create'
import { resolveCommandConfig } from '../../core/config'
import { logger } from '../../core/logger'

async function handlePackageCreate(cwd: string, inputName: string) {
  const createConfig = await resolveCommandConfig('create', cwd)
  let packageName = inputName
  if (!packageName) {
    packageName = await input({
      message: '请输入包名',
      default: createConfig?.name ?? 'my-package',
    })
  }
  const type: CreateNewProjectOptions['type'] = await select({
    message: '请选择模板类型',
    choices: getCreateChoices(createConfig?.choices),
    default: createConfig?.type ?? createConfig?.defaultTemplate ?? defaultTemplate,
  })

  await createNewProject({
    name: packageName,
    cwd,
    type,
  })
  logger.success('package create finished!')
}

export function registerPackageCommands(program: Command, cwd: string) {
  const packageCommand = program.command('package').alias('pkg').description('子包命令')

  packageCommand.command('create')
    .description('创建一个新的子包')
    .alias('new')
    .argument('[name]')
    .action(async (inputName: string) => {
      await handlePackageCreate(cwd, inputName)
    })
}
