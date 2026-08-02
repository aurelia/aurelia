---
"@aurelia/runtime": patch
---

Deep computed observation now traverses cyclic object, array, map, and set graphs without overflowing the stack.

Computed observers now finish queued reconciliation without retaining dependencies after their final subscriber detaches.

Setter-backed computed properties no longer suppress assignments based on dirty or detached cached values. Successful assignments also invalidate the cached getter value when the setter updates otherwise unobservable state.
