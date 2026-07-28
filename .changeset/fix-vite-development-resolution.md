---
"@aurelia/vite-plugin": patch
---

Fix Aurelia development-package resolution in Vite so it no longer adds the global `development` export condition. When development imports are enabled, only bare imports of `aurelia` and `@aurelia/<package>` are redirected to their `/development` subpaths, preserving the correct browser exports for third-party dependencies.

pr: #2419
