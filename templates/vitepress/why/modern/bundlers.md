# Bundlers

Library bundlers turn source modules into publishable runtime and declaration artifacts. The repository's TypeScript library asset uses [tsdown](https://github.com/sonofmagic/repoctl/tree/main/templates/tsdown), while the Vue library asset adds Vue-specific build and type checking.

Configure entrypoints, external dependencies, output formats, source maps, and declarations according to the package contract. Applications and libraries have different goals: application builds optimize deployment; library builds preserve reusable public boundaries.
