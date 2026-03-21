import path from 'node:path'
import { defineVitestProjectConfig } from 'repoctl/tooling'
import { defineProject } from 'vitest/config'

export default defineProject(await defineVitestProjectConfig({
  config: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
}))
