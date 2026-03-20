import path from 'node:path'
import { createMonorepoVitestProjectConfig } from '@icebreakers/monorepo/tooling'
import { defineProject } from 'vitest/config'

export default defineProject({
  ...createMonorepoVitestProjectConfig({
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  }),
})
