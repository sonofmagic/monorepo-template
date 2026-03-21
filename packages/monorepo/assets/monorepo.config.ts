import type { MonorepoConfig } from 'repoctl'

export default {
  commands: {
    create: {
      defaultTemplate: 'tsdown',
      renameJson: false,
    },
    clean: {
      autoConfirm: false,
      ignorePackages: ['@icebreakers/website'],
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
