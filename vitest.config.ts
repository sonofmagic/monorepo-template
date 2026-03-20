import type { MonorepoVitestConfigResult } from '@icebreakers/monorepo/tooling'
import { defineVitestConfig } from '@icebreakers/monorepo/tooling'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  /**
   * Root Vitest workspace config.
   *
   * Defaults come from `monorepo.config.ts -> tooling.vitest`, then this file applies
   * the final inline overrides needed by the workspace root test runner.
   */
  const config: MonorepoVitestConfigResult = await defineVitestConfig(
    {
      includeWorkspaceRootConfig: false,
    },
    {
      test: {
        coverage: {
          exclude: [
            '**/dist/**',
          ],
          skipFull: true,
        },
      },
    },
  )

  return config
})
