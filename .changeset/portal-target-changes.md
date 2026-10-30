---
"@aurelia/runtime-html": patch
---

`portal` applies target and position changes one at a time, so async lifecycle callbacks can no longer leave content in an outdated target or after the portal is removed. A change made from inside a lifecycle callback waits until the current move has finished. `deactivating`/`deactivated` now receive the previous target, callbacks only run when the content actually moves, and `beforebegin`/`afterend` with a target that has no parent throws AUR0830 instead of a `TypeError`. Closes #2567.

pr: #2569
