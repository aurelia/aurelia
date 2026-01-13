---
"@aurelia/ui-virtualization": patch
---

Fix virtual-repeat calling parent's attached() multiple times when items are assigned in attached hook. Closes #2350.
