---
description: >-
  Learn about how to subscribe to and handle router events for advanced navigation monitoring and application state management.
---

# Router events

You can use the lifecycle hooks ([instance](./routing-lifecycle.md) and [shared](./router-hooks.md)) to intercept different stages of the navigation when you are working with the routed components directly.
However, if you want to tap into different navigation phases from a non-routed component, such as standalone service or a simple custom element, then you need to leverage router events.
This section discusses that.

## Router Event Types Overview

The router emits five distinct events that cover the complete navigation lifecycle:

| Event | When Emitted | Use Cases |
|-------|-------------|-----------|
| `au:router:location-change` | Browser location changed via history API | Track URL changes, analytics, browser navigation |
| `au:router:navigation-start` | Before navigation begins | Show loading states, cancel navigation, logging |
| `au:router:navigation-end` | Navigation completes successfully | Hide loading states, update breadcrumbs, analytics |
| `au:router:navigation-cancel` | Navigation cancelled by guards/hooks | Handle cancelled navigation, show messages |
| `au:router:navigation-error` | Navigation encounters an error | Error handling, fallback routing, logging |

## Event Details and Properties

### `LocationChangeEvent`
Triggered when the browser location changes through user navigation (back/forward buttons) or hash changes.

```typescript
interface LocationChangeEvent {
  readonly id: number;           // Unique navigation ID
  readonly url: string;          // New URL
  readonly trigger: 'popstate' | 'hashchange';  // What caused the change
  readonly state: {} | null;     // Browser history state
}
```

### `NavigationStartEvent`
Emitted before navigation execution begins, giving you a chance to prepare or cancel.

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
Emitted when navigation is cancelled by lifecycle hooks returning `false` or throwing.

```typescript
interface NavigationCancelEvent {
  readonly id: number;                    // Unique navigation ID
  readonly instructions: ViewportInstructionTree;  // Attempted instructions
  readonly reason: unknown;               // Cancellation reason
}
```

### `NavigationErrorEvent`
Triggered when navigation encounters errors during execution.

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
import { IDisposable, resolve } from 'aurelia';

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
    // Show error messages, log errors, fallback routing
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
import { IEventAggregator, resolve } from '@aurelia/kernel';

export class BasicNavigationService {
  private readonly ea: IEventAggregator = resolve(IEventAggregator);

  public constructor() {
    this.ea.subscribe('au:router:navigation-start', (event: any) => {
      // Note: 'event' is typed as 'any' - no type safety
    });
  }
}
```

**Important:** Using `IRouterEvents` provides type safety and IntelliSense support, making it the preferred approach.

## Practical Use Cases and Examples

### Global Loading Indicator

Show a loading spinner during navigation:

```typescript
import { resolve } from '@aurelia/kernel';
import { customElement, observable } from '@aurelia/runtime-html';
import { IRouterEvents, NavigationStartEvent, NavigationEndEvent } from '@aurelia/router';

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

  private readonly subscriptions = [
    resolve(IRouterEvents).subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
      this.isNavigating = true;
      console.log(`Starting navigation to: ${event.instructions.toUrl()}`);
    }),

    resolve(IRouterEvents).subscribe('au:router:navigation-end', (event: NavigationEndEvent) => {
      this.isNavigating = false;
      this.updateBreadcrumbs(event.finalInstructions);
      console.log(`Navigation completed: ${event.finalInstructions.toUrl()}`);
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

  private updateBreadcrumbs(instructions: ViewportInstructionTree): void {
    // Extract route titles for breadcrumb navigation
    this.breadcrumbs = instructions.root.children.map(child => child.title || 'Unknown');
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

Track navigation events for analytics:

```typescript
import { singleton, resolve } from '@aurelia/kernel';
import { IRouterEvents, NavigationEndEvent, LocationChangeEvent } from '@aurelia/router';

@singleton
export class AnalyticsService {
  private readonly startTimes = new Map<number, number>();

  public constructor() {
    const events = resolve(IRouterEvents);

    // Track page views
    events.subscribe('au:router:navigation-end', (event: NavigationEndEvent) => {
      this.trackPageView(event);
      this.trackNavigationTiming(event);
    });

    // Track browser navigation
    events.subscribe('au:router:location-change', (event: LocationChangeEvent) => {
      this.trackLocationChange(event);
    });

    // Track navigation starts for timing
    events.subscribe('au:router:navigation-start', (event) => {
      this.startTimes.set(event.id, performance.now());
    });
  }

  private trackPageView(event: NavigationEndEvent): void {
    const url = event.finalInstructions.toUrl();
    const title = this.extractPageTitle(event.finalInstructions);
    
    // Send to analytics service (Google Analytics, Adobe Analytics, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_TRACKING_ID', {
        page_title: title,
        page_location: window.location.href
      });
    }

    console.log(`📊 Page view: ${title} (${url})`);
  }

  private trackNavigationTiming(event: NavigationEndEvent): void {
    const startTime = this.startTimes.get(event.id);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`⏱️ Navigation #${event.id} took ${duration.toFixed(2)}ms`);
      
      // Track slow navigations 
      if (duration > 1000) {
        console.warn(`🐌 Slow navigation detected: ${duration.toFixed(2)}ms`);
      }

      this.startTimes.delete(event.id);
    }
  }

  private trackLocationChange(event: LocationChangeEvent): void {
    console.log(`🔄 Location changed via ${event.trigger}: ${event.url}`);
    
    // Track back/forward button usage
    if (event.trigger === 'popstate') {
      // Send analytics event for browser navigation
    }
  }

  private extractPageTitle(instructions: ViewportInstructionTree): string {
    return instructions.root.children[0]?.title || 'Unknown Page';
  }
}
```

### Error Handling and Recovery Service

Handle navigation errors gracefully:

```typescript
import { singleton, resolve } from '@aurelia/kernel';
import { IRouter, IRouterEvents, NavigationErrorEvent, NavigationCancelEvent } from '@aurelia/router';

