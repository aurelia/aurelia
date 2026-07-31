---
"@aurelia/expression-parser": patch
"@aurelia/runtime-html": patch
---

Make shallow object destructuring and aliases in repeat declarations reactive. Reused rows now reconnect their locals to replacement items, and invalid object targets report AUR0177 instead of silently producing invalid locals.
