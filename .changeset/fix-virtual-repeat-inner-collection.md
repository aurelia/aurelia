---
"@aurelia/ui-virtualization": patch
---

Fix `virtual-repeat` collection observation when its iterable is wrapped in a value converter or binding behavior. Mutations to the original collection now re-evaluate the wrapped expression and refresh the rendered views even when the wrapper returns a different collection instance.

pr: #2410
