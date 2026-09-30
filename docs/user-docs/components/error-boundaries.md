---
description: >-
  Contain component activation failures inside an error-boundary element, render fallback UI, and report caught framework errors to a central IErrorHandler.
---

# Error boundaries

Wrap part of a template in `<error-boundary>` to contain failures inside that subtree. When a component inside the boundary throws while it's being constructed, or throws or rejects while it's being activated, the boundary tears the failed content down, renders fallback UI in its place, and lets the rest of the app keep running. Without a boundary, a component that throws during startup rejects `Aurelia.start()`; with one, startup resolves and the fallback is on screen.

`<error-boundary>` is a built-in resource. It doesn't need to be registered or imported.

## Basic usage

The element's own content is the default slot. An optional `au-slot="fallback"` template is what renders after a failure:

```html
<error-boundary>
  <user-profile user-id.bind="userId"></user-profile>

  <template au-slot="fallback">
    <p>We couldn't load this profile.</p>
  </template>
</error-boundary>
```

If `<user-profile>` activates normally, the fallback never runs. If anything inside the boundary fails during activation, the boundary removes the failed content and renders the fallback instead. A throwing constructor or `created` hook, a failure in a synchronous hook (`binding`, `attaching`), an async hook, or a failed activation of a view that a template controller (`if`, `repeat`, `switch`, `au-compose`, `promise`, `portal`) swaps in after startup all reach the boundary the same way.

A boundary that catches an error during startup doesn't hold up the rest of the tree. Siblings activate normally, and `Aurelia.start()` resolves with the fallback in place.

With no `fallback` slot, the boundary renders nothing after a failure. The error is still reported to [`IErrorHandler`](#report-errors-with-ierrorhandler).

## Reading the error in the fallback

Inside the fallback, `$host` is the boundary's view model (the same convention as `au-slot` projection). The captured error is on `$host.error`:

```html
<template au-slot="fallback">
  <p>We couldn't load this profile: ${$host.error.message}</p>
</template>
```

`error` is also a `from-view` bindable, so a parent can react to it directly:

```html
<error-boundary error.from-view="widgetError">
  <my-widget></my-widget>
</error-boundary>
```

```typescript
export class MyApp {
  widgetError: unknown = null;
}
```

`widgetError` receives the error when the boundary catches it, and `null` after a successful reset.

## Recovering with reset() and reset-key

`reset()` on the boundary throws the failed content away and builds it again from scratch with fresh component instances. It doesn't try to reactivate the old ones. Call it from the fallback, or from anywhere you hold a reference to the boundary:

```html
<template au-slot="fallback">
  <p>We couldn't load this profile: ${$host.error.message}</p>
  <button click.trigger="$host.reset()">Try again</button>
</template>
```

If the rebuilt content fails again, the boundary shows the fallback again.

`reset-key.bind` covers the "the user moved on to a different record" case without extra code. When the bound value changes while the fallback is showing, the boundary resets itself:

```html
<error-boundary reset-key.bind="userId">
  <user-profile user-id.bind="userId"></user-profile>

  <template au-slot="fallback">
    <p>We couldn't load this profile.</p>
  </template>
</error-boundary>
```

Changing `reset-key` while the normal content is showing does nothing.

## Nesting boundaries

Boundaries can nest, and an error goes to the nearest enclosing one. If a boundary's own fallback fails while activating, that error goes to the next boundary up:

```html
<error-boundary>
  <template au-slot="fallback">
    <p>This whole section is unavailable.</p>
  </template>

  <error-boundary>
    <template au-slot="fallback">
      <p>This widget failed.</p>
    </template>
    <my-widget></my-widget>
  </error-boundary>
</error-boundary>
```

A failure inside `<my-widget>` shows the inner fallback and leaves the outer boundary's other content alone.

## What a boundary does not catch

Boundaries only cover view creation and activation. The following report to `IErrorHandler` (with `handled` set to `false`) but keep their normal behavior:

- **Event handlers.** An error in `click.trigger` and friends travels through the listener's `onError` option, which dispatches `au-event-error` on `window` and rethrows unless the event is cancelled. Keep handler bodies safe, or register your own `IListenerBindingOptions` (from `@aurelia/runtime-html`) to replace that `onError` behavior. The error still reaches `IErrorHandler` first either way.
- **Binding re-evaluation and queued tasks.** A binding that throws inside its own queued update (a value converter that throws while an interpolation refreshes, for example) is reported to `IErrorHandler` with phase `'task'`, then the queue logs it with `console.error` and the DOM keeps the previous value. Errors from computed getters are one exception right now: they re-evaluate inside the computed observer's own queued task in `@aurelia/runtime`, so they reach `console.error` through the task queue but aren't delivered to `IErrorHandler` yet.
- **App tasks.** A throwing or rejecting `AppTask` is reported with phase `'task'` and `controller` set to `null`, then still rejects `Aurelia.start()` or `stop()`.
- **Router navigation.** A component that fails during navigation is handled by the router's own recovery (`restorePreviousRouteTreeOnError`, fallback routes). A boundary inside a routed component still covers that component's subtree.
- **SSR.** Server-side fallback rendering and hydration of fallbacks aren't covered yet.

Branch views that `if`, `switch` and `promise` first create after startup are a gap for now: their components are constructed before the swap's error routing starts, so a throwing constructor or `created` hook there escapes to whatever triggered the swap instead of reaching the boundary. Activation failures in those branches are caught, and the boundary's own content is covered from construction onwards.

Deactivation is different from activation: `detaching`/`unbinding` errors outside a boundary still reject `au.stop()`. Only the teardown a boundary performs on its own failed content is reported and ignored, so a bad teardown hook can't leave the fallback unmounted.

## Report errors with IErrorHandler

`IErrorHandler` is an app-level hook that receives the errors the framework catches, whether or not a boundary handled them: lifecycle hooks and component creation (including the root component during `Aurelia.app()` and `start()`), template controller swaps, queued binding and watcher updates, app tasks, and event listeners. Computed getter errors are the known exception listed above. Register it once on the app container:

```typescript
import { Aurelia, IErrorHandler, type ErrorInfo } from 'aurelia';
import { Registration } from '@aurelia/kernel';

const au = new Aurelia().register(
  Registration.instance(IErrorHandler, {
    handleError(error: unknown, info: ErrorInfo) {
      Sentry.captureException(error, {
        tags: { phase: info.phase, handled: String(info.handled) },
        extra: { component: info.controller?.definition?.name },
      });
    },
  }),
);
```

Each call receives the error and an `ErrorInfo`:

```typescript
interface ErrorInfo {
  /** Where the error came from. */
  phase: 'binding' | 'bound' | 'attaching' | 'attached' | 'detaching' | 'unbinding' | 'event' | 'task';
  /** The controller the error was thrown in, when known. */
  controller: IController | null;
  /** True when an error boundary caught it. */
  handled: boolean;
}
```

`phase` tells you which channel reported the error. Lifecycle hooks report their own phase, queued binding and watcher work and app tasks report `'task'`, and event listeners report `'event'`. `handled` is `true` when a boundary caught the error (including teardown errors it absorbed while failing over) and `false` otherwise.

Registering a handler doesn't change the default behavior for errors no boundary caught. Activation failures still reject `Aurelia.start()`, deactivation failures still reject `au.stop()`, task errors still go to `console.error`, and listener errors still dispatch `au-event-error`. A handler that throws doesn't break the framework: the handler's own error is logged with `console.error` and whatever was in progress continues.
