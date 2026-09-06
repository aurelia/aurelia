---
"@aurelia/runtime": patch
---

Method calls through bracket notation, such as `model[action](item)`, now preserve their receiver. Computed-method dependencies and array-method observation follow the same behavior as dot calls.

Event-handler references such as `click.trigger="model[action]"` also keep `model` as the method's `this` value.
