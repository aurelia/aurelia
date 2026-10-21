---
description: Render part of a template later, and load the code it needs only when it's about to show, with the defer template controller.
---

# Deferred rendering (`defer`)

`defer` keeps a block of template out of the first render until a trigger fires: the browser goes idle, the block scrolls into view, the user interacts with it, a timer runs out, or an expression becomes true. The block can also load its components when it renders, which moves heavy UI such as charts, editors and maps out of your main bundle.

```html
<section defer="on: viewport; load.bind: loadChart">
  <heavy-chart series.bind="series"></heavy-chart>
</section>
<div defer-placeholder class="chart-skeleton"></div>
```

```typescript
export class ReportPage {
  series = [1, 2, 3];
  loadChart = () => import('./heavy-chart');
}
```

Until the `<div defer-placeholder>` scrolls into view, the page shows the skeleton. Then `./heavy-chart` downloads, the block is compiled, and the chart renders in place of the skeleton.

## Registering `defer`

`defer` isn't part of the standard configuration, so apps that don't use it don't pay for it. Register it once:

```typescript
import Aurelia, { DeferConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(DeferConfiguration)
  .app(MyApp)
  .start();
```

`DeferConfiguration` registers `defer` and its three branches: `defer-placeholder`, `defer-loading` and `defer-error`.

## How the block behaves

- Nothing inside the block is compiled, instantiated or bound until it renders. Its bindings then use the surrounding scope, the same as `if`. Changes made before it rendered are visible when it does.
- Once the block has rendered it stays rendered. Put an `if` inside it if you need to hide the content again.
- If the block is removed before its trigger fires, nothing is loaded and its observers and listeners are released.
- If the block is detached while its code loads, loading continues, and the content renders once the block is attached again.
- The element that carries `defer` is part of the deferred content, like any other template controller host. Template controllers written before `defer` on the same element wrap it. Those written after it, and every other attribute, are compiled with the content.

## Triggers

Set the triggers with `on`. When there are several, the first one to fire wins, and the others are released.

```html
<div defer>Rendered when the browser is idle</div>
<div defer="viewport">Rendered when the placeholder scrolls into view</div>
<div defer="on: viewport, interaction">Whichever happens first</div>
```

| Trigger | Fires when |
|---|---|
| `idle` (default) | The browser is idle, or 10 seconds have passed on a page that never goes idle. Uses `requestIdleCallback`, or a short timer where it isn't available (Safari). |
| `viewport` | The watched element intersects the viewport. `margin` sets the root margin, for example `margin: 200px`. Where `IntersectionObserver` isn't available, such as in JSDOM tests, it fires when idle instead. |
| `interaction` | The watched element gets a `click` or `keydown`. |
| `hover` | The watched element gets `mouseenter` or `focusin`. |
| `timer` | `delay` milliseconds after the block is attached, for example `on: timer; delay: 500`. |
| `immediate` | Right after the block is attached. The content still loads its code separately from the page. |

`on` also accepts an array: `defer.bind="['viewport', 'idle']"`.

### The watched element

The render location of a template controller is a comment, which can't be observed or listened to. So `viewport`, `interaction` and `hover` watch the first element of the `defer-placeholder` branch. To watch something else, bind `target`:

```html
<h2 ref="commentsHeading">Comments</h2>
<section defer="on: viewport; target.bind: commentsHeading">
  <comment-thread></comment-thread>
</section>
```

With neither a placeholder element nor a `target`, these triggers throw [AUR0826](../developer-guides/error-messages/runtime-html/aur0826.md).

{% hint style="info" %}
Every `defer` block in an app shares one `IntersectionObserver` per root margin, and one idle callback. A feed or dashboard with many blocks doesn't create an observer for each one.
{% endhint %}

### Rendering on a condition

`when.bind` renders the block the first time its value is truthy. It can be combined with `on`, and whichever fires first wins. A block that only has `when` doesn't also get the default `idle` trigger.

```html
<div defer="when.bind: showDetails">
  <order-details order.bind="order"></order-details>
</div>
```

### Prefetching

`prefetch` takes the same triggers as `on`, but it only downloads the block's code. The block still waits for `on` to render. When the trigger fires during a prefetch, the block reuses that download.

```html
<div defer="on: interaction; prefetch: idle; load.bind: loadEditor">
  <rich-editor value.bind="body"></rich-editor>
</div>
<button defer-placeholder>Edit</button>
```

## Loading components

A block that uses elements the page hasn't registered needs to load them before it compiles. There are two ways to say what to load.

### Per block, with `load`

`load` takes a function that returns a promise, or an array of them. A loader can resolve to a module, an element class, or a registry.

```typescript
export class ReportPage {
  loadChart = () => import('./heavy-chart');
  loadWidgets = [
    () => import('./heavy-chart'),
    () => import('./heavy-map').then(m => m.HeavyMap),
  ];
}
```

From a module, `defer` registers the exported resources and registries, and ignores other exports.

### Per component, with `deferredDependencies`

List the elements a component only uses inside `defer` blocks on its definition, keyed by element name:

```typescript
import { customElement } from 'aurelia';
import template from './report-page.html';

@customElement({
  name: 'report-page',
  template,
  deferredDependencies: {
    'heavy-chart': () => import('./heavy-chart'),
    'heavy-map': () => import('./heavy-map'),
  },
})
export class ReportPage {}
```

The template compiler checks which of these elements each block uses, and gives each block only those loaders. A block that shows `<heavy-map>` doesn't download the chart. Elements inside a nested `defer` block are left to that block, so they load when the nested block renders.

