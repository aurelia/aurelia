---
"@aurelia/runtime": patch
---

Fixes a crash in computed getters with `deep: true` when a declared dependency is `null` or `undefined`.
