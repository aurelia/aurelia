---
"@aurelia/runtime": patch
"@aurelia/runtime-html": patch
---

Prevent large finite task queue workloads from falsely triggering the recursive deadlock guard. Applications can now queue very large finite batches, including work that queues more work during a drain, without hitting a deadlock error merely because the batch is large.

Automatic `queueTask` drains now process work in timed slices and continue through host timer turns until the queue is idle. This gives the browser opportunities to paint and process input during unusually large flushes. As a result, code that needs to observe the completion of all queued work should use `tasksSettled()` instead of assuming that one microtask turn is always enough for very large automatic drains. Manual `runTasks()` calls remain synchronous and keep an internal deadlock guard for low-level tests and diagnostics.

The task queue error surface is also more explicit. Multiple failures now reject or throw a `TaskQueueAggregateError`, which extends `AggregateError`, preserves the original errors in order, sets `cause` to the first error, and includes a more useful message with the error count and a short preview. Unobserved automatic queue errors are reported and cleared so later `tasksSettled()` cycles start fresh instead of failing with stale errors.

Because automatic drains may now continue after other host events have run, delayed runtime-html work now re-checks lifecycle state before mutating DOM state. Queued layout writes and `show` updates no-op when their binding, controller, or attribute has already been torn down.
