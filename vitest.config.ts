import { defineVitestConfig } from '@icebreakers/monorepo/tooling'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => await defineVitestConfig(
  {
    options: {
      includeWorkspaceRootConfig: false,
    },
    overrides: {
      test: {
        coverage: {
          exclude: [
            '**/dist/**',
          ],
          skipFull: true,
        },
      },
    },
  },
))
