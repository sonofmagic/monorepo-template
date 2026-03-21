import type { MonorepoConfig } from 'repoctl'

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
    commitlint: {
      extends: ['@commitlint/config-conventional'],
    },
    eslint: {
      ignores: ['**/fixtures/**'],
    },
    stylelint: {
      rules: {},
    },
    lintStaged: {
      monorepoCommand: 'pnpm exec repoctl',
    },
    tsconfig: {
      compilerOptions: {},
    },
    vitest: {
      includeWorkspaceRootConfig: false,
    },
    vitestProject: {
      globals: true,
      testTimeout: 60_000,
    },
  },
} satisfies MonorepoConfig
