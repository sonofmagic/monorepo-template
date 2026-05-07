# Configuration

repoctl recommends one root config file:

```txt
repoctl.config.ts
```

`monorepo.config.ts` remains supported for compatibility, but the two files cannot coexist. `repo doctor` reports the conflict as a blocking issue.

## Minimal Config

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'tsdown',
    },
  },
})
```

After setting `commands.create.defaultTemplate`, this command can create a package without asking for the template:

```bash
repo new utils
```

## Common Config

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    init: {
      preset: 'standard',
    },
    create: {
      defaultTemplate: 'tsdown',
    },
    clean: {
      autoConfirm: true,
    },
    upgrade: {
      skipOverwrite: true,
    },
  },
})
```

| Option                            | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `commands.init.preset`            | Default setup preset                            |
| `commands.create.defaultTemplate` | Default template for `repo new <name>`          |
| `commands.clean.autoConfirm`      | Whether clean commands confirm by default       |
| `commands.upgrade.skipOverwrite`  | Whether upgrade preserves changed managed files |

## Inspect Config

```bash
repo config inspect
repo cfg i --json --out reports/config.json
repo cfg i --markdown --redact --out reports/config.md
```

Use `--redact` before sharing reports in issues, PRs, or external support channels.
