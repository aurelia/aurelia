---
"@aurelia/router": patch
---

Links in hash-routing applications now preserve the route path and query when a fragment is included, such as `load="items/a?ref=list#details"`. Encoded query and fragment values are decoded once, including in explicitly hash-prefixed links.
