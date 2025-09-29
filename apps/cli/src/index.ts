import process from 'node:process'
import { pathToFileURL } from 'node:url'

export function runCli(argv: string[] = process.argv) {
  console.log('[@icebreakers/cli]: ', argv)
}

const executedFile = process.argv[1]
if (executedFile) {
  const entryUrl = pathToFileURL(executedFile).href
  if (entryUrl === import.meta.url) {
    runCli()
  }
}
