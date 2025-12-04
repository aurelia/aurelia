---
description: Learn how to access and manage router state, including current route information, parameters, and navigation tracking.
---

# Router State Management

The Aurelia router provides several services for accessing and managing routing state. This section covers how to track current route information, access parameters, and monitor navigation state throughout your application.

## Current Route Information with `ICurrentRoute`

The `ICurrentRoute` service provides reactive access to the currently active route information. This is essential for components that need to respond to route changes or display route-specific information.

### Basic Usage

```typescript
import { ICurrentRoute } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  private currentRoute = resolve(ICurrentRoute);

  attached() {
    // Access current route properties
    console.log('Current path:', this.currentRoute.path);
    console.log('Current URL:', this.currentRoute.url);
    console.log('Page title:', this.currentRoute.title);
    console.log('Query params:', this.currentRoute.query);
  }
}
```

### Current Route Properties

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | The current route path (e.g., '/products/123') |
| `url` | `string` | The complete URL including query params and fragment |
| `title` | `string` | The current page title |
| `query` | `URLSearchParams` | Query parameters as URLSearchParams object |
| `parameterInformation` | `ParameterInformation[]` | Hierarchical parameter data |

### Working with Route Parameters

The `parameterInformation` property provides detailed parameter information for hierarchical routes:

```typescript
export class ProductComponent {
  private currentRoute = resolve(ICurrentRoute);

  attached() {
    // Access route parameters
    const paramInfo = this.currentRoute.parameterInformation[0];
    if (paramInfo?.params) {
      const productId = paramInfo.params.id;
      console.log('Product ID:', productId);
    }

    // Access nested route parameters
    this.currentRoute.parameterInformation.forEach((info, index) => {
      console.log(`Level ${index} params:`, info.params);
      console.log(`Level ${index} viewport:`, info.viewport);
    });
  }
}
```

### Reactive Route State

The `ICurrentRoute` properties are observable and update automatically when navigation occurs:

```typescript
import { watch } from '@aurelia/runtime';

export class NavigationTracker {
  private currentRoute = resolve(ICurrentRoute);

  @watch('currentRoute.path')
  pathChanged(newPath: string, oldPath: string) {
    console.log(`Route changed from ${oldPath} to ${newPath}`);
    // Update analytics, breadcrumbs, etc.
  }

  @watch('currentRoute.query')
  queryChanged(newQuery: URLSearchParams) {
    // React to query parameter changes
    const searchTerm = newQuery.get('q');
    if (searchTerm) {
      this.performSearch(searchTerm);
    }
  }
}
```

## Router Navigation State

Access the router's navigation state through the `IRouter` service:

```typescript
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NavigationMonitor {
  private router = resolve(IRouter);

  checkNavigationState() {
    // Check if router is currently navigating
    if (this.router.isNavigating) {
      console.log('Navigation in progress...');
    }

    // Access current route tree
    const routeTree = this.router.routeTree;
    console.log('Current route tree:', routeTree);

    // Access current transition
    const currentTransition = this.router.currentTr;
    console.log('Transition ID:', currentTransition.id);
    console.log('Transition trigger:', currentTransition.trigger);
  }
}
```

## Managed History Entries (`AuNavId` and `ManagedState`)

Every time the router writes to the browser history it attaches an `au-nav-id` marker under the exported `AuNavId` constant. The router uses this managed state to detect backward versus forward navigation whenever a future `popstate` or `hashchange` event fires. Because the managed state flows through the router events API, you can read (or extend) it for diagnostics and per-entry state.

### Inspect managed state during navigation

```typescript
import { IRouterEvents, NavigationStartEvent } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NavigationCorrelationService {
  private readonly events = resolve(IRouterEvents);

  public constructor() {
    this.events.subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
      if (event.managedState) {
        console.log('History entry id:', event.managedState['au-nav-id']);
        console.log('Restored filters:', event.managedState['filters']);
      }
    });
  }
}
```

