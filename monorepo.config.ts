import { randomUUID } from 'node:crypto'
import { defineMonorepoConfig } from '@icebreakers/monorepo'

const randomPromptOutput = () => `agentic/prompts/prompt-${randomUUID()}.md`

export default defineMonorepoConfig({
  commands: {
    ai: {
      output: randomPromptOutput(),
      baseDir: 'agentic/prompts',
      format: 'md',
      force: true,
    },
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
})
