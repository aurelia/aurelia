---
"@aurelia/router": minor
---

Adds `IRouter.navigate()` and `IRouter.createHref()` to resolve references from the last successful application URL. Register `UrlCustomAttribute` to use the matching `url` link attribute. The same application references work in history and hash mode. Contextual `load`, router-managed `href`, and incoming addresses keep their existing meanings.

- Adds opt-in `preserveHashDocument` for hash routing. When enabled, the router keeps the hosting document's pathname and query while changing its route hash. This applies on startup, when updating browser history, and when generating links. The default continues to build addresses from the configured base path.
- Fixes deployment-base normalization during initial navigation, premature decoding of hash fields, and query restoration through Back/Forward.
- Fixes parent-only contextual navigation changing the address while leaving the child view active, and contextual transitions using stale or incorrectly propagated transition options.
- Preserves caller-supplied history state, including guard redirects. Navigation and path generation no longer rewrite or freeze caller-owned instructions, arrays, options, or parameter objects. Public instructions no longer require the internal `recognizedRoute` field, and path-generation inputs accept readonly arrays.
- Fixes structured parameter values being decoded twice or serialized as routing syntax, including values containing `%` and parentheses. Pass original parameter values and let the router encode them.
- Respects canceled clicks and lets the browser handle downloads, modified clicks, and links targeting another browsing context.
- Adds development warnings for route-ID/path shadowing (AUR3179) and routing punctuation in static paths (AUR3180). These diagnostics leave existing URL interpretation unchanged.

The navigation guides explain when to use contextual instructions, application URL references, and browser hrefs. Path-generation examples show how to replay a generated path from the context selected by its instruction prefixes. A path generated after `../` traversal may require a different context from the original caller, and generated instruction paths are not always suitable as browser links.

Related to #2256.
