---
"@aurelia/runtime": patch
---

Collection length and size observers now detach from their owning collection after their final subscriber unsubscribes, avoiding unnecessary collection-change work.
