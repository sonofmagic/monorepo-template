# pnpm-turbo-monorepo-template

[![codecov](https://codecov.io/gh/sonofmagic/pnpm-turbo-monorepo-template/branch/main/graph/badge.svg?token=mWA3D53rSl)](https://codecov.io/gh/sonofmagic/pnpm-turbo-monorepo-template)

use pnpm, turborepo and changeset to manage your monorepo

## How to use ?

click use `Use this template` button right side, and add your project.

## Npm publish

add `secrets.NPM_TOKEN` (created by npm) to your `Github` `Actions secrets and variables` and then

if you push changes into the `main` branch, GitHub action will automatically publish the changed (with version changes like `1.0.0` -> `1.1.0`) packages.

## Changelog

use `@changesets/changelog-github` to generate changelog.

remember to update the `"changelog": ["@changesets/changelog-github", { "repo": "<org>/<repo>" }]` in `.changeset/config.json`
