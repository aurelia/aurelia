---
"@aurelia/runtime": patch
---

Fix out-of-bounds array writes from template expressions. Assigning past the end of an array (for example `items[5] = x` on a 2-item array) now puts the value at that index and fills the gap with `undefined`, instead of appending it to the end. Increasing `length` now grows the array instead of being ignored. Both changes notify array observers, so `repeat.for` stays in sync. Closes #2549.

pr: #2558
