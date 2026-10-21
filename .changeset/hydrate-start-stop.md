---
"@aurelia/runtime-html": patch
---

`Aurelia.hydrate()` now runs through `start()`, like `app().start()`. After hydration `isRunning` is `true`, `host.$aurelia` is set, `au-started` is dispatched and `au.stop()` deactivates the hydrated root. Previously `stop()` did nothing and `start()` threw AUR0770.

Tear down a hydrated app with `await au.stop(true); au.dispose();`. The old `root.deactivate(); root.dispose(); au.dispose()` sequence now throws AUR0771 because the app is still running.

issue: #2532
