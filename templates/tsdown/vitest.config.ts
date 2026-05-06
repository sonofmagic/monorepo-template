import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineVitestProjectConfig } from 'repoctl/tooling'
import { defineProject } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineProject(await defineVitestProjectConfig({
  options: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
}))
