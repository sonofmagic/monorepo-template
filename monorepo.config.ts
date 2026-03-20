import type { MonorepoConfig } from '@icebreakers/monorepo'

/**
 * Root monorepo defaults.
 *
 * Keep only intentional deviations from built-in command/tooling defaults here.
 * Hover `defineMonorepoConfig()` and the referenced types for the full field-level docs.
 */
const config: MonorepoConfig = {
  commands: {
    create: {
      defaultTemplate: 'tsdown',
      renameJson: false,
    },
    clean: {
      autoConfirm: false,
      includePrivate: true,
    },
    upgrade: {
      skipOverwrite: false,
      mergeTargets: true,
    },
  },
  tooling: {
    lintStaged: {
      monorepoCommand: 'pnpm exec monorepo',
    },
    vitest: {
      includeWorkspaceRootConfig: false,
      coverageExclude: ['**/dist/**'],
    },
  },
}

export default config
