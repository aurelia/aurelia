---
"@aurelia/runtime": patch
---

Fix `@computed` observation: prevent proxy-based getters from accidentally observing internal property reads of other `@computed` getters, and treat `deps: []` as a one-time evaluation instead of falling back to standard computed observer. Closes #2363.

pr: #2374
