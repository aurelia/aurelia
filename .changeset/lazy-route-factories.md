---
"@aurelia/router": minor
"@aurelia/kernel": patch
---

Child routes with a factory component, such as `component: () => import('./x')`, now load on first match instead of at startup, so chunks for routes the user never visits are not downloaded. A failed import fails only the current navigation and is retried on the next one. Set `useEagerLoading: true` to keep resolving every route at startup. Closes #2553.

Behaviour change: until a lazy route is first visited, its navigation model entry and route id come from the parent route config. A `title`, `nav`, or `data` declared in the component's own `@route` updates the navigation model entry once the module loads, and an `id` declared only there cannot be used to navigate before then.

The module loader no longer reports unhandled rejections for failed module promises; callers still receive the rejection.

pr: #2556
