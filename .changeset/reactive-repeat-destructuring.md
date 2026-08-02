---
"@aurelia/expression-parser": patch
"@aurelia/runtime-html": patch
---

Shallow object destructuring and property aliases in `repeat.for` declarations now create reactive locals that follow the source item without writing local assignments back to it. Reused rows reconnect those locals when their item is replaced, and unsupported targets report `AUR0177` instead of creating invalid locals.
