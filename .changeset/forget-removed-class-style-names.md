---
"@aurelia/runtime-html": patch
---

Stop `class` and `style` attribute bindings from tracking every name they have ever applied. Removed class names and style properties are now dropped, so bindings with changing values (for example `class="row-${item.id}"`) no longer slow down and grow in memory over time. Chained class mappings such as `{ a: 'b', b: 'c' }` also remove the correct class. Closes #2512.

pr: #2564
