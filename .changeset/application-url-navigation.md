---
"@aurelia/router": minor
---

Adds `IRouter.navigate()` and `IRouter.createHref()` for references resolved from the last successful application URL. Register `UrlCustomAttribute` to use the matching `url` link attribute. The same application references work in history and hash mode; existing contextual `load`, router-managed `href`, and incoming address meanings remain supported.

- Adds opt-in `preserveHashDocument` for hash routing. When enabled, startup, history, and generated links preserve the hosting document's pathname and query while changing its route hash. The default retains existing base-path publication behavior.
- Fixes deployment-base normalization during initial navigation, premature decoding of hash fields, and query restoration through Back/Forward.
- Fixes parent-only contextual navigation changing the address while leaving the child view active, and contextual transitions using stale or incorrectly propagated transition options.
- Preserves caller-supplied history state, including guard redirects. Navigation and path generation no longer rewrite or freeze caller-owned instructions, arrays, options, or parameter objects. Public instructions no longer require the internal `recognizedRoute` field, and path-generation inputs accept readonly arrays.
- Fixes structured parameter values being decoded twice or serialized as routing syntax, including values containing `%` and parentheses. Pass original parameter values and let the router encode them.
- Preserves native ownership of canceled clicks, downloads, modified clicks, and links targeting another browsing context.
- Adds development warnings for route-ID/path shadowing (AUR3179) and routing punctuation in static paths (AUR3180). These diagnostics leave existing URL interpretation unchanged.

The navigation documentation now distinguishes contextual instructions, application URL references, and browser hrefs. It also clarifies that generated contextual paths are relative to the context selected by their instruction prefixes; they are not universally replayable from the original caller or directly usable as browser links.

Related to #2256.
