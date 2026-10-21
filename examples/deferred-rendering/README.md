# Deferred rendering

A report page whose sections render later than the page, using the `defer` template controller.
See the [deferred rendering docs](../../docs/user-docs/templates/deferred-rendering.md).

| Section | Renders | Loads its code |
|---|---|---|
| Notes | On click (`interaction`) | On hover (`prefetch: hover`), with `<import defer as>` |
| Order lines | When a checkbox is ticked (`when.bind`) | Nothing to load |
| Regions | On click | With `load.bind`, and shows `defer-error` when the download fails |
| Sales | When it scrolls into view (`viewport`) | When the browser is idle (`prefetch: idle`), with `<import defer>` |

Run it with `npm start`, then watch the network panel of the browser dev tools: each section's code
downloads as its own chunk, only when its trigger fires.
