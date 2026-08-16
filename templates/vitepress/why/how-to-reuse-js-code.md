# Reusing JavaScript

Reuse source code through an explicit package boundary. Copying files between applications is fast once and expensive every time the shared behavior changes; a local workspace package makes ownership, versioning, and tests visible.

## Start with a workspace package

```json
{
  "dependencies": {
    "@example/shared": "workspace:*"
  }
}
```

The workspace protocol uses the local package during development and protects the repository from accidentally resolving an unrelated registry version.

## Export a narrow API

```ts
export function normalizeName(value: string) {
  return value.trim().toLowerCase()
}
```

Keep the public entry point small. A shared package should expose behavior that has a real consumer, not a collection of unrelated helpers that happen to be nearby.

## Choose the right reuse level

| Need                         | Better boundary                        |
| ---------------------------- | -------------------------------------- |
| Shared runtime behavior      | A versioned package                    |
| Shared build and lint policy | A preset package or managed asset      |
| Shared application feature   | A feature package with clear ownership |
| One-off project setup        | A template, not a dependency           |

## Keep Reading

- [What Is An npm Package?](./what-is-npm-package.md)
- [Template Systems](../monorepo/templates.md)
