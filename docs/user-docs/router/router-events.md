---
description: >-
  Learn about how to subscribe to and handle router events for advanced navigation monitoring and application state management.
---

# Router events

You can use the lifecycle hooks ([instance](./routing-lifecycle.md) and [shared](./router-hooks.md)) to intercept different stages of the navigation when you are working with the routed components directly.
However, if you want to tap into different navigation phases from a non-routed component, such as standalone service or a simple custom element, then you need to leverage router events.
This section discusses that.

## Router Event Types Overview

Five router events expose transition progress and browser-location changes:

| Event | When Emitted | Use Cases |
|-------|-------------|-----------|
| `au:router:location-change` | Browser Back/Forward or a hash change | Observe browser-driven navigation |
| `au:router:navigation-start` | A transition begins | Show loading states and correlate diagnostic logs |
| `au:router:navigation-end` | Navigation completes successfully | Hide loading states, update breadcrumbs, analytics |
| `au:router:navigation-cancel` | A transition is canceled, including guard redirects or restoration after an error | Observe cancellation and clear pending UI |
| `au:router:navigation-error` | A transition reports an error | Record diagnostic context and display an error state |

The diagnostic examples below serialize instruction trees with the exported `pathUrlParser`. That representation includes application path, query, and fragment; it omits deployment and physical-document publication. Use `router.createHref()` when you need a browser href from an application reference. The private `RouterOptions._urlParser` field is not a public configuration API.

## Event Details and Properties

### `LocationChangeEvent`
Triggered when the browser location changes through user navigation (back/forward buttons) or hash changes.

```typescript
interface LocationChangeEvent {
  readonly id: number;           // Location-event ID (separate from transition IDs)
  readonly url: string;          // Location-manager URL
  readonly trigger: 'popstate' | 'hashchange';  // What caused the change
  readonly state: {} | null;     // Browser history state
}
```

### `NavigationStartEvent`
Emitted when a transition begins. Event subscribers observe navigation; their return values do not cancel it. Use `canLoad` or `canUnload` guards to decide whether navigation may proceed. Input validation can fail before a transition starts, so callers must also handle errors from the navigation call itself.

```typescript
interface NavigationStartEvent {
  readonly id: number;                    // Unique navigation ID
  readonly instructions: ViewportInstructionTree;  // Where we're navigating
  readonly trigger: 'popstate' | 'hashchange' | 'api';  // What triggered navigation
  readonly managedState: ManagedState | null;     // Router-managed state
}
```

### `NavigationEndEvent`  
Fired when navigation completes successfully, providing final instruction details.

```typescript
interface NavigationEndEvent {
  readonly id: number;                    // Unique navigation ID
  readonly instructions: ViewportInstructionTree;      // Original instructions
  readonly finalInstructions: ViewportInstructionTree; // Final resolved instructions
}
```

### `NavigationCancelEvent`
Emitted when the current transition is canceled. This includes guard cancellation, the canceled leg of a guard redirect, and route-tree restoration after an error. The `reason` is diagnostic information; do not parse its wording to determine an application permission decision.

```typescript
interface NavigationCancelEvent {
  readonly id: number;                    // Unique navigation ID
  readonly instructions: ViewportInstructionTree;  // Attempted instructions
  readonly reason: unknown;               // Cancellation reason
}
```

### `NavigationErrorEvent`
Emitted for transition errors reported through the event stream. It is not an exhaustive error boundary: invalid input can fail before a transition starts, and unknown-route failures can reject a navigation without emitting this event. Handle the navigation call itself as described in [error handling](./error-handling.md).

```typescript
interface NavigationErrorEvent {
  readonly id: number;                    // Unique navigation ID
  readonly instructions: ViewportInstructionTree;  // Failed instructions
  readonly error: unknown;                // The error that occurred
}
```

## Subscribing to Router Events

You can subscribe to router events in two ways: using the event aggregator or the type-safe `IRouterEvents` service (recommended).

### Type-Safe Event Subscription with `IRouterEvents`

The recommended approach uses `IRouterEvents` for compile-time type safety and better developer experience:

