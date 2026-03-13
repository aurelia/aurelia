---
"@aurelia/router": minor
---

Refactor router path syntax and add `transitionPlan` override support via `Router#load`.

Path syntax changes:
- `/path`: absolute path from the root of the application
- `path`, `./path`: relative to the current routing context
- `../path`, `../../path`: relative to an ancestor routing context; each `../` moves one level up

`Router#load` now respects an explicit `transitionPlan` option when provided:

```ts
this.router.load('test', { transitionPlan: 'replace', queryParams: { message: this.newMessage } });
```

pr: #2369
