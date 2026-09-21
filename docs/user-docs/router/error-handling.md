---
description: Handle rejected navigation, guard cancellation, route restoration, and retry without losing the original destination.
---

# Router Error Handling

A canceled navigation and a failed navigation need different responses. A guard may deliberately keep an editor open; a failed data request may warrant a retry; an invalid destination needs correction. Handle the outcome where the application knows what the user was trying to do, and use router events for shared reporting.

## Handle the call and its result

Both contextual `load()` and application-URL `navigate()` report a guard cancellation with `false`. Failures can reject the returned promise, and input validation can throw before the navigation is queued. Put the call inside `try`, then await its result:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class ReportLauncher {
  private readonly router = resolve(IRouter);
  error = '';

  async openReports() {
    this.error = '';
    try {
      const completed = await this.router.navigate('/reports');
      if (!completed) return; // Respect a guard's decision to stay.
    } catch (error) {
      this.error = 'The report could not be opened. Please try again.';
      console.error('Opening report failed', error);
    }
  }
}
```

Do not turn `false` into `window.location.assign(...)` or automatically navigate to an error page. That would bypass the decision to stay, including an unsaved-changes guard.

| Outcome | What the application can do |
| --- | --- |
| Guard returns `false` | Keep the current view; show any explanation where the guard's decision is made. |
| Guard returns a navigation instruction | Let the router perform the redirect. |
| Invalid application reference, such as a full URL passed to `navigate()` | Correct the input or use a native document link. This can fail before navigation events begin. |
| Unknown route | Check route configuration and context; configure a fallback when unknown addresses should show a not-found page. |
| Component import, lifecycle, or data-loading failure | Report the failure and offer recovery appropriate to the failed operation. |

## Redirect from a guard

Return the destination from `canLoad` rather than starting a second navigation from inside it. This example assumes the application's `AuthService.ensureSession()` waits for its initial session check:

```typescript
import { resolve } from '@aurelia/kernel';
import type { IRouteViewModel, NavigationInstruction } from '@aurelia/router';
import { AuthService } from './auth-service';

export class ProtectedPage implements IRouteViewModel {
  private readonly auth = resolve(AuthService);

  async canLoad(): Promise<boolean | NavigationInstruction> {
    await this.auth.ensureSession();
    return this.auth.isAuthenticated ? true : '/login';
  }
}
```

The `login` route must exist at the application routing root and allow unauthenticated access. If the session check itself fails, let that failure follow the application's error policy; a network error does not establish that the user is signed out. See the [authentication recipe](outcome-recipes.md#global-authentication-guard) for a shared guard.

## Observe transition failures

Use `IRouterEvents` in an application shell or reporting service to observe transitions that emit `au:router:navigation-error`. The event carries the navigation ID, attempted instructions, and error:

```typescript
import { resolve, type IDisposable } from '@aurelia/kernel';
import { IRouterEvents } from '@aurelia/router';

export class MyApp {
  private readonly events = resolve(IRouterEvents);
  private subscription: IDisposable | undefined;
  navigationError = '';

  binding() {
    this.subscription = this.events.subscribe('au:router:navigation-error', event => {
      this.navigationError = 'Navigation failed. You can retry from the current page.';
      console.error('Navigation failed', {
        id: event.id,
        instructions: event.instructions,
        error: event.error,
      });
    });
  }

  dismissError() {
    this.navigationError = '';
  }

  unbinding() {
    this.subscription?.dispose();
    this.subscription = undefined;
  }
}
```

```html
<div if.bind="navigationError" role="alert">
  ${navigationError}
  <button type="button" click.trigger="dismissError()">Dismiss</button>
</div>
<au-viewport></au-viewport>
```

This event is not an error boundary for every possible navigation call. Input errors can occur before enqueueing. Unknown-route failures follow the router's cancellation/restoration path and do not emit `navigation-error`; programmatic callers still receive the rejection. A `navigation-cancel` event can also accompany recovery or a guard redirect, so it is not by itself evidence that the user refused navigation.

Avoid unconditionally starting another navigation from an error subscriber. The router may be restoring the previous route, and a failing error page can create a recovery loop. A shell-level message remains available even when the destination component never reaches the screen.

## What route restoration restores

`restorePreviousRouteTreeOnError` defaults to `true`:

```typescript
RouterConfiguration.customize({
  restorePreviousRouteTreeOnError: true,
});
```

When a transition fails after a previous successful navigation, the router can restore the previous route tree and reactivate the previous route. The original request still reports its error, and recovery can run lifecycle hooks again. At startup there may be no previous page to restore.

This recovery concerns routing state. It cannot undo an HTTP mutation, restore arbitrary service state changed by a hook, or guarantee the same component instances and local UI state. Put irreversible work in explicit application operations rather than relying on route recovery as a transaction rollback.

Setting the option to `false` disables automatic recovery for ordinary transition errors. It does not make errors more strictly validated, and the router still maintains internal state for later navigation. Unknown-route failures have their own restoration behavior. Change this setting only when your application owns the resulting recovery experience.

## Retain the request for retry

A route path alone is not the original navigation request. Rebuilding a retry from `event.instructions.toPath()`, `next.path`, or `ICurrentRoute.path` can lose query data, a fragment, viewport instructions, or the context from which the destination was selected.

Keep the requested destination and options where the operation starts. This layout opens a configured `product-detail` child route and offers retry from the same context:

```typescript
import { resolve } from '@aurelia/kernel';
import { IContextRouter, type INavigationOptions, type IViewportInstruction } from '@aurelia/router';

