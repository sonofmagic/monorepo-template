import process from 'node:process'
import { createMonorepoVitestConfig, loadMonorepoToolingConfig } from '@icebreakers/monorepo/tooling'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const toolingConfig = await loadMonorepoToolingConfig(process.cwd())
  const config = createMonorepoVitestConfig({
    ...toolingConfig.vitest,
    includeWorkspaceRootConfig: toolingConfig.vitest?.includeWorkspaceRootConfig ?? false,
    coverageExclude: toolingConfig.vitest?.coverageExclude ?? ['**/dist/**'],
  })
  return {
    ...config,
  }
})
