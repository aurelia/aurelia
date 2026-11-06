---
description: >-
  Subscribe to router events to show loading progress, record page views, and report failed navigation.
---

# Router events

Router events let an application shell or service follow navigation from start to finish. Use them to show a loading indicator, record a page view after successful navigation, or report an error. To control whether a routed component can open or close, use lifecycle hooks ([instance](./routing-lifecycle.md) or [shared](./router-hooks.md)).

## Router Event Types Overview

Five router events expose transition progress and browser-location changes:

| Event | When Emitted | Use Cases |
|-------|-------------|-----------|
| `au:router:location-change` | Browser Back/Forward or a hash change | Observe browser-driven navigation |
| `au:router:navigation-start` | A transition begins | Show a loading indicator and log the attempted destination |
| `au:router:navigation-end` | Navigation completes successfully | Hide the loading indicator, update breadcrumbs, and record a page view |
| `au:router:navigation-cancel` | A transition is canceled, including guard redirects or restoration after an error | Observe cancellation and clear pending UI |
| `au:router:navigation-error` | A transition reports an error | Log the failed navigation and show an error message |

The logging examples below use the exported `pathUrlParser` to serialize instruction trees. Its output includes the application path, query, and fragment. For a browser link, use `router.createHref()` with an application reference to add the deployment base path and hash-routing details. The private `RouterOptions._urlParser` field is not a public configuration API.

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
Emitted when the current transition is canceled. This includes guard cancellation, the canceled leg of a guard redirect, and route-tree restoration after an error. Use `reason` when debugging; do not parse its wording to decide whether a user has permission to open a page.

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

Use `IRouterEvents` for typed subscriptions. The event aggregator also exposes the same events through string channels.

### Type-Safe Event Subscription with `IRouterEvents`

With `IRouterEvents`, TypeScript infers each callback's event type from the event name. This example writes the types explicitly to show which event each callback receives:

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

The event aggregator's string channels require you to supply the event type yourself. This example uses `unknown` because it only logs the event:

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

### Use managed history state

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

This records the completed application route, which can differ from `location.href` after navigation with `historyStrategy: 'none'`. Connect `recordPageView` to your application's analytics service.

### Error Handling and Recovery Service

Use an event subscriber to record a failed navigation and show an error message. Let the code that started the navigation decide how to recover: it knows the intended destination and whether retry is useful.

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

Keep a history of successful navigations with their duration and trigger. This service also exposes the current attempt so a component can display progress:

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

Keep event handlers short. Debounce expensive work when it can wait until events settle. Use a singleton service for application-wide subscriptions to avoid duplicating the same work in each component, and dispose of subscriptions when their owner shuts down.

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

To trace a navigation during development, log its start and outcome with the same event ID:

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

Use `ICurrentRoute` to display the completed route's path, URL, or title in a component:

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
