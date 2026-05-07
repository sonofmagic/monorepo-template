import process from 'node:process'
import { prepareAssets } from './prepare'

async function main() {
  await prepareAssets({ overwriteExisting: true })
}

main().catch((error) => {
  console.error('[monorepo-templates]', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
