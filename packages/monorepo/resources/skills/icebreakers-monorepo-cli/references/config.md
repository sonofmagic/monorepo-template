# monorepo.config.ts

Use `defineMonorepoConfig` to set default options for CLI commands.
Only include the fields you need.

Example:

```ts
import { defineMonorepoConfig } from '@icebreakers/monorepo'

export default defineMonorepoConfig({
  commands: {
    ai: {
      baseDir: 'agentic/prompts',
      format: 'md',
      force: false,
      tasksFile: 'agentic/tasks.json',
    },
    create: {
      defaultTemplate: 'tsdown',
      renameJson: false,
      templatesDir: 'packages/monorepo/templates',
    },
    clean: {
      autoConfirm: false,
      ignorePackages: ['docs'],
      includePrivate: true,
      pinnedVersion: 'latest',
    },
    sync: {
      concurrency: 4,
      command: 'cnpm sync {name}',
      patterns: ['apps/*', 'packages/*'],
    },
    upgrade: {
      skipOverwrite: false,
      targets: ['.github', 'monorepo.config.ts'],
      mergeTargets: true,
    },
    init: {
      skipReadme: false,
      skipPkgJson: false,
      skipChangeset: false,
      skipIssueTemplateConfig: false,
    },
    mirror: {
      env: {
        VSCode_CLI_MIRROR: 'https://example.invalid',
      },
    },
  },
})
```

Key areas:

- ai: default output, format, batch tasks
- create: default template and template directory
- clean: auto confirm and pinned version control
- sync: workspace selection and concurrency
- upgrade: overwrite behavior and extra targets
- init: skip steps for README/package.json/changeset
- mirror: add or override env mirrors
