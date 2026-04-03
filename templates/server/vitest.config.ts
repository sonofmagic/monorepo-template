import path from 'node:path'
import { defineProject } from 'vitest/config'
import { loadRepoctlToolingModule } from '../../tooling/load-tooling-module.mjs'

const { defineVitestProjectConfig } = await loadRepoctlToolingModule()

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
