import type { MonorepoConfig } from '@icebreakers/monorepo'

export default {
  commands: {
    create: {
      defaultTemplate: 'unbuild',
      renameJson: false,
    },
    clean: {
      autoConfirm: false,
      ignorePackages: ['@icebreakers/website'],
    },
    sync: {
      concurrency: 4,
      command: 'cnpm sync {name}',
    },
    upgrade: {
      skipOverwrite: false,
      mergeTargets: true,
    },
  },
  tooling: {
    vitest: {
      includeWorkspaceRootConfig: false,
    },
  },
} satisfies MonorepoConfig
