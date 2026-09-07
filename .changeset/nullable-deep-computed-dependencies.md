---
"@aurelia/runtime": patch
---

Deep computed dependencies now support models that start as `null` or `undefined`, become populated, and are cleared again. Nested changes remain observable after a replacement model arrives.
