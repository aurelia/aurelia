---
"@aurelia/runtime-html": patch
"@aurelia/template-compiler": patch
---

`else` now enforces its documented relationship with an `if` on the immediately preceding sibling element. Formatting whitespace and HTML comments may remain between them. Text, interpolations, `<let>` bindings, local-template declarations, or elements now end the pair, preventing an unrelated or nested `if` from capturing the branch.

Templates that previously relied on an intervening plain element should move it outside the pair or use an explicit `if.bind` condition.
