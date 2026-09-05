---
"@aurelia/expression-parser": patch
---

Array destructuring in `repeat.for` now works without whitespace before `of`, such as `[key, value]of entries`. Ordinary array literals containing text such as `"part of group"` are also parsed correctly.