```typescript
import {
  IRouterEvents,
  LocationChangeEvent,
  NavigationStartEvent,
  NavigationEndEvent,
  NavigationCancelEvent,
  NavigationErrorEvent,
} from '@aurelia/router';
import { IDisposable, resolve } from '@aurelia/kernel';

export class NavigationService implements IDisposable {
  private readonly subscriptions: IDisposable[] = [];
  private currentNavigationId: number | null = null;

  public constructor() {
    const events = resolve(IRouterEvents);

    this.subscriptions = [
      // Track location changes from browser navigation
      events.subscribe('au:router:location-change', (event: LocationChangeEvent) => {
        console.log(`Location changed: ${event.url} via ${event.trigger}`);
        this.handleLocationChange(event);
      }),

      // Prepare for navigation start
      events.subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
        this.currentNavigationId = event.id;
        console.log(`Navigation #${event.id} starting to: ${event.instructions}`);
        this.handleNavigationStart(event);
      }),

      // Handle successful navigation completion
      events.subscribe('au:router:navigation-end', (event: NavigationEndEvent) => {
        console.log(`Navigation #${event.id} completed successfully`);
        this.handleNavigationEnd(event);
        this.currentNavigationId = null;
      }),

      // Handle cancelled navigation
      events.subscribe('au:router:navigation-cancel', (event: NavigationCancelEvent) => {
        console.warn(`Navigation #${event.id} cancelled:`, event.reason);
        this.handleNavigationCancel(event);
        this.currentNavigationId = null;
      }),

      // Handle navigation errors
      events.subscribe('au:router:navigation-error', (event: NavigationErrorEvent) => {
        console.error(`Navigation #${event.id} failed:`, event.error);
        this.handleNavigationError(event);
        this.currentNavigationId = null;
      }),
    ];
  }

  private handleLocationChange(event: LocationChangeEvent): void {
    // Update analytics, breadcrumbs, etc.
  }

  private handleNavigationStart(event: NavigationStartEvent): void {
    // Show loading indicators, prepare UI state
  }

  private handleNavigationEnd(event: NavigationEndEvent): void {
    // Hide loading indicators, update UI state
  }

  private handleNavigationCancel(event: NavigationCancelEvent): void {
    // Show user feedback, restore previous state
  }

  private handleNavigationError(event: NavigationErrorEvent): void {
    // Show error messages and log diagnostic context
  }

  public dispose(): void {
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions.length = 0;
  }
}
```

### Alternative: Event Aggregator Subscription

You can also use the standard event aggregator, though you lose TypeScript type safety:

```typescript
import { IEventAggregator, resolve, type IDisposable } from '@aurelia/kernel';

export class BasicNavigationService implements IDisposable {
  private readonly subscription = resolve(IEventAggregator).subscribe(
    'au:router:navigation-start',
    (event: unknown) => {
      // The string channel does not infer a router event type.
      console.log(event);
    },
  );

  dispose(): void {
    this.subscription.dispose();
  }
}
```

Use `IRouterEvents` for typed callbacks. Instantiate application-wide services during startup so they can observe initial navigation, and call their `dispose()` methods from the application owner when shutting down. Registering a service alone does not instantiate it.

## Practical Use Cases and Examples

### Leverage managed history state

The router adds an `au-nav-id` field (exported as `AuNavId`) to the browser history entries it publishes. Custom `state` supplied to `load()` or `navigate()` travels with the transition, including guard redirects, and is stored with the successful history entry.

#### Read managed state when navigation starts

```typescript
import { AuNavId, IRouterEvents } from '@aurelia/router';
import { resolve, type IDisposable } from '@aurelia/kernel';

export class NavigationStateLogger implements IDisposable {
  private readonly subscription = resolve(IRouterEvents).subscribe(
    'au:router:navigation-start',
    event => {
      if (event.managedState !== null) {
        console.log('Entry id:', event.managedState[AuNavId]);
        console.log('Saved tab:', event.managedState['tab']);
      }
    },
  );

