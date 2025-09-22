---
description: Learn how to handle navigation errors, implement error recovery patterns, and create robust routing experiences.
---

# Router Error Handling

Navigation errors are inevitable in complex applications. The Aurelia router provides comprehensive error handling mechanisms to help you create resilient routing experiences. This section covers error types, recovery patterns, and best practices for handling routing failures.

## Types of Router Errors

### Navigation Errors
Errors that occur during the navigation process:

```typescript
import { IRouterEvents, NavigationErrorEvent } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class ErrorHandler {
  private routerEvents = resolve(IRouterEvents);

  attached() {
    this.routerEvents.subscribe('au:router:navigation-error', (event: NavigationErrorEvent) => {
      console.error('Navigation failed:', event.error);
      console.log('Failed instructions:', event.instructions);
      console.log('Navigation ID:', event.id);
      
      this.handleNavigationError(event.error);
    });
  }

  private handleNavigationError(error: unknown) {
    if (error instanceof Error) {
      // Handle specific error types
      switch (error.name) {
        case 'UnknownRouteError':
          this.router.load('not-found');
          break;
        case 'NetworkError':
          this.showRetryDialog();
          break;
        default:
          this.showGenericError(error.message);
      }
    }
  }
}
```

### Component Loading Errors
Errors that occur when loading route components:

```typescript
export class ComponentErrorHandler {
  // Handle dynamic import failures
  private async loadComponentSafely(importFn: () => Promise<any>) {
    try {
      return await importFn();
    } catch (error) {
      console.error('Component loading failed:', error);
      // Return fallback component
      return { default: FallbackComponent };
    }
  }
}

// In route configuration
@route({
  routes: [
    {
      path: 'lazy-route',
      component: () => this.loadComponentSafely(() => import('./lazy-component'))
    }
  ]
})
export class MyApp {}
```

### Hook Validation Errors
Errors thrown by lifecycle hooks:

```typescript
export class ProtectedComponent implements IRouteViewModel {
  async canLoad(params: Params): Promise<boolean> {
    try {
      await this.validateAccess(params);
      return true;
    } catch (error) {
      console.error('Access validation failed:', error);
      // Redirect to login or show error
      this.router.load('login');
      return false;
    }
  }

  private async validateAccess(params: Params): Promise<void> {
    const hasPermission = await this.authService.checkPermission(params.id);
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }
  }
}
```

## Error Recovery Configuration

### Automatic Route Tree Restoration

Configure the router to automatically restore the previous route tree on errors:

```typescript
// main.ts
RouterConfiguration.customize({
  restorePreviousRouteTreeOnError: true, // Default behavior
})
```

With this setting enabled (default), navigation failures automatically restore the previous working route state:

```typescript
export class NavigationService {
  private router = resolve(IRouter);

  async navigateWithFallback(route: string) {
    try {
      const success = await this.router.load(route);
      if (!success) {
        console.log('Navigation cancelled, previous route restored');
      }
    } catch (error) {
      console.log('Navigation failed, previous route restored automatically');
      // The router has already restored the previous route tree
    }
  }
}
```

### Strict Error Handling

For applications requiring stricter error handling, disable automatic restoration:

```typescript
RouterConfiguration.customize({
  restorePreviousRouteTreeOnError: false
})
```

In strict mode, handle errors explicitly:

```typescript
export class StrictErrorHandler {
  private routerEvents = resolve(IRouterEvents);

  attached() {
    this.routerEvents.subscribe('au:router:navigation-error', (event) => {
      // Manual error handling required
      this.handleError(event.error);
      
      // Manually restore or navigate to error page
      this.router.load('error', {
        state: { originalError: event.error }
      });
    });
  }
}
```

## Error Handling Patterns

### Global Error Boundary

Create a global error boundary for routing errors:

```typescript
@singleton
export class GlobalRouterErrorHandler {
  private router = resolve(IRouter);
  private routerEvents = resolve(IRouterEvents);
  private logger = resolve(ILogger);

  initialize() {
    this.routerEvents.subscribe('au:router:navigation-error', (event) => {
      this.handleNavigationError(event);
    });

    this.routerEvents.subscribe('au:router:navigation-cancel', (event) => {
      this.handleNavigationCancel(event);
    });
  }

  private handleNavigationError(event: NavigationErrorEvent) {
    this.logger.error('Navigation error:', event.error);

    // Categorize and handle different error types
    if (this.isNetworkError(event.error)) {
      this.handleNetworkError(event);
    } else if (this.isAuthError(event.error)) {
      this.handleAuthError(event);
    } else {
      this.handleGenericError(event);
    }
  }

  private handleNetworkError(event: NavigationErrorEvent) {
    // Show retry dialog
    this.showRetryDialog(() => {
      this.router.load(event.instructions.toPath());
    });
  }

  private handleAuthError(event: NavigationErrorEvent) {
    // Redirect to login with return URL
    this.router.load('login', {
      queryParams: { returnUrl: event.instructions.toPath() }
    });
  }

  private handleGenericError(event: NavigationErrorEvent) {
    // Navigate to generic error page
    this.router.load('error', {
      state: { 
        error: event.error,
        attemptedRoute: event.instructions.toPath()
      }
    });
  }
}
```

