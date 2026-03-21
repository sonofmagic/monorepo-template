import { defineVitestConfig } from 'repoctl/tooling'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => await defineVitestConfig())
