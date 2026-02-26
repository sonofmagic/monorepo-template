---
"@icebreakers/monorepo": patch
---

fix: merge `.gitignore` during `monorepo up` instead of overwriting existing project rules.

- keep local ignore entries when `.gitignore` already exists
- append only missing template rules and avoid duplicate entries
- skip overwrite prompt when merged result is content-equivalent