### Component-Level Error Handling

Handle errors at the component level for fine-grained control:

```typescript
export class ProductListComponent implements IRouteViewModel {
  private products: Product[] = [];
  private error: string | null = null;
  private loading = false;

  async canLoad(params: Params): Promise<boolean> {
    try {
      this.loading = true;
      this.error = null;
      
      // Validate parameters
      if (!params.categoryId || !this.isValidCategory(params.categoryId)) {
        throw new Error('Invalid category');
      }

      // Pre-load critical data
      await this.loadCriticalData(params.categoryId);
      return true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Decide whether to allow navigation
      if (this.isCriticalError(error)) {
        return false; // Prevent navigation
      }
      
      return true; // Allow navigation with error state
    } finally {
      this.loading = false;
    }
  }

  async loading(params: Params) {
    try {
      // Load non-critical data
      this.products = await this.productService.getProducts(params.categoryId);
    } catch (error) {
      // Handle non-critical errors gracefully
      this.error = 'Failed to load products. Please try again.';
      this.products = [];
    }
  }

  retry() {
    // Retry current navigation
    this.router.load(this.currentRoute.path);
  }
}
```

### Fallback Routes and Components

Configure fallback handling for unknown routes:

```typescript
@route({
  routes: [
    { path: 'products', component: ProductList },
    { path: 'users', component: UserList },
  ],
  fallback: (instruction, routeNode, context) => {
    // Custom fallback logic
    const path = instruction.component;
    
    if (typeof path === 'string' && path.startsWith('admin/')) {
      // Redirect admin routes to login
      return 'login';
    }
    
    // Default fallback
    return 'not-found';
  }
})
export class AppRoot {}
```

## Error Recovery Strategies

### Retry with Exponential Backoff

Implement retry logic for transient errors:

```typescript
export class RetryNavigationService {
  async navigateWithRetry(
    route: string, 
    options?: INavigationOptions,
    maxRetries = 3
  ): Promise<boolean> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await this.router.load(route, options);
      } catch (error) {
        attempt++;
        
        if (attempt >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await this.delay(delay);
        
        console.log(`Retry attempt ${attempt} for route: ${route}`);
      }
    }
    
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Graceful Degradation

Provide fallback experiences when navigation fails:

```typescript
export class ResilientNavigationService {
  async navigateOrDegrade(primaryRoute: string, fallbackRoute: string) {
    try {
      const success = await this.router.load(primaryRoute);
      if (success) return;
    } catch (error) {
      console.warn('Primary navigation failed:', error);
    }

    // Try fallback route
    try {
      await this.router.load(fallbackRoute);
    } catch (error) {
      console.error('Fallback navigation also failed:', error);
      // Show inline error message instead of navigating
      this.showInlineError();
    }
  }

  private showInlineError() {
    // Show error UI without changing route
    this.eventAggregator.publish('show-error-toast', {
      message: 'Navigation failed. Please try again.',
      type: 'warning'
    });
  }
}
```

## Error Monitoring and Logging

### Comprehensive Error Tracking

```typescript
@singleton
export class RouterErrorMonitor {
  private errorCounts = new Map<string, number>();
  private routerEvents = resolve(IRouterEvents);

  initialize() {
    this.routerEvents.subscribe('au:router:navigation-error', (event) => {
      this.trackError(event);
      this.reportError(event);
    });
  }

  private trackError(event: NavigationErrorEvent) {
    const route = event.instructions.toPath();
    const count = this.errorCounts.get(route) || 0;
    this.errorCounts.set(route, count + 1);

    // Alert if error rate is high
    if (count > 5) {
      console.warn(`High error rate for route: ${route}`);
      this.alertHighErrorRate(route, count);
    }
  }

  private reportError(event: NavigationErrorEvent) {
    // Send to error reporting service
    this.errorReportingService.captureException(event.error, {
      tags: {
        component: 'router',
        route: event.instructions.toPath(),
        navigationId: event.id.toString()
      },
      extra: {
        instructions: event.instructions.toString(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

## Best Practices

### 1. Always Handle Navigation Errors
```typescript
// ✅ Good - Handle potential errors
try {
  await this.router.load('dashboard');
} catch (error) {
  this.handleNavigationError(error);
}

// ❌ Avoid - Ignoring potential errors
this.router.load('dashboard'); // Could throw unhandled errors
```

### 2. Provide User Feedback
```typescript
// ✅ Good - Inform users about errors
export class NavigationService {
  async navigate(route: string) {
    try {
      this.showLoading();
      await this.router.load(route);
    } catch (error) {
      this.showError('Navigation failed. Please try again.');
    } finally {
      this.hideLoading();
    }
  }
}
```

### 3. Use Appropriate Error Recovery
```typescript
// ✅ Good - Context-appropriate recovery
if (error.name === 'AuthenticationError') {
  this.router.load('login');
} else if (error.name === 'NetworkError') {
  this.showRetryOption();
} else {
  this.router.load('error');
}

// ❌ Avoid - Generic error handling for all cases
this.router.load('error'); // Not always appropriate
```

This comprehensive error handling documentation fills a significant gap by providing developers with patterns and strategies for creating robust routing experiences.