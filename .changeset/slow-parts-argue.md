---
"@aurelia/router": patch
---

refactor(router): path syntax and transition plan

It addresses the following issues.

### 1. Path syntax

This PR implements the path syntax changes proposed by @bigopon here: https://github.com/aurelia/aurelia/issues/2256#issuecomment-3360075505. Below is a short recap:

- `/path`: This represents an absolute path from the root of the application.
- `path`, `./path`: These represent a relative paths from the current routing context.
- `../path`, or `../../path`: These represent relative paths from the ancestor routing context; every `../` moves one level up in the routing context hierarchy.

### 2. Overriding `transitionPlan` from `Router#load`

This is reported in [Discord](https://discord.com/channels/448698263508615178/1243519563283435520/1427940294506319904).

This PR ensures that an explicit `transitionPlan` provided like following via `Router#load` is enforced.

```ts
this.router.load('test', { transitionPlan: 'replace', queryParams: { message: this.newMessage } });
```

PR: #2369
