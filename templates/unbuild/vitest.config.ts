import type { MonorepoVitestProjectConfigResult } from '@icebreakers/monorepo/tooling'
import path from 'node:path'
import { createMonorepoVitestProjectConfig } from '@icebreakers/monorepo/tooling'
import { defineProject } from 'vitest/config'

export default defineProject((() => {
  /**
   * Template Vitest config for unbuild-based libraries.
   *
   * Reuses the shared project-level test defaults and only adds the local `@` alias.
   */
  const config: MonorepoVitestProjectConfigResult = createMonorepoVitestProjectConfig({
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  })

  return {
    ...config,
  }
})())
