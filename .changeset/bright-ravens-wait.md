---
"@aurelia/runtime": minor
---

Add `@astTrack` to declare/track dependencies of a function call from Aurelia templates

Usages:
- `@astTrack`
- `@astTrack()`
- `@astTrack('prop', 'nested.prop')`
- `@astTrack(instance => instance.prop + instance.prop2)`
- `@astTrack({ deps: ['prop', 'nested.prop'] })`
- `@astTrack({ deps: ['prop', instance => instance.prop2] })`

Behavior:
- `deps` omitted (or `deps: null/undefined`) falls back to proxy-based tracking.
- `deps: []` explicitly disables tracking for the decorated method.
- `deps` with strings/getter functions enables explicit dependency tracking.
- Applying `@astTrack` again on the same method overrides prior metadata.

