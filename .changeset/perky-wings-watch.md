---
"@aurelia/route-recognizer": minor
"@aurelia/router": minor
---

Add eager loading mode for router configuration via `RouterConfiguration.customize({ useEagerLoading: true })`. When enabled, the router builds the full routing table at startup, resolving issues with direct navigation to nested child routes. Closes #2273.

pr: #2355
