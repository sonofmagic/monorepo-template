import process from 'node:process'

async function main() {
  const entryUrl = new URL('../dist/index.mjs', import.meta.url)
  const { prepareAssets } = await import(entryUrl.href)
  await prepareAssets({ overwriteExisting: true })
}

main().catch((error) => {
  console.error('[monorepo-templates]', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
