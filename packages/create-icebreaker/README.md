# create-icebreaker

One-shot bootstrapper for the icebreaker monorepo template. It clones the template repo, removes `.git`, and optionally runs the built-in cleanup before you install dependencies.

## Usage

- `pnpm create icebreaker my-app`
- `npm create icebreaker@latest my-app`

By default this:

- clones `sonofmagic/monorepo-template` (branch `main`) into `my-app`
- strips the git history
- runs `pnpm dlx @icebreakers/monorepo@latest clean --yes`

## Flags

- `--repo <git-url-or-owner/name>`: clone a different repo
- `--branch <branch-or-tag>`: choose a branch or tag
- `--no-clean`: skip running `monorepo clean`
- `--include-private`: include private packages when cleaning
- `--force`: overwrite a non-empty target directory
- `--agent <pnpm|npm>`: force which tool to run the cleanup with
