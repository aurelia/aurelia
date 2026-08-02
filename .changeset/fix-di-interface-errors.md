---
"@aurelia/kernel": patch
---

Resolving an interface without a registration or default implementation now reports `AUR0012`. Using `newInstanceOf` or `newInstanceForScope` instead reports `AUR0017`, even if another interface with a default implementation was resolved first.
