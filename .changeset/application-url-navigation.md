---
"@aurelia/router": minor
---

Adds `navigate()` and `resolveUrl()` for navigation relative to the current application URL, with an opt-in `url` attribute for links. The same references work in history and hash mode. Existing `load` and `href` navigation keeps its current meaning.

- Fixes deployment-base handling during initial navigation and preserves encoded values in hash routes.
- Restores query changes when navigating through browser history.
- Preserves caller-supplied history state, including navigation redirected by a guard.
- Respects canceled clicks, downloads and changing link targets.
- Warns during development when a route ID shadows another route's public path, without changing which route existing URLs select.

Related to #2256.
