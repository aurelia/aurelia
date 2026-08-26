---
"@aurelia/runtime-html": patch
---

Conditional views now clean up and recycle at their owning lifecycle boundary:

- `if` branches with `cache: false` are disposed after they finish leaving, including views retained before caching is disabled.
- Released synthetic views can return to configured `ViewFactory` caches after teardown.
- Ancestor-owned lifecycle failures keep their public rejection without also producing an unhandled descendant Promise rejection.
