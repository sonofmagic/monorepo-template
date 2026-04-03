import path from 'node:path'
import { defineProject } from 'vitest/config'
import { ensureToolingBuilt } from '../../tooling/ensure-tooling-built.mjs'

await ensureToolingBuilt()

const { defineVitestProjectConfig } = await import('repoctl/tooling')

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
