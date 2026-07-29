---
"@aurelia/kernel": patch
---

Fix error reporting for interfaces without a registration or default implementation. Resolving one reports AUR0012. Resolving one through `newInstanceOf` or `newInstanceForScope` reports AUR0017, including before any interface with a default implementation has been resolved.