interface ErrorRecoveryStrategy {
  shouldRecover(error: unknown): boolean;
  recover(error: unknown): Promise<void>;
}

@singleton  
export class NavigationErrorService {
  private readonly router: IRouter = resolve(IRouter);
  private errorHistory: Array<{timestamp: number, error: unknown, url: string}> = [];

  private recoveryStrategies: ErrorRecoveryStrategy[] = [
    {
      shouldRecover: (error) => error instanceof Error && error.message.includes('Component not found'),
      recover: async (error) => {
        console.log('Component not found, redirecting to home');
        await this.router.load('/');
      }
    },
    {
      shouldRecover: (error) => error instanceof Error && error.message.includes('Permission denied'),
      recover: async (error) => {
        console.log('Permission denied, redirecting to login');
        await this.router.load('/login');
      }
    }
  ];

  public constructor() {
    const events = resolve(IRouterEvents);

    events.subscribe('au:router:navigation-error', (event: NavigationErrorEvent) => {
      this.handleNavigationError(event);
    });

    events.subscribe('au:router:navigation-cancel', (event: NavigationCancelEvent) => {
      this.handleNavigationCancel(event);
    });
  }

  private async handleNavigationError(event: NavigationErrorEvent): Promise<void> {
    const url = event.instructions.toUrl();
    
    // Log error for debugging
    this.errorHistory.push({
      timestamp: Date.now(),
      error: event.error,
      url
    });

    console.error(`❌ Navigation error for ${url}:`, event.error);

    // Try recovery strategies
    for (const strategy of this.recoveryStrategies) {
      if (strategy.shouldRecover(event.error)) {
        try {
          await strategy.recover(event.error);
          console.log(`✅ Recovered from navigation error using strategy`);
          return;
        } catch (recoveryError) {
          console.error('Recovery strategy failed:', recoveryError);
        }
      }
    }

    // Fallback: show error page or go to home
    this.showErrorNotification(`Navigation failed: ${url}`);
    await this.router.load('/error', { 
      state: { originalUrl: url, error: event.error } 
    });
  }

  private handleNavigationCancel(event: NavigationCancelEvent): void {
    const url = event.instructions.toUrl();
    console.warn(`⚠️ Navigation cancelled for ${url}:`, event.reason);
    
    // Show user-friendly message
    if (typeof event.reason === 'string' && event.reason.includes('permission')) {
      this.showErrorNotification('You do not have permission to access this page');
    } else {
      this.showErrorNotification('Navigation was cancelled');
    }
  }

