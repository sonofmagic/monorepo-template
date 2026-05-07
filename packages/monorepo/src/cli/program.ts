import process from 'node:process'
import { Command } from 'commander'
import { cliName, version } from '../constants'
import { registerAiCommands } from './commands/ai'
import { registerConfigCommands } from './commands/config'
import { registerEnvCommands } from './commands/env'
import { registerPackageCommands } from './commands/package'
import { registerReleaseCommands } from './commands/release'
import { registerSkillsCommands } from './commands/skills'
import { registerTemplatesCommands } from './commands/templates'
import { registerToolingCommands } from './commands/tooling'
import { registerTopLevelCommands } from './commands/top-level'
import { registerVerifyCommands } from './commands/verify'
import { registerWorkspaceCommands } from './commands/workspace'

const cwd = process.cwd()
const program = new Command()

program
  .name(cliName)
  .version(version)
  .description('One-command repo initialization and maintenance for pnpm/turbo workspaces.')

registerTopLevelCommands(program, cwd)
registerTemplatesCommands(program)
registerWorkspaceCommands(program, cwd)
registerToolingCommands(program, cwd)
registerEnvCommands(program, cwd)
registerConfigCommands(program, cwd)
registerReleaseCommands(program, cwd)
registerSkillsCommands(program, cwd)
registerVerifyCommands(program, cwd)
registerAiCommands(program, cwd)
registerPackageCommands(program, cwd)

program.addHelpText('after', `
Quick start:
  Existing repo:
    $ ${cliName} init
    $ ${cliName} doctor
    $ ${cliName} templates
    $ ${cliName} new my-package
    $ ${cliName} check

  Faster in generated repos:
    $ pnpm run repo:init
    $ pnpm run repo:doctor
    $ pnpm run repo:new -- my-package
    $ pnpm run repo:check

  Keep the repo current:
    $ ${cliName} upgrade
`)

export default program
