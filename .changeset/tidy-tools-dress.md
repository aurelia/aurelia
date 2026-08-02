---
"@aurelia/validation": patch
---

The built-in email validation rule is now deprecated because its pattern does not comply with RFC 5322 or RFC 6532.

It is recommended to apply an RFC-compliant email address parser in a custom rule via `.satisfiesRule()` or `.satisfies()` instead.

pr: #2387
