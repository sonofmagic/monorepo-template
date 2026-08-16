# What Is An npm Package?

An npm package is a versioned archive with a `package.json` contract. It may provide runtime JavaScript, type declarations, a command-line binary, configuration presets, or assets. Publishing a folder is easy; maintaining that contract is the real work.

## The package boundary

```text
package.json  name, version, exports, files, engines
README.md     install and supported usage
dist/         built runtime and type declarations
LICENSE       license terms for consumers
```

Only files named by `files`, exports, and package metadata should be treated as public. Internal source layout is free to change until it appears in the published contract.

## Inspect what ships

```bash
npm pack --dry-run
pnpm pack --pack-destination ./artifacts
```

Review the archive after every material packaging change. This catches missing declarations, accidental source publication, and files referenced by `exports` that were not included.

## Version with intent

- Patch: compatible fix or metadata correction.
- Minor: compatible capability, such as a new public command or template.
- Major: incompatible API, behavior, or supported runtime change.

Repository versioning tools record that decision, but they cannot determine whether a consumer will be broken. Write the release note from the consumer's point of view.

## Keep Reading

- [Publishing A Package](./publish-basic-npm-package.md)
- [Modern Package Guide](./modern/)
