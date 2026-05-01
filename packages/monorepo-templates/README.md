# @icebreakers/monorepo-templates

Template assets and metadata used by `create-icebreaker` and `@icebreakers/monorepo`.

This package ships:

- `templates/`: app and package templates
- `assets/`: root workspace config files and upgrade assets for `monorepo`
- template metadata helpers such as `getTemplateChoices()`, `getTemplateChoice()`, and `getTemplateDefinition()`

## Template Discovery

```ts
import { getTemplateChoices, getTemplateDefinition } from '@icebreakers/monorepo-templates'

const libraries = getTemplateChoices({ category: 'library' })
const vitepress = getTemplateDefinition('vitepress')
```

The returned metadata is a cloned snapshot, so callers can safely format it for CLI help, docs, or scaffold previews without mutating the package registry.
