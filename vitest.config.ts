import { defineVitestConfig } from '@icebreakers/monorepo/tooling'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => await defineVitestConfig(
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
))
