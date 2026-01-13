---
"@aurelia/runtime-html": patch
---

Optimize repeat's indexMap computation from O(n²) to O(n) using scope identity map lookup instead of Array.includes/indexOf.