  dispose(): void {
    this.subscription.dispose();
  }
}
```

`managedState` can be `null`. For an API call with an explicit `state` option, it includes that payload; for a browser visit to a router-managed entry, it contains the visited entry's state. A new API navigation does not implicitly copy arbitrary state from the previously displayed entry.

#### Store additional metadata per history entry

Supply state with the navigation that should own it:

```typescript
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class InboxNavigation {
  private readonly router = resolve(IRouter);

  openUnread() {
    return this.router.navigate('/inbox?status=unread', {
      state: { tab: 'unread', openedFrom: 'dashboard' },
    });
  }
}
```

Use URL query parameters for values that must survive sharing a link. History state belongs to that browser entry. With `historyStrategy: 'none'`, the transition still carries its state but does not publish a history entry.

If host code modifies `history.state` directly, preserve the router's `AuNavId` field and existing payload. See [router state management](./router-state-management.md#managed-history-entries-aunavid-and-managedstate) for history-state ownership and restoration.

### Global Loading Indicator

Show a loading spinner during navigation:

```typescript
import { resolve } from '@aurelia/kernel';
import { customElement, observable } from '@aurelia/runtime-html';
import { IRouter, IRouterEvents, NavigationStartEvent, NavigationEndEvent, pathUrlParser } from '@aurelia/router';

@customElement({
  name: 'loading-app',
  template: `
    <div class="app-container">
      <!-- Global loading indicator -->
      <div if.bind="isNavigating" class="loading-overlay">
        <div class="spinner"></div>
        <span>Loading...</span>
      </div>

      <!-- Navigation breadcrumbs -->
      <nav class="breadcrumb" if.bind="breadcrumbs.length">
        <span repeat.for="crumb of breadcrumbs" class="breadcrumb-item">
          \${crumb}
        </span>
      </nav>

      <!-- Main content -->
      <au-viewport></au-viewport>
    </div>
  `
})
export class LoadingApp {
  @observable isNavigating: boolean = false;
  @observable breadcrumbs: string[] = [];
  private readonly router = resolve(IRouter);

  private readonly subscriptions = [
    resolve(IRouterEvents).subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
      this.isNavigating = true;
      console.log(`Starting navigation to: ${event.instructions.toUrl(false, pathUrlParser, true)}`);
    }),

    resolve(IRouterEvents).subscribe('au:router:navigation-end', (event: NavigationEndEvent) => {
      this.isNavigating = false;
      this.updateBreadcrumbs();
      console.log(`Navigation completed: ${event.finalInstructions.toUrl(true, pathUrlParser, true)}`);
    }),

    resolve(IRouterEvents).subscribe('au:router:navigation-cancel', () => {
      this.isNavigating = false;
      console.log('Navigation was cancelled');
    }),

    resolve(IRouterEvents).subscribe('au:router:navigation-error', (event) => {
      this.isNavigating = false;
      this.handleNavigationError(event.error);
    })
  ];

  private updateBreadcrumbs(): void {
    const routeTree = this.router.routeTree;
    const separator = ' › ';
    this.breadcrumbs = routeTree.root.children
      .map(node => {
        const title = node.getTitle(separator);
        const path = node.computeAbsolutePath();
        return title ?? (path.length > 0 ? path : 'Unknown');
      });
  }

  private handleNavigationError(error: unknown): void {
    console.error('Navigation failed:', error);
    // Could show toast notification, redirect to error page, etc.
  }

  dispose(): void {
    this.subscriptions.forEach(sub => sub.dispose());
  }
}
```

### Analytics and Tracking Service

Record page views after successful navigation. Clear timing data when a transition ends, is canceled, or reports an error, so canceled attempts are not counted as page views:

```typescript
import { singleton, resolve, type IDisposable } from '@aurelia/kernel';
import { ICurrentRoute, IRouterEvents, pathUrlParser } from '@aurelia/router';

@singleton
export class AnalyticsService implements IDisposable {
  private readonly currentRoute = resolve(ICurrentRoute);
  private readonly subscriptions: IDisposable[];
  private started: { id: number; time: number } | null = null;

  constructor() {
    const events = resolve(IRouterEvents);
    this.subscriptions = [
      events.subscribe('au:router:navigation-start', event => {
        this.started = { id: event.id, time: performance.now() };
      }),
      events.subscribe('au:router:navigation-end', event => {
        const duration = this.started?.id === event.id
          ? performance.now() - this.started.time
          : undefined;
        this.started = null;
        this.recordPageView({
          path: event.finalInstructions.toUrl(true, pathUrlParser, true),
          title: this.currentRoute.title,
          duration,
        });
      }),
      events.subscribe('au:router:navigation-cancel', () => {
        this.started = null;
      }),
      events.subscribe('au:router:navigation-error', () => {
        this.started = null;
      }),
    ];
  }

