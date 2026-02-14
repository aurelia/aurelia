---
"@aurelia/validation": patch
---

chore: removed email address validation rule

This is a BREAKING CHANGE. The decission is tken because the regex/pattern-based email validation was anyway suboptimal. It is better to employ a proper email address parser and create a custom rule for that.

Fixes #1919
