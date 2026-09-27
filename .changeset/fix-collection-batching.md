---
"@aurelia/runtime": patch
---

Fix batched Array, Map, and Set changes being replayed during later mutations, which could break repeated views with `AUR0814`. Changes delivered by a nested batch are no longer repeated when the outer batch finishes, and later outer writes are batched correctly.

Property subscribers receive the first old value and final new value for a pending change. When a subscriber normalizes another pending property, its updated value replaces the stale queued notification.

Inner batches keep their synchronous flush boundaries. The batching guides now explain those boundaries and per-observer notifications.
