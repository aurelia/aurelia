---
"@aurelia/runtime-html": minor
"@aurelia/router": minor
---

Add opt-in document head management. Register `HeadConfiguration` to get the `IHead` service and the `<au-head>` element, which manage `<title>`, `<meta>`, `<link>`, `<script>`, `<base>` and `<html>` attributes with live bindings. Tags are keyed, so a nested component or route replaces a parent's tag and the parent's tag comes back when it goes away. JSON-LD from `json.bind` is escaped so it can't close the script element. Server-rendered head tags are taken over on hydration, and ones nothing claims are removed after startup.

The router gains a `head` route option and a `canonical` setting. With `HeadConfiguration` registered, route titles go through `IHead`, so `titleTemplate` applies, and the head also updates for `historyStrategy: 'none'`. Without it, the router behaves as before.

Closes #2546.

pr: #2559
