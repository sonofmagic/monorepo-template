---
'@icebreakers/monorepo': patch
---

Avoid overwriting prepared assets/templates so concurrent Windows test runs do not hit EPERM unlink errors.
