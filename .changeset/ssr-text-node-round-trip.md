---
"@aurelia/runtime-html": minor
"@aurelia/template-compiler": patch
---

Server-rendered markup now survives the HTML round trip during hydration. The HTML parser drops empty text nodes and merges adjacent ones, which shifted the node counts in the SSR manifest and crashed hydration. The crashes hit indented `<template repeat.for>` views, empty interpolations, and static text next to bound text.

- New `prepareSSRForSerialization(root)` export: call it on the server after recording the manifest, just before serializing. It replaces empty text nodes with `<!--au-e-->`, puts `<!--au-t-->` between adjacent text nodes, and adds an `<!--au-hm-->` integrity marker. External SSR producers need to emit the same markers.
- `Aurelia.hydrate()` restores those markers before adopting the DOM. In dev builds it warns when the integrity marker is missing, meaning the server skipped `prepareSSRForSerialization()` or the comments were stripped after rendering (for example by a minifier or CDN).
- The template compiler binds interpolated `<textarea>` and `<title>` content through the element's `textContent`, so no `<!--au-->` marker ends up in text-only content where it would render as literal text.

issue: #2526
