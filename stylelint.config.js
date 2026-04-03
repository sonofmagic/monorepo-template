import { ensureToolingBuilt } from './tooling/ensure-tooling-built.mjs'

await ensureToolingBuilt()

const { defineStylelintConfig } = await import('@icebreakers/monorepo/tooling')

export default await defineStylelintConfig()
