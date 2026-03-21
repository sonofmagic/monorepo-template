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
