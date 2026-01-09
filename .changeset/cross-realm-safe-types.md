---
"@aurelia/kernel": patch
---

Make type utilities cross-realm safe (isObject, isArray, isSet, isMap, isPromise). Fixes observation failures in iframes and test runners (vitest, jest) using JSDOM, where `instanceof` checks fail due to cross-realm object creation.
