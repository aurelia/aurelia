---
"@aurelia/runtime-html": minor
---

Add `flush-mode` bindable to `au-compose` for controlling flush timing of compositions. When set to `async`, binding updates to `component` and `model` are batched together, preventing duplicate `activate` calls. Closes #2373.

pr: #2376
