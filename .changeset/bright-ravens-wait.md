---
"@aurelia/runtime": minor
---

Extend `@computed` decorator to support method decoration for declaring/tracking dependencies when called from an observation context (e.g. a template binding or another computed observation). A normal function call will not trigger any observation.

Note: method usage of `@computed` is experimental. Syntax and behavior may change before final release.

Usages on methods:
- `@computed` - proxy-based auto-tracking
- `@computed('prop', 'nested.prop')` - explicit string dependencies
- `@computed(instance => instance.prop + instance.prop2)` - getter function dependency
- `@computed({ deps: ['prop', 'nested.prop'] })` - config object with string deps
- `@computed({ deps: vm => vm.prop })` - config object with getter function dep

Usages on getters:
- `@computed({ deps: ['prop1', 'prop2'] })` - explicit deps (uses ControlledComputedObserver)
- `@computed({ flush: 'sync' })` - no deps, auto-tracking with sync flush
- `@computed('prop1', 'prop2')` - shorthand for deps array

`getComputedObserver` now accepts an optional `ComputedPropertyInfo` parameter directly instead of reading from an internal WeakMap.