  private recordPageView(view: { path: string; title: string; duration?: number }): void {
    // Send this data through your application's analytics adapter.
    console.log('Page view:', view);
  }

  dispose(): void {
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions.length = 0;
    this.started = null;
  }
}
```

This records the completed application route, which can differ from `location.href` after navigation with `historyStrategy: 'none'`. The analytics adapter is an application integration; the example does not assume a global SDK or tracking identifier.

### Error Handling and Recovery Service

Use an event subscriber to record the failure and update a bounded error display. Recovery belongs to the operation that owns the navigation, where the intended destination and application policy are known.

```typescript
import { singleton, resolve, type IDisposable } from '@aurelia/kernel';
import { IRouterEvents, pathUrlParser } from '@aurelia/router';

@singleton
export class NavigationErrorService implements IDisposable {
  lastFailure: { path: string; error: unknown } | null = null;
  private readonly subscriptions: IDisposable[];

  constructor() {
    const events = resolve(IRouterEvents);
    this.subscriptions = [
      events.subscribe('au:router:navigation-error', event => {
        this.lastFailure = {
          path: event.instructions.toUrl(false, pathUrlParser, true),
          error: event.error,
        };
        console.error('Navigation failed:', this.lastFailure);
      }),
    ];
  }

  dismissError(): void {
    this.lastFailure = null;
  }

  dispose(): void {
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions.length = 0;
  }
}
```

Keep the failure visible until the user dismisses it with `dismissError()`, including when the router restores the previous route. This observer does not retry or redirect. Starting another navigation from every error event can create a loop if the recovery destination also fails. Matching exception text is also too fragile to decide whether a failure means “not found” or “not authorized.”

Configure a route fallback for unknown addresses, return redirect instructions from guards for access decisions, and handle `load()` or `navigate()` at the caller with `try`/`catch`. An error observer supplements that handling; it cannot see input failures before a transition starts or every unknown-route rejection. See [error handling](./error-handling.md) for complete caller and recovery patterns.

### Navigation State Management

Track and manage complex navigation states:

```typescript
import { singleton, resolve, type IDisposable } from '@aurelia/kernel';
import { observable } from '@aurelia/runtime';
import { IRouterEvents, NavigationStartEvent, NavigationEndEvent, pathUrlParser } from '@aurelia/router';

interface NavigationHistoryEntry {
  id: number;
  url: string;
  timestamp: number;
  duration?: number;
  trigger: 'api' | 'popstate' | 'hashchange';
}

@singleton
export class NavigationStateService implements IDisposable {
  @observable currentNavigation: NavigationHistoryEntry | null = null;
  @observable navigationHistory: NavigationHistoryEntry[] = [];
  @observable isNavigating: boolean = false;

  private readonly subscriptions: IDisposable[];
  private pendingNavigations = new Map<number, NavigationHistoryEntry>();

  public constructor() {
    const events = resolve(IRouterEvents);

    this.subscriptions = [
      events.subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
        const entry: NavigationHistoryEntry = {
          id: event.id,
          url: event.instructions.toUrl(false, pathUrlParser, true),
          timestamp: Date.now(),
          trigger: event.trigger
        };

        this.pendingNavigations.clear();
        this.pendingNavigations.set(event.id, entry);
        this.currentNavigation = entry;
        this.isNavigating = true;
      }),

      events.subscribe('au:router:navigation-end', (event: NavigationEndEvent) => {
        const entry = this.pendingNavigations.get(event.id);
        if (entry) {
          entry.duration = Date.now() - entry.timestamp;
          entry.url = event.finalInstructions.toUrl(true, pathUrlParser, true); // Use final URL

          this.navigationHistory.push(entry);
          this.pendingNavigations.delete(event.id);

          // Keep only last 50 entries
          if (this.navigationHistory.length > 50) {
            this.navigationHistory.shift();
          }
        }

        this.isNavigating = false;
        this.currentNavigation = null;
      }),

      events.subscribe('au:router:navigation-cancel', (event) => {
        this.pendingNavigations.delete(event.id);
        this.isNavigating = false;
        this.currentNavigation = null;
      }),

