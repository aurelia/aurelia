---
description: Access information about the active route via ICurrentRoute.
---

# Current route

`ICurrentRoute` is a dependency injection token that exposes details of the route that is currently active. The instance is updated whenever navigation finishes so that you can inspect the active path, URL and query information from any component or service.

`ICurrentRoute` has the following shape:

```ts
interface ICurrentRoute {
  readonly path: string;
  readonly url: string;
  readonly title: string;
  readonly query: URLSearchParams;
  readonly parameterInformation: readonly ParameterInformation[];
}

interface ParameterInformation {
  readonly config: RouteConfig | null;
  readonly viewport: string | null;
  readonly params: Readonly<Params> | null;
  readonly children: readonly ParameterInformation[];
}
```

To use it, inject the token and read its properties:

```ts
import { ICurrentRoute } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyApp {
  private readonly currentRoute = resolve(ICurrentRoute);

  // ⚠️ Note: accessing in lifecycle hooks shows previous route
  // See "Timing Considerations" below for proper solutions
}
```

## Timing Considerations

**Important:** `ICurrentRoute` is updated by the router **after** navigation completes, which happens after **all** component lifecycle hooks complete. This means:

- ❌ **Avoid in lifecycle hooks** - `binding()`, `bound()`, `attaching()`, and `attached()` all show previous route information  
- ✅ **Use router events instead** - Subscribe to `au:router:navigation-end` for immediate access

### Component Lifecycle vs Router Timing

The exact sequence is:
1. `binding()` hook → **previous route**
2. `bound()` hook → **previous route**  
3. `attaching()` hook → **previous route**
4. `attached()` hook → **previous route**
5. `au:router:navigation-end` event fires → **current route updated**

### Incorrect Timing Examples

```ts
// ❌ All lifecycle hooks show the previous route, not the current one
export class AboutPage {
  private readonly currentRoute = resolve(ICurrentRoute);

  bound() {
    // Shows previous route due to timing
    console.log('Active path:', this.currentRoute.path);
  }

  attached() {
    // Also shows previous route due to timing
    console.log('Active path:', this.currentRoute.path);
  }
}
```

### Correct Timing Solutions

**Option 1: Use `navigation-start` event (Recommended)**

```ts
import { IRouterEvents, NavigationStartEvent, IRouter } from '@aurelia/router';
import { IDisposable } from '@aurelia/kernel';
import { resolve } from '@aurelia/kernel';

export class AboutPage implements IDisposable {
  private readonly subscription: IDisposable;

  constructor() {
    const events = resolve(IRouterEvents);
    const router = resolve(IRouter);
    
    this.subscription = events.subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
      // Access route information immediately from the event
      console.log('Navigating to path:', event.instructions.toPath());
      console.log('Navigating to URL:', event.instructions.toUrl(false, router.options._urlParser));
      console.log('Navigation ID:', event.id);
      console.log('Trigger:', event.trigger);
    });
  }

  dispose(): void {
    this.subscription?.dispose();
  }
}
```

**Option 2: Use `navigation-end` event**

```ts
import { IRouterEvents, NavigationEndEvent } from '@aurelia/router';
import { IDisposable } from '@aurelia/kernel';
import { resolve } from '@aurelia/kernel';

export class AboutPage implements IDisposable {
  private readonly currentRoute = resolve(ICurrentRoute);
  private readonly subscription: IDisposable;

  constructor() {
    const events = resolve(IRouterEvents);
    this.subscription = events.subscribe('au:router:navigation-end', (event: NavigationEndEvent) => {
      // ICurrentRoute is now updated and can be used
      console.log('Navigation completed to:', this.currentRoute.path);
      console.log('Current URL:', this.currentRoute.url);
    });
  }

  dispose(): void {
    this.subscription?.dispose();
  }
}
```

**Option 3: Use `setTimeout` as a workaround (Not recommended)**

```ts
// ⚠️ Workaround only - prefer Option 1 above
export class AboutPage {
  private readonly currentRoute = resolve(ICurrentRoute);

  attached() {
    // Force execution after navigation completes
    setTimeout(() => {
      console.log('Active path:', this.currentRoute.path);
      console.log('Active url:', this.currentRoute.url);
    }, 0);
  }
}
```

**Option 4: Access current route outside of lifecycle hooks**

```ts
export class AboutPage {
  private readonly currentRoute = resolve(ICurrentRoute);

  // ✅ Works correctly when called after navigation
  public getCurrentRoute(): string {
    return this.currentRoute.path;
  }

  // ✅ Works correctly in event handlers
  onButtonClick(): void {
    console.log('Current path:', this.currentRoute.path);
  }
}
```

The `parameterInformation` array mirrors the hierarchy of viewport instructions of the current navigation. It allows you to inspect route parameters and nested routes programmatically.
