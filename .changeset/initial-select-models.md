---
"@aurelia/runtime-html": patch
---

Select elements now apply their initial selection after static option models and the matcher binding have been initialized. This fixes preselected values remaining unselected, including multiple-select values supplied through `<let>` and conditional views.

The correction also applies when cached views are rebound and when the selection uses a one-time or to-view binding.