      events.subscribe('au:router:navigation-error', (event) => {
        this.pendingNavigations.delete(event.id);
        this.isNavigating = false;
        this.currentNavigation = null;
      }),
    ];
  }

  dispose(): void {
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions.length = 0;
    this.pendingNavigations.clear();
    this.currentNavigation = null;
    this.isNavigating = false;
  }

  public getRecentNavigation(count: number = 10): NavigationHistoryEntry[] {
    return this.navigationHistory.slice(-count);
  }

  public getAverageNavigationTime(): number {
    const withDuration = this.navigationHistory.filter(entry => entry.duration !== undefined);
    if (withDuration.length === 0) return 0;

    const total = withDuration.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return total / withDuration.length;
  }

  public getNavigationStats() {
    return {
      totalNavigations: this.navigationHistory.length,
      averageTime: this.getAverageNavigationTime(),
      currentlyNavigating: this.isNavigating,
      triggerStats: this.getTriggerStats()
    };
  }

  private getTriggerStats() {
    return this.navigationHistory.reduce((stats, entry) => {
      stats[entry.trigger] = (stats[entry.trigger] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
  }
}
```

## Best Practices for Router Events

### Memory Management

Always dispose of event subscriptions to prevent memory leaks:

```typescript
import { IDisposable, resolve } from '@aurelia/kernel';
import { IRouterEvents } from '@aurelia/router';

export class Component implements IDisposable {
  private readonly subscriptions: IDisposable[] = [];

  constructor() {
    const events = resolve(IRouterEvents);

    this.subscriptions.push(
      events.subscribe('au:router:navigation-start', (event) => {
        // Handle event
      })
    );
  }

  dispose(): void {
    this.subscriptions.forEach(sub => sub.dispose());
    this.subscriptions.length = 0;
  }
}
```

### Performance Considerations

1. **Debounce expensive operations** in event handlers
2. **Use singleton services** for global event handlers
3. **Unsubscribe** when components are disposed
4. **Avoid heavy computations** in event handlers

### Error Handling in Event Handlers

Always handle errors in event subscribers:

```typescript
events.subscribe('au:router:navigation-end', (event) => {
  try {
    // Your event handling logic
    this.updateUI(event);
  } catch (error) {
    console.error('Error in navigation-end handler:', error);
    // Don't let handler errors break navigation
  }
});
```

### Debugging Router Events

Instantiate a diagnostic service during development when you need a correlated record of transitions:

```typescript
import { resolve, type IDisposable } from '@aurelia/kernel';
import { IRouterEvents, pathUrlParser } from '@aurelia/router';

export class RouterDebugService implements IDisposable {
  private readonly subscriptions: IDisposable[];

  constructor() {
    const events = resolve(IRouterEvents);
    this.subscriptions = [
      events.subscribe('au:router:location-change', event => {
        console.log('Browser location:', event.url, event.trigger, event.state);
      }),
      events.subscribe('au:router:navigation-start', event => {
        console.log(`Navigation #${event.id} started:`, event.instructions.toString());
      }),
      events.subscribe('au:router:navigation-end', event => {
        console.log(`Navigation #${event.id} completed:`,
          event.finalInstructions.toUrl(true, pathUrlParser, true));
      }),
      events.subscribe('au:router:navigation-cancel', event => {
        console.log(`Navigation #${event.id} canceled:`, event.reason);
      }),
      events.subscribe('au:router:navigation-error', event => {
        console.error(`Navigation #${event.id} failed:`, event.error);
      }),
    ];
  }

  dispose(): void {
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions.length = 0;
  }
}
```

## Using Current Route for Simple Cases

For simple scenarios where you only need current route information without complex event handling, use `ICurrentRoute`:

```typescript
import { resolve } from '@aurelia/kernel';
import { ICurrentRoute } from '@aurelia/router';

export class SimpleComponent {
  private readonly currentRoute: ICurrentRoute = resolve(ICurrentRoute);

  get currentPath(): string {
    return this.currentRoute.path;
  }

  get currentUrl(): string {
    return this.currentRoute.url;
  }

  get routeTitle(): string {
    return this.currentRoute.title;
  }
}
```

See [Current route](./current-route.md) for detailed information about the `ICurrentRoute` service.
