---
"@aurelia/validation": patch
---

chore(validation): deprecated the email rule

The non-RFC-compliant email rule is now deprecated. It is recommended to apply a RFC compliant email address parser in a custom rule via `.satisfiesRule()` or `.satisfies()` instead.
