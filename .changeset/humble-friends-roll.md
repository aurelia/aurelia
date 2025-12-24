---
"@aurelia/runtime-html": minor
---

Add SSR hydration support. The new Aurelia.hydrate() API adopts server-rendered HTML without re-rendering. Template controllers (repeat, if, switch, with) use a manifest-based system to locate and adopt existing DOM nodes. CustomElement.clearDefinition() enables cache invalidation between requests.
