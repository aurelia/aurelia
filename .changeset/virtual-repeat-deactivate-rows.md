---
"@aurelia/ui-virtualization": patch
---

`virtual-repeat` now deactivates its rendered rows when it is removed, for example when an `if` hides it, the route changes, or the app stops. Rows run `detaching` and `unbinding`, their bindings stop observing the items, and showing the list again runs `attached` on the reused rows. Before, the rows stayed bound and kept a subscriber on every rendered item, and a non-cached `if` added another set of subscribers each time the list was shown. Closes #2550.
