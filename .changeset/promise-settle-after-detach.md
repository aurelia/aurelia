---
"@aurelia/runtime-html": patch
---

`promise.bind` no longer throws `TypeError: Cannot read properties of null (reading 'status')` when its promise settles after the controller has detached, for example after `au.stop()`, navigating away, or a cached `if` hiding it. A settlement that belongs to an earlier attachment or an earlier value is now ignored, and the current attachment renders the result. Detaching before a pending swap has run no longer reports the intentional task cancellation as an unhandled rejection. Closes #2529.
