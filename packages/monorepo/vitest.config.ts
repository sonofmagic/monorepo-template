import path from 'node:path'
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
    globals: true,
    testTimeout: 60_000,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['templates/**/*', './test/fixtures/**/*'],
    coverage: {
      include: [
        'src/**/*.ts',
        'scripts/**/*.ts',
        'vitest.setup.ts',
      ],
      exclude: [
        'src/**/__mocks__/**',
      ],
      all: true,
      skipFull: false,
    },
    // @ts-ignore
    forceRerunTriggers: ['**/vitest.config.*/**', '**/vite.config.*/**'],

  },
  server: {
    watch: {
      ignored: ['**/package.json/**'],
    },
  },
})