- Programmatic navigations (`router.load`) start with an empty managed state.
- Browser-driven navigations (Back/Forward) reuse whatever was stored in `history.state` and surface it via `NavigationStartEvent.managedState`.
- See [Router events](./router-events.md#leverage-managed-history-state) for additional patterns.

### Persist extra metadata in history entries

You may attach your own keys to the active history entry as long as you keep the `au-nav-id` field intact. A common pattern is to listen for `NavigationEndEvent`, merge your metadata, and call `window.history.replaceState`:

```typescript
import { IRouterEvents, NavigationEndEvent } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class HistoryMetadataService {
  private readonly events = resolve(IRouterEvents);

  public constructor() {
    this.events.subscribe('au:router:navigation-end', (event: NavigationEndEvent) => {
      const currentState = window.history.state ?? {};
      const enhancedState = {
        ...currentState,
        filters: this.captureFilters(),
        updatedAt: Date.now(),
      };
      window.history.replaceState(enhancedState, document.title);
    });
  }

  private captureFilters() {
    // Replace with your own logic (for example grab data from a store or component)
    return { tab: 'inbox' };
  }
}
```

When the user later taps the browser buttons, the router emits a `NavigationStartEvent` whose `managedState` contains the same metadata, allowing you to restore filter selections, scroll positions, or analytics context.

## Navigation Context and Relative Navigation

Use route context for relative navigation and context-aware operations:

```typescript
import { IRouteContext } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class ProductDetail {
  private routeContext = resolve(IRouteContext);
  private router = resolve(IRouter);

  navigateToSibling() {
    // Navigate relative to current context
    return this.router.load('edit', { context: this.routeContext });
  }

  navigateToChild() {
    // Navigate to child route
    return this.router.load('reviews', { context: this.routeContext });
  }

  getRouteData() {
    // Access route configuration data
    const routeData = this.routeContext.data;
    console.log('Route data:', routeData);
  }
}
```

## Query Parameters and Fragments

### Reading Query Parameters

```typescript
export class SearchComponent {
  private currentRoute = resolve(ICurrentRoute);

  attached() {
    // Read query parameters
    const query = this.currentRoute.query;
    const searchTerm = query.get('q');
    const page = parseInt(query.get('page') || '1');
    const filters = query.getAll('filter');

    console.log('Search term:', searchTerm);
    console.log('Page:', page);
    console.log('Filters:', filters);
  }

  // Convert query params to object
  getQueryObject(): Record<string, string | string[]> {
    const query = this.currentRoute.query;
    const result: Record<string, string | string[]> = {};
    
    for (const [key, value] of query.entries()) {
      if (key in result) {
        // Multiple values for same key
        const existing = result[key];
        result[key] = Array.isArray(existing) ? [...existing, value] : [existing as string, value];
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
}
```

### Setting Query Parameters

```typescript
export class FilterComponent {
  private router = resolve(IRouter);
  private currentRoute = resolve(ICurrentRoute);

  applyFilters(filters: string[]) {
    // Navigate with new query parameters
    return this.router.load(this.currentRoute.path, {
      queryParams: {
        filter: filters,
        page: '1'
      }
    });
  }

  updateSearchTerm(term: string) {
    // Update single query parameter
    const currentQuery = this.currentRoute.query;
    const newParams = new URLSearchParams(currentQuery);
    newParams.set('q', term);
    
    return this.router.load(this.currentRoute.path, {
      queryParams: Object.fromEntries(newParams)
    });
  }
}
```

## Route State in Templates

Access current route information directly in templates:

```html
<!-- Display current route information -->
<div class="route-info">
  <h1>${currentRoute.title}</h1>
  <p>Path: ${currentRoute.path}</p>
  <p>Query: ${currentRoute.query.toString()}</p>
</div>

<!-- Conditional rendering based on route -->
<div if.bind="currentRoute.path.startsWith('/admin')">
  <admin-sidebar></admin-sidebar>
</div>

<!-- Access route parameters -->
<div repeat.for="paramInfo of currentRoute.parameterInformation">
  <h3>Level ${$index} Parameters:</h3>
  <ul>
    <li repeat.for="[key, value] of paramInfo.params | entries">
      ${key}: ${value}
    </li>
  </ul>
</div>
```

## Best Practices

### 1. Use Reactive Patterns
Always prefer watching route changes over manually checking route state:

```typescript
// ✅ Good - Reactive approach
@watch('currentRoute.parameterInformation')
paramsChanged(newParams: ParameterInformation[]) {
  this.loadData();
}

// ❌ Avoid - Manual polling
setInterval(() => {
  const params = this.currentRoute.parameterInformation;
  // Check for changes manually
}, 1000);
```

### 2. Handle Missing Parameters
Always handle cases where route parameters might not exist:

```typescript
getProductId(): string | null {
  const paramInfo = this.currentRoute.parameterInformation[0];
  return paramInfo?.params?.id ?? null;
}
```

### 3. Cleanup Subscriptions
When manually subscribing to route changes, ensure proper cleanup:

```typescript
export class ComponentWithSubscription {
  private routeSubscription?: IDisposable;

  attached() {
    this.routeSubscription = this.routerEvents.subscribe(
      'au:router:navigation-end',
      () => this.handleNavigation()
    );
  }

  detached() {
    this.routeSubscription?.dispose();
  }
}
```

## Preserve Scroll Positions with `IStateManager`

The router ships an `IStateManager` service that captures scroll offsets for every descendant element inside a routed component. Pair it with lifecycle hooks to remember where the user left off when they revisit the same view.

### Component-level usage

```typescript
import { IRouteViewModel, IStateManager } from '@aurelia/router';
import { ICustomElementController } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export class ArticleList implements IRouteViewModel {
  private readonly controller = resolve(ICustomElementController);
  private readonly stateManager = resolve(IStateManager);

  canUnload() {
    this.stateManager.saveState(this.controller);
    return true;
  }

  loading() {
    this.stateManager.restoreState(this.controller);
  }
}
```

- `saveState` walks the DOM tree and records scroll positions for elements that have been scrolled.
- `restoreState` replays those offsets the next time the component loads.
- The data is stored in a `WeakMap`, so it is automatically released when the component is destroyed.

### Share scroll persistence across multiple routes

Router hooks run outside the component's own dependency injection scope, so they cannot access an `ICustomElementController` automatically. Instead, place the scroll logic in a shared base class (or mixin) that each routed component can extend. That way every component still resolves its own controller, but the implementation lives in one place.

```typescript
import { IRouteViewModel, IStateManager } from '@aurelia/router';
import { ICustomElementController } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export abstract class ScrollAwareRoute implements IRouteViewModel {
  protected readonly controller = resolve(ICustomElementController);
  protected readonly stateManager = resolve(IStateManager);

  canUnload() {
    this.stateManager.saveState(this.controller);
    return true;
  }

  loading() {
    this.stateManager.restoreState(this.controller);
  }
}

export class ArticleList extends ScrollAwareRoute {}
export class ArticleDetail extends ScrollAwareRoute {}
```

Any routed view-model that extends `ScrollAwareRoute` automatically persists scroll positions without hand-copying the logic.

This enhanced router state management documentation provides developers with comprehensive guidance on accessing and managing routing state, filling a critical gap in the current documentation.
