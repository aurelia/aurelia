---
"@aurelia/expression-parser": patch
---

Constructor expressions without parentheses now work inside larger binding expressions, such as `entries.push(new Entry)` and `[new Map, label]`. The parser also reports malformed text following these expressions instead of silently consuming it.
