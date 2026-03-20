import { defineMonorepoVitestConfig } from '@icebreakers/monorepo/tooling'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => await defineMonorepoVitestConfig())
