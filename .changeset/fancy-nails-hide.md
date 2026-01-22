---
"@aurelia/router": patch
---

feat(router): IContextRouter to wrap IRouter and the current IRouteContext so that the calls to `IRouteContext.load()` alwysy resolves to correct routing context

PR: #2368
