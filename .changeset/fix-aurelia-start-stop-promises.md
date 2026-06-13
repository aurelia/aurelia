---
"@aurelia/runtime-html": patch
"aurelia": patch
---

Ensure `Aurelia.start()` and `Aurelia.stop()` always return `Promise<void>`. Fixes #2433.
