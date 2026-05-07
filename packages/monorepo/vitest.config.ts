import path from 'node:path'
import { configDefaults, defineProject, mergeConfig } from 'vitest/config'
import { loadMonorepoToolingModule } from '../../tooling/load-tooling-module.mjs'

const { defineVitestProjectConfig } = await loadMonorepoToolingModule()

/**
 * Package-local Vitest config for `@icebreakers/monorepo`.
 *
 * This package needs a richer setup than the scaffolded defaults because it also:
 * - aliases the in-repo `@icebreakers/monorepo-templates` source
 * - loads `vitest.setup.ts`
 * - keeps coverage on source + scripts files only
 */
const config = defineProject(mergeConfig(
  await defineVitestProjectConfig({
    options: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
        },
        {
          find: '@icebreakers/monorepo-templates',
          replacement: path.resolve(__dirname, '../monorepo-templates/src/index.ts'),
        },
      ],
    },
  }),
  {
    test: {
      setupFiles: ['./vitest.setup.ts'],
      exclude: [...configDefaults.exclude, 'templates/**/*', './test/fixtures/**/*'],
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
      forceRerunTriggers: ['**/vitest.config.*/**', '**/vite.config.*/**'],
    },
    server: {
      watch: {
        ignored: ['**/package.json/**'],
      },
    },
  },
))

export default config
