import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: [
      {
        find: '@icebreakers/monorepo-templates',
        replacement: path.resolve(__dirname, '../monorepo-templates/src/index.ts'),
      },
    ],
    passWithNoTests: true,
  },
})
