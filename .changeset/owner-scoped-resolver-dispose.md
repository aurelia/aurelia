---
"@aurelia/runtime-html": patch
---

Disposing a repeat row or an `if` view no longer drops registrations scoped to the owning element, such as `newInstanceForScope` instances. The private containers created by `au-compose`, `au-slot` and template controllers with `containerStrategy: 'new'` are now released by their owner. Closes #2552.

pr: #2557
