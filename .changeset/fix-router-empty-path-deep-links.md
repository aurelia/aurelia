---
"@aurelia/router": patch
---

Fix cold-start deep links to child routes nested beneath an empty-path parent. The router now passes the remaining URL to the matched parent's child routes instead of prematurely reporting an unknown route at the root.

pr: #2418
