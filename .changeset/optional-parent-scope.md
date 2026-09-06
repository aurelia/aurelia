---
"@aurelia/expression-parser": patch
"@aurelia/runtime": patch
"@aurelia/validation": patch
---

Bindings such as `$parent?.title ?? title` now use the fallback when a view has no parent scope, including isolated `au-compose` views. Optional parent access also works for method calls and retains its meaning in strict bindings and serialized validation expressions.
