import { defineConfig } from 'vitest/config'

export default defineConfig(
  () => {
    return {
      test: {
        workspace: [
          'packages/*',
          'apps/*',
        ],
        coverage: {
          enabled: true,
          all: false,
          skipFull: true,
        },
      },
    }
  },
)