  private showErrorNotification(message: string): void {
    // Implementation depends on your notification system
    console.log(`🔔 ${message}`);
  }

  public getErrorHistory(): Array<{timestamp: number, error: unknown, url: string}> {
    return [...this.errorHistory];
  }

  public clearErrorHistory(): void {
    this.errorHistory.length = 0;
  }
}
```

### Navigation State Management

Track and manage complex navigation states:

```typescript
import { singleton, resolve, observable } from '@aurelia/kernel';
import { IRouterEvents, NavigationStartEvent, NavigationEndEvent } from '@aurelia/router';

interface NavigationHistoryEntry {
  id: number;
  url: string;
  timestamp: number;
  duration?: number;
  trigger: 'api' | 'popstate' | 'hashchange';
}

@singleton
export class NavigationStateService {
  @observable currentNavigation: NavigationHistoryEntry | null = null;
  @observable navigationHistory: NavigationHistoryEntry[] = [];
  @observable isNavigating: boolean = false;

  private pendingNavigations = new Map<number, NavigationHistoryEntry>();

  public constructor() {
    const events = resolve(IRouterEvents);

    events.subscribe('au:router:navigation-start', (event: NavigationStartEvent) => {
      const entry: NavigationHistoryEntry = {
        id: event.id,
        url: event.instructions.toUrl(),
        timestamp: Date.now(),
        trigger: event.trigger
      };

      this.pendingNavigations.set(event.id, entry);
      this.currentNavigation = entry;
      this.isNavigating = true;
    });

    events.subscribe('au:router:navigation-end', (event: NavigationEndEvent) => {
      const entry = this.pendingNavigations.get(event.id);
      if (entry) {
        entry.duration = Date.now() - entry.timestamp;
        entry.url = event.finalInstructions.toUrl(); // Use final URL
        
        this.navigationHistory.push(entry);
        this.pendingNavigations.delete(event.id);
        
        // Keep only last 50 entries
        if (this.navigationHistory.length > 50) {
          this.navigationHistory.shift();
        }
      }

      this.isNavigating = false;
      this.currentNavigation = null;
    });

    events.subscribe('au:router:navigation-cancel', (event) => {
      this.pendingNavigations.delete(event.id);
      this.isNavigating = false;
      this.currentNavigation = null;
    });

    events.subscribe('au:router:navigation-error', (event) => {
      this.pendingNavigations.delete(event.id);
      this.isNavigating = false;
      this.currentNavigation = null;
    });
  }

  public getRecentNavigation(count: number = 10): NavigationHistoryEntry[] {
    return this.navigationHistory.slice(-count);
  }

  public getAverageNavigationTime(): number {
    const withDuration = this.navigationHistory.filter(entry => entry.duration);
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

Enable detailed logging for debugging:

```typescript
export class RouterDebugService {
  constructor() {
    const events = resolve(IRouterEvents);
    
    if (process.env.NODE_ENV === 'development') {
      events.subscribe('au:router:location-change', (event) => {
        console.group(`🔄 Location Change #${event.id}`);
        console.log('URL:', event.url);
        console.log('Trigger:', event.trigger);
        console.log('State:', event.state);
        console.groupEnd();
      });

      events.subscribe('au:router:navigation-start', (event) => {
        console.group(`🚀 Navigation Start #${event.id}`);
        console.log('Instructions:', event.instructions.toString());
        console.log('Trigger:', event.trigger);
        console.groupEnd();
      });

      events.subscribe('au:router:navigation-end', (event) => {
        console.group(`✅ Navigation End #${event.id}`);
        console.log('Final URL:', event.finalInstructions.toUrl());
        console.groupEnd();
      });

      events.subscribe('au:router:navigation-cancel', (event) => {
        console.group(`❌ Navigation Cancel #${event.id}`);
        console.log('Reason:', event.reason);
        console.groupEnd();
      });

      events.subscribe('au:router:navigation-error', (event) => {
        console.group(`💥 Navigation Error #${event.id}`);
        console.error('Error:', event.error);
        console.groupEnd();
      });
    }
  }
}
```

## Using Current Route for Simple Cases

For simple scenarios where you only need current route information without complex event handling, use `ICurrentRoute`:

```typescript
import { resolve } from 'aurelia';
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
