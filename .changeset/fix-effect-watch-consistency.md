---
"@aurelia/runtime": patch
---

Fix inconsistent initial callback behavior between watch and watchExpression APIs. The callback now runs on initialization even when the observed value is undefined. Closes #2175.

pr: #2349
