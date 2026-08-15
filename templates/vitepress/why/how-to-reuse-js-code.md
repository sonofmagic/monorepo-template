# Reusing JavaScript Code

JavaScript code can be shared through source modules, workspace packages, or published npm packages. The right boundary depends on ownership and consumers.

- Use a local module for code owned by one package.
- Use a workspace package when multiple projects in the same repository share versioned behavior.
- Publish an npm package when external repositories need a stable public API.

In a pnpm workspace, declare internal dependencies with the `workspace:` protocol and let the package build produce explicit runtime and type entrypoints.
