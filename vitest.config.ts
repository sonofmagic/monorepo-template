import { defineConfig } from 'vitest/config'
import { loadMonorepoToolingModule } from './tooling/load-tooling-module.mjs'

const { defineVitestConfig } = await loadMonorepoToolingModule()

export default defineConfig(async () => await defineVitestConfig())
