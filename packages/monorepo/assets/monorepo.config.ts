import type { MonorepoConfig } from '@icebreakers/monorepo'

/**
 * Scaffolded monorepo defaults.
 *
 * Keep this file focused on project-specific overrides and rely on runtime defaults elsewhere.
 */
const config: MonorepoConfig = {
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
}

export default config
