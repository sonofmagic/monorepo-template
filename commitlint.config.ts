import { ensureToolingBuilt } from './tooling/ensure-tooling-built.mjs'

await ensureToolingBuilt()

const { defineCommitlintConfig } = await import('@icebreakers/monorepo/tooling')

export default await defineCommitlintConfig()
