---
"@aurelia/runtime-html": minor
"aurelia": minor
---

Add a built-in `<error-boundary>` element. When a component inside it fails to activate, the boundary tears that subtree down and renders its `fallback` slot, and the rest of the app keeps running. The fallback reads the error through `$host.error` and can rebuild the content with `$host.reset()`. `reset-key.bind` does the same automatically when a key changes.

Add `IErrorHandler`, a single app-level hook for error reporting. It receives lifecycle, component creation, queued binding and watcher update, app task, and event listener errors, including when the app replaces the listener `onError` option, with an `ErrorInfo` that records the phase, the originating controller, and whether a boundary handled the error. Errors from computed getters re-evaluated in their own queued task don't reach it yet. Errors that no boundary catches keep their current behavior. The one exception is an async failure after a value-driven `if` swap or `switch` case change, which was silently dropped and is now logged with `console.error`.

pr: #2565
