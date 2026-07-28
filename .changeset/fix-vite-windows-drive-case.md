---
"@aurelia/vite-plugin": patch
---

Fix source filtering on Windows when Vite reports an absolute module ID whose drive-letter casing differs from the current working directory. The plugin now normalizes the drive letter before include/exclude matching so eligible Aurelia source files are transformed instead of skipped.

pr: #2420
