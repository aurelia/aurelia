---
"@aurelia/runtime-html": patch
---

Structural updates now remain ordered when lifecycle hooks settle asynchronously:

- Repeat reconciles queued collection changes against the latest items.
- `<au-compose>` prevents stale structural results from becoming active after a newer composition or teardown takes over.
- Model-only `activate(model)` work remains owned by the composed component.

Application start and stop now handle overlapping requests consistently:

- Stop requests made during asynchronous startup are retained and receive their own completion Promise, including across application-root replacement.
- Initial If and Switch branch failures reach `start()`.
- Value-driven If and Switch changes retain their existing cleanup and recovery behavior.
- Lifecycle hooks and AppTasks preserve the original failure value.

pr: #2461
