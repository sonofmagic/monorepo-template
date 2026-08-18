# Create a package or app

Use this task when the workspace is ready and you need a new package, application, service, CLI, or documentation site.

## Prerequisites

- Run `repo doctor` from the workspace root.
- Confirm the package name and destination directory.
- Check the available template keys with `repo templates`.

## Smallest command

```bash
repo new <name> --template <template>
```

For example:

```bash
repo new shared-config --template package
```

Use `--dry-run` when you want to inspect the file plan without writing anything.

## Expected result

repoctl prints the selected template, destination, and files it will create. After confirmation, the new project is added to the workspace and its package metadata is ready for the repository checks.

## Common branches

- Template key is unknown: run `repo templates` and choose an installed key.
- Destination exists: choose a new name or inspect the existing project before using an overwrite option.
- The project needs custom assets: create it first, then use [managed template assets](/reference/template-assets) for shared files.

## Next

Run [checks](/tasks/checks), then add the new project to the [CI workflow](/tasks/ci).
