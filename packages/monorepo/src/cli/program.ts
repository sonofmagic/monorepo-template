import process from 'node:process'
import { program } from '@icebreakers/monorepo-templates'
import { name as cliName, version } from '../constants'
import { registerAiCommands } from './commands/ai'
import { registerEnvCommands } from './commands/env'
import { registerPackageCommands } from './commands/package'
import { registerSkillsCommands } from './commands/skills'
import { registerToolingCommands } from './commands/tooling'
import { registerVerifyCommands } from './commands/verify'
import { registerWorkspaceCommands } from './commands/workspace'

const cwd = process.cwd()

program.name(cliName).version(version)

registerWorkspaceCommands(program, cwd)
registerToolingCommands(program, cwd)
registerEnvCommands(program, cwd)
registerSkillsCommands(program, cwd)
registerVerifyCommands(program, cwd)
registerAiCommands(program, cwd)
registerPackageCommands(program, cwd)

export default program
