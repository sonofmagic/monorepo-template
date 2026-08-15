import process from 'node:process'
import { createCreateRepoctlProgram } from 'create-repoctl'

const program = createCreateRepoctlProgram({
  commandName: 'create-icebreaker',
  defaultTarget: 'icebreaker-monorepo',
})

program.parseAsync(process.argv).catch((error: unknown) => {
  process.stderr.write(`[create-icebreaker] ${error instanceof Error ? error.message : error}\n`)
  process.exitCode = 1
})
