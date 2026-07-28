---
"@aurelia/vite-plugin": patch
---

Fix Vite builds that use custom `--mode` names. HTML imports are now rewritten whenever Vite runs the `build` command, so compiled templates—including templates for lazy-loaded routes—are no longer omitted when the mode is not literally `production`.

pr: #2417
