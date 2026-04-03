import { ensureToolingBuilt } from './tooling/ensure-tooling-built.mjs'

await ensureToolingBuilt()

const { defineLintStagedConfig } = await import('@icebreakers/monorepo/tooling')

export default await defineLintStagedConfig()
