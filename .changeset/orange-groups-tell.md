---
"aurelia": patch
"@aurelia/runtime": patch
---

Fix `IObservation.watch` behavior when `immediate` is `false` — it should only skip the initial callback invocation, not disable observation itself. Closes #2375.

pr: #2377
