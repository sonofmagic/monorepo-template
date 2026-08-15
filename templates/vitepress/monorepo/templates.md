# Template Systems

Templates make repository conventions executable. repoctl ships internal source workspaces for libraries, Vue components, apps, services, documentation sites, and CLIs.

```bash
repo templates
repo templates --category library
repo new sdk --template tsdown --dry-run
repo templates --check
```

The publishable `@icebreakers/monorepo-templates` package owns the registry and packaged assets. Individual `templates/*` workspaces are private and are not release units.

See [Templates](../repoctl/templates.md) and [Template Asset Management](../repoctl/template-assets.md).
