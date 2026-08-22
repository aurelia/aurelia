---
"@aurelia/i18n": patch
---

Default and `[text]` translations now render values as literal text instead of parsing markup. `[html]`, `[prepend]`, and `[append]` continue to support intentional HTML content. Fixes #2422.
