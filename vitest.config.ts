import { defineConfig } from 'vitest/config'
import { ensureToolingBuilt } from './tooling/ensure-tooling-built.mjs'

await ensureToolingBuilt()

const { defineVitestConfig } = await import('@icebreakers/monorepo/tooling')

export default defineConfig(async () => await defineVitestConfig())
