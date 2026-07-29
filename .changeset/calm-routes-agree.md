---
"@aurelia/router": patch
---

Fix application-root navigation under configured base paths. Root-prefixed string instructions now retain their application-root meaning when the base is removed, and a base such as `/app` is stripped only at a path, query, or fragment boundary—not from paths such as `/apple`.

Consume excess leading `../` prefixes while clamping route-context traversal at the application root. This prevents unresolved parent syntax from leaking into browser URLs after intercepted navigation has already resolved at the root.

Keep hash-mode `load` links under the configured application base, matching `href` links and the destination used by router navigation.
