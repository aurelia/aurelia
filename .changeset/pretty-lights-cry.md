---
"@aurelia/runtime": patch
---

getter decorated with computed shouldn't allow other proxy based observers to eval, treat empty deps [] similar like one time binding
