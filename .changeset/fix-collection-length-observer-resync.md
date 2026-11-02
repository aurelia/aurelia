---
"@aurelia/runtime": patch
---

Fix collection length and size observers missing a change after they re-subscribe, by resyncing their cached count when the first subscriber attaches.