export class ProductBrowser {
  private readonly router = resolve(IContextRouter);
  private retryRequest: (() => Promise<boolean>) | undefined;
  error = '';
  pending = false;

  async openProduct(id: string, tab: string) {
    if (this.pending) return;

    const target: IViewportInstruction = {
      component: 'product-detail',
      params: { id },
    };
    const options: INavigationOptions = {
      queryParams: { tab },
      fragment: 'summary',
    };

    // Fresh objects capture this request rather than a mutable form model.
    this.retryRequest = async () => this.router.load(target, options);
    await this.retry();
  }

  async retry() {
    const request = this.retryRequest;
    if (request === undefined || this.pending) return;

    this.pending = true;
    this.error = '';
    try {
      await request();
      this.retryRequest = undefined; // Success or intentional cancellation.
    } catch (error) {
      this.error = 'The product could not be opened. Try again when the connection is available.';
      console.error(error);
    } finally {
      this.pending = false;
    }
  }

  unbinding() {
    this.retryRequest = undefined;
  }
}
```

The retry UI belongs to the layout that remains present around its child viewport. Discard that contextual request when its owner leaves. For application-URL navigation, retain a root-relative application reference such as `/products/42?tab=reviews#summary`; retrying relative text after another successful navigation would resolve it against a different base.

```html
<div if.bind="error" role="alert">
  ${error}
  <button type="button" disabled.bind="pending" click.trigger="retry()">Retry</button>
</div>
<au-viewport></au-viewport>
```

Offer retry for recoverable failures. Automatically repeating every failed navigation also repeats lifecycle work, and will not fix an invalid route or missing registration. Retry a transient fetch in the data service when that is the actual operation that failed.

## Let a destination show its own error

Sometimes the intended page is useful even when one request fails. Catch that failure within the page and let `loading` finish normally so the page can render its error and retry controls:

```typescript
import type { IRouteViewModel, Params } from '@aurelia/router';

interface Product {
  id: string;
  name: string;
}

export class ProductDetail implements IRouteViewModel {
  private id = '';
  product: Product | null = null;
  error = '';
  pending = false;

  loading(params: Params) {
    this.id = params.id ?? '';
    return this.refresh();
  }

  async refresh() {
    if (this.pending) return;
    this.pending = true;
    this.error = '';
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(this.id)}`);
      if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
      this.product = await response.json() as Product;
    } catch (error) {
      this.product = null;
      this.error = 'The product is currently unavailable.';
      console.error(error);
    } finally {
      this.pending = false;
    }
  }
}
```

```html
<p if.bind="error" role="alert">${error}</p>
<button if.bind="error" type="button" disabled.bind="pending" click.trigger="refresh()">
  Retry
</button>
<h1 if.bind="product">${product.name}</h1>
```

This example uses the normal replacement behavior for different product IDs. If you configure component reuse and allow overlapping requests, also protect the page from stale responses.

If the page must not open without the data, let the error propagate instead and show feedback in the shell or caller. Setting an error property on a destination that fails before activation does not make its error template visible. See [Data preloading](outcome-recipes.md#data-preloading).

## Use a fallback for unknown addresses

Configure a fallback in the route context that owns the unknown address:

```typescript
import { route } from '@aurelia/router';
import { Home } from './home';
import { NotFound } from './not-found';

@route({
  routes: [
    { path: '', component: Home },
    { path: 'not-found', component: NotFound },
  ],
  fallback: 'not-found',
})
export class MyApp {}
```

A fallback handles an unrecognized route. It does not catch a rejected import or an exception from a recognized page's lifecycle hook. See [Fallbacks](configuring-routes.md) and [Router events](router-events.md) for the corresponding contracts.
