---
"@aurelia/router": minor
---

Add `IContextRouter` - a convenience wrapper that combines `IRouter` with the component's current `IRouteContext`, so that calls to `load()` always resolve relative to the correct routing context without needing to pass `context` explicitly.

pr: #2368
