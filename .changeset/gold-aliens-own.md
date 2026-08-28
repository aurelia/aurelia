---
"@aurelia/runtime-html": minor
"@aurelia/template-compiler": minor
---

Conditional rendering now supports `else if` chains by placing `else` and `if.bind` on the same element.

- Chains evaluate conditions lazily and stop after the first matching branch.
- Native elements, custom elements, and explicit `<template>` branches can participate in the same chain.
- Rapid condition changes keep nested fallbacks aligned with the latest matching branch, including while an earlier branch is still attaching.

pr: #2453
