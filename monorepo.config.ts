import type { MonorepoConfig } from '@icebreakers/monorepo'

export default {
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
} satisfies MonorepoConfig
