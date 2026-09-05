---
"@aurelia/runtime": patch
---

Computed getters can now read objects created with `Object.create(null)`, including Router parameter snapshots. These objects no longer cause proxy observation to throw when checking `@nowrap` metadata.
