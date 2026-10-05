---
"@aurelia/runtime-html": patch
---

`repeat` now reuses the rows it kept while deactivated when it is activated again, for example when a cached `if` shows a list again or after `stop(false)`. A row is reused when its position still holds the identical item; other rows, and rows adopted from server-rendered HTML, are disposed and recreated. Row components therefore keep their state across hide and show. Closes #2516.

pr: #2570
