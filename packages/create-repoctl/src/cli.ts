import process from 'node:process'
import { createCreateRepoctlProgram } from './index'

const program = createCreateRepoctlProgram()

program.parseAsync(process.argv).catch((error: unknown) => {
  process.stderr.write(`[create-repoctl] ${error instanceof Error ? error.message : error}\n`)
  process.exitCode = 1
})
