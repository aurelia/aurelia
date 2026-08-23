---
"@aurelia/runtime-html": patch
---

When a later interpolation expression or the initial target update fails during binding, Aurelia now releases the interpolation parts that finished binding earlier instead of leaving their subscriptions active.
