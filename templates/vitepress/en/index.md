---
layout: home

hero:
  name: repoctl
  text: Short, stable workflows for pnpm monorepos
  tagline: Initialize, diagnose, scaffold, verify, and upgrade practical Turborepo workspaces from one CLI.
  image:
    src: /logo.jpg
    alt: repoctl logo
  actions:
    - theme: brand
      text: Get Started
      link: /en/repoctl/getting-started
    - theme: alt
      text: Commands
      link: /en/repoctl/commands

features:
  - title: Adopt existing workspaces
    details: Run setup and doctor to align workspace patterns, root scripts, config files, and commit hooks.
  - title: Create packages and apps
    details: Scaffold libraries, apps, services, docs, and CLIs with interactive prompts or explicit template keys.
  - title: Make checks repeatable
    details: Preview and run local verification plans that match your lint, typecheck, build, test, and tsd workflow.
---

## Fast Path

```bash
pnpm add -D repoctl
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo new
pnpm exec repo check
```

Generated repositories expose the same workflow as shorter root scripts:

```bash
pnpm setup
pnpm doctor
pnpm new
pnpm check
```

## Keep Reading

- [repoctl Overview](./repoctl/index.md)
- [Getting Started](./repoctl/getting-started.md)
- [Adopt Existing Repositories](./repoctl/adopt-existing.md)
- [Choose By Scenario](./repoctl/scenarios.md)
- [Command Reference](./repoctl/commands.md)
- [Configuration](./repoctl/config.md)
- [Templates](./repoctl/templates.md)
- [Workflows and CI](./repoctl/workflows.md)
- [Knowledge Base: Why Monorepo](./knowledge/monorepo.md)
