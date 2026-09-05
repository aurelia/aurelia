---
"@aurelia/runtime-html": patch
---

Text interpolations now continue to update when an expression reevaluates to the same array. This includes later array edits and edits made before a queued update runs.
