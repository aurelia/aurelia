---
"@aurelia/runtime-html": minor
"@aurelia/template-compiler": patch
---

SSR hydration now restores empty and adjacent text-node boundaries from prepared markup after HTML parsing. Native `<textarea>` and `<title>` content no longer displays hydration marker comments as literal text after serialization and parsing, while preserving empty output for nullish values and independent binding behaviors such as debounce.

**Producer updates:**

- Record the manifest first, then call `prepareSSRForSerialization(root)` before serializing. Preserve hydration comments and whitespace during delivery. `Aurelia.hydrate()` restores the corresponding client host automatically.
- Emit element-targeted textarea/title interpolation with `to: 'textContent'` and `isTextContent: true`, and retain the flag in serialized definitions. Adding serialization markers alone cannot repair older compiler output.

See the [SSR producer protocol](https://github.com/aurelia/aurelia/blob/master/packages/runtime-html/README.md#ssr-producer-protocol) for the preparation and instruction contracts.

issue: #2526
