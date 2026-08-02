---
"@aurelia/router": patch
---

Object-form route configurations now preserve a component's static `nav` value when no explicit override is supplied.

Routes without an explicit or static `id` now derive it from their primary effective path, including path overrides supplied by child route configuration or `getRouteConfig`.
