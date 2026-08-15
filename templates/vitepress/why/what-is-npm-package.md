# What Is An npm Package?

An npm package is a directory described by `package.json`. It can expose runtime code, types, command-line bins, assets, or configuration.

The public contract includes the package name, version, `exports`, `types`, `bin`, supported runtimes, files included in the tarball, and semantic versioning behavior. Treat these fields as API design, not publishing metadata afterthoughts.

Use `pnpm pack` to inspect the exact artifact before publishing.
