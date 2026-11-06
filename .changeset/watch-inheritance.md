---
"@aurelia/runtime-html": patch
---

`@watch` now works with class inheritance. A subclass inherits every `@watch` declared on its base classes, whichever class is instantiated first, and a `@watch` declared on a subclass no longer leaks into the base class's definition. Method `@watch` definitions are now recorded when the class is decorated, so `CustomElement.getDefinition(Type).watches` and `CustomAttribute.getDefinition(Type).watches` include them before any instance exists. Closes #2576.

pr: #2577
