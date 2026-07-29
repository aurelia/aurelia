---
"@aurelia/kernel": patch
---

Fix DI metadata inheritance so derived classes honor their own `static inject` and `@inject` declarations without reusing or mutating base-class dependency metadata.
