import process from 'node:process'
import { program } from '@icebreakers/monorepo-templates'
import { name as cliName, version } from '../constants'
import { registerAiCommands } from './commands/ai'
import { registerEnvCommands } from './commands/env'
import { registerPackageCommands } from './commands/package'
import { registerSkillsCommands } from './commands/skills'
import { registerToolingCommands } from './commands/tooling'
import { registerTopLevelCommands } from './commands/top-level'
import { registerVerifyCommands } from './commands/verify'
import { registerWorkspaceCommands } from './commands/workspace'

const cwd = process.cwd()

program
  .name(cliName)
  .version(version)
  .description('One-command repo setup and maintenance for pnpm/turbo workspaces.')

registerTopLevelCommands(program, cwd)
registerWorkspaceCommands(program, cwd)
registerToolingCommands(program, cwd)
registerEnvCommands(program, cwd)
registerSkillsCommands(program, cwd)
registerVerifyCommands(program, cwd)
registerAiCommands(program, cwd)
registerPackageCommands(program, cwd)

program.addHelpText('after', `
Quick start:
  $ ${cliName} init
  $ ${cliName} new
  $ ${cliName} check
  $ ${cliName} upgrade

Compatibility shortcuts:
  $ ${cliName} sync
  $ ${cliName} clean
  $ ${cliName} mirror
`)

export default program
