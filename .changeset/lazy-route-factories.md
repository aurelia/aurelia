---
"@aurelia/router": minor
"@aurelia/kernel": patch
---

Routes configured with a path and component factory now register without loading the component. Navigation loads matched routes; component-type lookups and nested path generation can also resolve factories before a visit. `useEagerLoading: true` keeps eager startup loading.

- `load` links bound to component types wait for their configured URL and update active state when it resolves.
- Failed child imports reject navigation even when the parent is already active, and later navigation can retry. The module loader forwards failures to callers without creating an extra unhandled rejection.

**Route metadata:** Until the factory resolves, menus and route-ID lookup use the parent route configuration. Declare values needed at startup there. Parent values take precedence over metadata supplied by the loaded component.

Closes #2553.

pr: #2556
