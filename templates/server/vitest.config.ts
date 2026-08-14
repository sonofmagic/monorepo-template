import path from 'node:path'
import { defineVitestProjectConfig } from 'repoctl/tooling'
import { defineProject } from 'vitest/config'

export default defineProject(await defineVitestProjectConfig({
  options: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(import.meta.dirname, './src'),
      },
    ],
  },
}))
