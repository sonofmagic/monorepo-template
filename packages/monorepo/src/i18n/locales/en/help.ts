export const helpMessages = {
  argumentsTitle: 'Arguments:',
  cliDescription: 'Task-first repository initialization and maintenance for pnpm and Turborepo workspaces.',
  commandsTitle: 'Commands:',
  choicesLabel: 'choices:',
  defaultLabel: 'default:',
  envLabel: 'env:',
  globalOptionsTitle: 'Global Options:',
  helpCommand: 'Display help for command',
  helpOption: 'Display help for command',
  languageOption: 'Output language: en or zh-CN',
  optionsTitle: 'Options:',
  presetLabel: 'preset:',
  quickStart: `
Quick start:
  Existing repo:
    $ {cliName} init
    $ {cliName} doctor
    $ {cliName} templates
    $ {cliName} new my-package
    $ {cliName} check

  Faster in generated repos:
    $ pnpm run repo:init
    $ pnpm run repo:doctor
    $ pnpm run repo:new -- my-package
    $ pnpm run repo:check

  Keep the repo current:
    $ {cliName} upgrade
`,
  usageTitle: 'Usage:',
  versionOption: 'Output the version number',
} as const
