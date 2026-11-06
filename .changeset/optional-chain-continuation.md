---
"@aurelia/expression-parser": patch
"@aurelia/runtime": patch
"@aurelia/validation": patch
"@aurelia/plugin-conventions": patch
---

- Fixes optional chains such as `record?.format().label` throwing when the guarded receiver is absent. Short-circuited keys and call arguments are skipped, and parentheses end the chain as expected.
- Preserves optional access and chain boundaries in serialized validation expressions and generated template type checks.