With the conventions plugin, add `defer` to an `<import>` instead:

```html
<import from="./heavy-chart" defer></import>
<import from="./maps/world-map" defer as="heavy-map"></import>

<section defer="viewport">
  <heavy-chart series.bind="series"></heavy-chart>
</section>
<div defer-placeholder class="chart-skeleton"></div>
```

The plugin emits `() => import('./heavy-chart')` into `deferredDependencies` instead of a static import, keyed by the element name it derives from the file name. As with a regular `<import>`, `as` registers the element under another name, and the block uses that name.

{% hint style="warning" %}
A deferred element used outside a `defer` block would silently render as an unknown element, so in development the compiler throws [AUR0724](../developer-guides/error-messages/0088-to-0723/aur0724.md) instead. It throws the same error inside a block when the loaded module doesn't define an element with the expected name, for example when a class uses `@customElement('sales-chart')` in `heavy-chart.ts`. Add `as="sales-chart"` to the import, or rename the file, to line the names up.
{% endhint %}

## Placeholder, loading and error branches

Three optional branches follow the `defer` element, the same way `else` follows `if`. They can come in any order, but must be adjacent to the `defer` or to another of its branches. A template controller written before `defer` on the same element, such as `<section if.bind="show" defer>`, wraps the block and hides it from the branches, so put that one on an element around the block and its branches instead.

```html
<section defer="on: viewport; load.bind: loadChart">
  <heavy-chart series.bind="series"></heavy-chart>
</section>
<div defer-placeholder class="chart-skeleton"></div>
<div defer-loading="after: 150; minimum: 400">
  <spinner-icon></spinner-icon>
</div>
<div defer-error>
  Couldn't load the chart: ${$defer.error.message}
  <button click.trigger="$defer.retry()">Retry</button>
</div>
```

| Branch | Renders |
|---|---|
| `defer-placeholder` | Until a trigger fires. Its first element is the default watched element. |
| `defer-loading` | While the code loads. `after` is how long loading must take before it shows, so fast loads don't flash it. `minimum` is how long it stays up once shown. Both are in milliseconds and default to `0`. |
| `defer-error` | When a loader rejects. `$defer.error` is the rejection reason, and `$defer.retry()` calls the loaders again. The error branch stays up with the same `$defer.error` until the retry settles, unless `defer-loading` replaces it. |

All three branches can also read `$defer.state`, which is `placeholder`, `loading`, `complete` or `error`.

A block with nothing to load goes straight from the placeholder to the content, without showing `defer-loading`.

`defer-error` also shows when the loaded content fails to compile, for example with [AUR0724](../developer-guides/error-messages/0088-to-0723/aur0724.md). Since invalid content is a mistake in the app rather than a failure users can recover from, a compile error is also reported to the console.

When loading fails and there's no `defer-error` branch, the block renders nothing and reports [AUR0829](../developer-guides/error-messages/runtime-html/aur0829.md) to the console through Aurelia's task queue, once per failed load. It's never silently dropped. A failed load is also forgotten, so a later attempt calls the loaders again. That includes a block that was detached while its load failed: it loads again once it's attached.

## Debugging

- **Which block failed.** Errors from `defer` name the element whose template contains the block, for example `[defer] in <report-page> failed to load its dependencies`. A failed load is reported as [AUR0829](../developer-guides/error-messages/runtime-html/aur0829.md), with the loader's own error as its `cause`, which the browser console shows below it.
- **What a block is doing.** `$defer.state` in a branch, or the `state` of the `Defer` view model in the dev tools, says whether the block is waiting for a trigger, loading, rendered, or failed.
- **What was loaded.** Each loader shows up as its own request in the network panel when its trigger or prefetch fires. In development, a module that a block loads but that exports no element, attribute or registry logs a `[DEV:aurelia]` warning, since the block would render the element as unknown. So does a loader that resolves to nothing.
- **Mistakes caught early.** A `load` that isn't a function, such as `load.bind: import('./chart')`, fails with [AUR0828](../developer-guides/error-messages/runtime-html/aur0828.md). An unknown trigger throws [AUR0827](../developer-guides/error-messages/runtime-html/aur0827.md), and an element trigger with nothing to watch throws [AUR0826](../developer-guides/error-messages/runtime-html/aur0826.md).
- **Type checking.** With the conventions plugin's experimental template type checking, `$defer` is typed inside the branches and is an error elsewhere, and the bound options of `defer`, such as `when.bind` and `load.bind`, are checked against the view model.

## Rendering on the server

During server-side rendering the triggers don't run, so the server renders the placeholder. When the app hydrates, the block adopts the server's placeholder instead of rendering a new one, and renders its content once its trigger fires in the browser.

## Things to watch out for

- **`<script defer>`** keeps its meaning. The compiler never treats `defer` on a `<script>` as this template controller, and `defer.bind` on a `<script>` binds its native `defer` property.
- **One compile per template.** A block is compiled the first time it renders, and every instance of that block reuses the result, for example inside a `repeat`. All instances should load the same elements.
- **`$parent` in branches.** The branches get a scope of their own so they can see `$defer`, the same as the branches of `promise.bind`. Inside a branch, `$parent` refers to the block's scope, so write `$parent.$parent` where you'd write `$parent` inside an `if`. The content itself uses the surrounding scope directly.
- **`<slot>` inside a block** follows the same rules as the rest of the component's template: it needs shadow DOM.
