---
"@aurelia/dialog": patch
"@aurelia/runtime": patch
"@aurelia/runtime-html": patch
---

Improve TypeScript inference for dialog results and decorator callbacks:

- `DialogOpenPromise.whenClosed()` now resolves to `DialogCloseResult` when called without handlers and correctly infers fulfillment and rejection callback result types.
- `@watch` now carries the watched expression's value type into handler parameters, including the previous value and decorated instance.
- `@computed` dependency callbacks now infer the decorated class instance and return a typed getter or method decorator instead of `any`.

pr: #2412
