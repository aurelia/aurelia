---
"@aurelia/runtime": patch
---

Object-form `@observable({ name, callback, set })` declarations now type-check on classes as well as fields, matching the existing runtime behavior.
