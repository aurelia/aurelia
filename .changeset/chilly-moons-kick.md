---
"@aurelia/router": patch
---

Cancelling navigation by returning `false` from `canUnload` now restores the route-context's node.

pr: #2431
