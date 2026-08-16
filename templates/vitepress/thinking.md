# Project Evolution

This repository began as a reusable monorepo template. It has since evolved into repoctl: a task-first CLI for initializing, diagnosing, creating, validating, upgrading, and releasing pnpm and Turborepo monorepos.

Templates remain an important capability, but they are now private source workspaces packaged through `@icebreakers/monorepo-templates`, not the product identity or independent release units.

See the [repoctl overview](./repoctl/index.md) for the current architecture and public entrypoints.

## Documentation Deployment

The documentation is a VitePress static site deployed as a Cloudflare Worker named `repoctl-docs`. Workers Static Assets serves the generated `.vitepress/dist` directory directly, including the custom 404 page and `_redirects` compatibility rules. There is no application Worker handler because the site has no dynamic request path.

Cloudflare Workers Builds uses the repository root and runs these commands:

```bash
pnpm --filter @icebreakers/website build
pnpm --filter @icebreakers/website run deploy
```

Non-production branches upload preview versions with `pnpm --filter @icebreakers/website run deploy:preview`. Before a production change, `pnpm --filter @icebreakers/website run deploy:dry-run` validates the asset manifest and Wrangler configuration. A production rollback uses `wrangler rollback <VERSION_ID>` after reviewing `wrangler versions list`.

The canonical host is `https://repoctl.icebreaker.top`. The legacy `repo.icebreaker.top` and `monorepo.icebreaker.top` hosts are redirect-only entrypoints and preserve the original path and query string.
