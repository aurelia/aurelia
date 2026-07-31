---
"@aurelia/plugin-conventions": patch
---

Fix conventional template pairing for classes containing `$au` in strings or other non-resource code. Only an actual static `$au` property now selects the static resource-definition path.
