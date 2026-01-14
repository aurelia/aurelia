---
"@aurelia/kernel": patch
---

Fix factory resolution to go through the resolver pipeline, allowing Factory to be resolved from non-constructable keys. Closes #2336.

pr: #2338
