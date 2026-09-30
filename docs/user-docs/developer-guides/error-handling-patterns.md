---
description: >-
  Error handling and recovery patterns in Aurelia 2, including component error management, event handling, and user-friendly error recovery strategies.
---

# Error Handling and Recovery Patterns

Aurelia 2 provides several mechanisms for handling errors gracefully and implementing recovery strategies. This guide covers the practical patterns for managing errors in components, events, and user interactions.

## Component Error Handling

### Promise-based Error Handling

Aurelia uses promise-based error handling throughout its lifecycle. Errors in lifecycle hooks are caught and propagated through promise chains:

```typescript
export class ErrorHandlingComponent {
  private data: any[] = [];
  private error: Error | null = null;
  private loading = false;

  async binding(): Promise<void> {
    this.loading = true;
    this.error = null;
    
    try {
      this.data = await this.dataService.loadData();
    } catch (error) {
      this.error = error instanceof Error ? error : new Error('Unknown error');
      console.error('Data loading failed:', error);
    } finally {
      this.loading = false;
    }
  }

  async retryLoad(): Promise<void> {
    await this.binding();
  }
}
```

Template:
```html
<template switch.bind="true">
  <div case.bind="loading">Loading...</div>
  <div case.bind="error" class="error">
    <p>Error: ${error.message}</p>
    <button click.trigger="retryLoad()">Retry</button>
  </div>
  <div default-case>
    <div repeat.for="item of data">${item.name}</div>
  </div>
</template>
```

### Lifecycle Hook Error Management

The simplest way to contain a lifecycle failure is the built-in `<error-boundary>` element. Wrap the content you don't fully control, and Aurelia tears the failed subtree down and renders your fallback instead of rejecting `Aurelia.start()`:

```html
<error-boundary>
  <third-party-widget></third-party-widget>

  <template au-slot="fallback">
    <p>This widget couldn't load.</p>
    <button click.trigger="$host.reset()">Try again</button>
  </template>
</error-boundary>
```

`$host` inside the fallback is the boundary, so `$host.error` reads the captured error and `$host.reset()` rebuilds the content with fresh component instances. `reset-key.bind` resets the boundary automatically when a key like a route parameter or selected record changes. See [error boundaries](../components/error-boundaries.md) for the full API, including nesting and `error.from-view`.

For a single place to send caught errors, register `IErrorHandler` on the app container. It receives the errors the framework catches at lifecycle hooks, template controller swaps, queued binding updates, app tasks and event listeners, including ones a boundary handled. Computed getter errors don't reach it yet; see [what a boundary does not catch](../components/error-boundaries.md#what-a-boundary-does-not-catch).

```typescript
import { Registration } from '@aurelia/kernel';
import { IErrorHandler } from 'aurelia';

Aurelia.register(
  Registration.instance(IErrorHandler, {
    handleError(error, info) {
      errorReporter.send(error, info.phase, info.handled);
    },
  }),
);
```

Per-hook try/catch still has a place when a hook can recover on its own: catch the error inside the hook, store it in a property, and let the template react to it. That's the pattern in the promise-based example above. The difference is scope: try/catch inside a hook only sees errors in that component's code, while a boundary sees errors anywhere in its subtree, including components you didn't write.

## Event Handler Error Handling

### Safe Event Handlers

When an event handler throws, the default listener behavior reports the error to `IErrorHandler`, dispatches a cancelable `au-event-error` event on `window`, and rethrows unless that event was cancelled. To change what happens after the report, register your own `IListenerBindingOptions`:

```typescript
import { Registration } from '@aurelia/kernel';
import { IListenerBindingOptions } from '@aurelia/runtime-html';

Aurelia.register(
  Registration.instance(IListenerBindingOptions, {
    // true calls preventDefault() on every handled event
    prevent: false,
    onError(event: Event, error: unknown) {
      // Swallow the error instead of rethrowing it. IErrorHandler has
      // already received it by the time this runs.
      console.error(`${event.type} handler failed:`, error);
    },
  }),
);
```

The options apply to every listener binding in the app. For a single handler that needs its own recovery, catch inside the handler instead.

### Error-Safe Event Handlers

Wrap event handlers in try-catch blocks for custom error handling:

```typescript
export class SafeEventComponent {
  private errorMessage: string | null = null;

  safeHandler(action: () => void | Promise<void>): void {
    try {
      const result = action();
      if (result instanceof Promise) {
        result.catch(error => {
          this.handleError(error);
        });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  handleButtonClick(): void {
    this.safeHandler(() => {
      // Potentially dangerous operation
      this.performRiskyOperation();
    });
  }

  async handleAsyncAction(): Promise<void> {
    this.safeHandler(async () => {
      await this.performAsyncOperation();
    });
  }

  private handleError(error: unknown): void {
    this.errorMessage = error instanceof Error ? error.message : 'An error occurred';
    
    // Clear error after 5 seconds
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  private performRiskyOperation(): void {
    // Operation that might fail
  }

  private async performAsyncOperation(): Promise<void> {
    // Async operation that might fail
  }
}
```

## Promise Template Controller Error Handling

Aurelia provides declarative error handling in templates using the promise template controller:

```typescript
export class PromiseErrorComponent {
  dataPromise: Promise<any[]>;

  constructor() {
    this.dataPromise = this.loadData();
  }

  private async loadData(): Promise<any[]> {
    // Simulate potential failure
    if (Math.random() > 0.5) {
      throw new Error('Data loading failed');
    }
    return [{ id: 1, name: 'Item 1' }];
  }

  retryLoad(): void {
    this.dataPromise = this.loadData();
  }
}
```

Template with promise error handling:
```html
<template>
  <div promise.bind="dataPromise">
    <div pending>Loading data...</div>
    <div then.bind="data">
      <div repeat.for="item of data">${item.name}</div>
    </div>
    <div catch.bind="error" class="error">
      <p>Error: ${error.message}</p>
      <button click.trigger="retryLoad()">Retry</button>
    </div>
  </div>
</template>
```

## Error Recovery Strategies

### Retry with Backoff

Implement retry logic with exponential backoff:

```typescript
export class RetryComponent {
  private maxRetries = 3;
  private retryCount = 0;
  private backoffDelay = 1000; // Start with 1 second

  async performWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.retryCount = 0; // Reset on success
        return result;
      } catch (error) {
        this.retryCount = attempt + 1;
        
        if (attempt === this.maxRetries) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry with exponential backoff
        await this.delay(this.backoffDelay * Math.pow(2, attempt));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async loadData(): Promise<any[]> {
    return this.performWithRetry(async () => {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    });
  }
}
```

### Graceful Degradation

Provide fallback functionality when primary features fail:

```typescript
export class GracefulDegradationComponent {
  private primaryFeatureAvailable = true;
  private fallbackData: any[] = [];

  async attached(): Promise<void> {
    try {
      await this.initializePrimaryFeature();
    } catch (error) {
      console.warn('Primary feature unavailable, using fallback:', error);
      this.primaryFeatureAvailable = false;
      this.setupFallback();
    }
  }

  private async initializePrimaryFeature(): Promise<void> {
    // Try to initialize advanced feature
    if (!this.hasRequiredCapabilities()) {
      throw new Error('Required capabilities not available');
    }
    
    // Initialize primary feature
  }

  private hasRequiredCapabilities(): boolean {
    // Check for required browser features, APIs, etc.
    return 'fetch' in window && 'Promise' in window;
  }

  private setupFallback(): void {
    // Setup simpler fallback functionality
    this.fallbackData = [
      { id: 1, name: 'Fallback Item 1' },
      { id: 2, name: 'Fallback Item 2' }
    ];
  }

  handleAction(): void {
    if (this.primaryFeatureAvailable) {
      this.handlePrimaryAction();
    } else {
      this.handleFallbackAction();
    }
  }

  private handlePrimaryAction(): void {
    // Primary action implementation
  }

  private handleFallbackAction(): void {
    // Fallback action implementation
  }
}
```

## User-Friendly Error Messaging

### Error Message Component

Create a reusable error message component:

```typescript
export class ErrorMessageComponent {
  @bindable message: string = '';
  @bindable type: 'error' | 'warning' | 'info' = 'error';
  @bindable dismissible: boolean = true;
  @bindable autoHide: boolean = false;
  @bindable hideDelay: number = 5000;

  private hideTimer?: number;

  messageChanged(): void {
    if (this.autoHide && this.message) {
      this.startHideTimer();
    }
  }

  dismiss(): void {
    this.message = '';
    this.clearHideTimer();
  }

  private startHideTimer(): void {
    this.clearHideTimer();
    this.hideTimer = window.setTimeout(() => {
      this.dismiss();
    }, this.hideDelay);
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }

  detaching(): void {
    this.clearHideTimer();
  }
}
```

Template:
```html
<template>
  <div if.bind="message" class="alert alert-${type}">
    <span>${message}</span>
    <button if.bind="dismissible" click.trigger="dismiss()" class="close">×</button>
  </div>
</template>
```

### Global Error Handler

Create a global error handler service:

```typescript
import { singleton, IEventAggregator } from 'aurelia';

interface ErrorInfo {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  id: string;
}

@singleton
export class ErrorHandlerService {
  private errors: ErrorInfo[] = [];
  private maxErrors = 10;

  constructor(private eventAggregator: IEventAggregator) {}

  handleError(error: Error | string, type: 'error' | 'warning' | 'info' = 'error'): void {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : error,
      type,
      timestamp: new Date(),
      id: this.generateId()
    };

    this.errors.unshift(errorInfo);
    
    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Publish error event
    this.eventAggregator.publish('error:occurred', errorInfo);
  }

  getRecentErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
```

## Testing Error Scenarios

### Unit Testing Error Handling

```typescript
import { TestContext } from '@aurelia/testing';
import { ErrorHandlingComponent } from './error-handling-component';

describe('ErrorHandlingComponent', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = TestContext.create();
  });

  afterEach(() => {
    ctx.dispose();
  });

  it('should handle binding errors gracefully', async () => {
    // Mock service to throw error
    const mockService = {
      loadData: jest.fn().mockRejectedValue(new Error('Service unavailable'))
    };

    ctx.container.register(IDataService, mockService);

    const { component, startPromise, tearDown } = ctx.createFixture(
      '<error-handling-component></error-handling-component>',
      ErrorHandlingComponent
    );

    await startPromise;

    const viewModel = component.controller.viewModel;
    expect(viewModel.error).toBeTruthy();
    expect(viewModel.error.message).toBe('Service unavailable');

    await tearDown();
  });

  it('should allow error recovery', async () => {
    const mockService = {
      loadData: jest.fn()
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockResolvedValueOnce([{ id: 1, name: 'Item 1' }])
    };

    ctx.container.register(IDataService, mockService);

    const { component, startPromise, tearDown } = ctx.createFixture(
      '<error-handling-component></error-handling-component>',
      ErrorHandlingComponent
    );

    await startPromise;

    const viewModel = component.controller.viewModel;
    expect(viewModel.error).toBeTruthy();

    // Retry the operation
    await viewModel.retryLoad();

    expect(viewModel.error).toBeFalsy();
    expect(viewModel.data).toHaveLength(1);

    await tearDown();
  });
});
```

## Best Practices

### 1. **Fail Fast, Recover Gracefully**
- Detect errors early in the component lifecycle
- Provide user-friendly error messages
- Implement retry mechanisms where appropriate

### 2. **Error Boundary Pattern**
- Use promise-based error handling for async operations
- Implement fallback UI for failed components
- Prevent error propagation to parent components

### 3. **Logging and Monitoring**
- Log errors for debugging and monitoring
- Include context information (user actions, component state)
- Use structured error codes for better categorization

### 4. **User Experience**
- Show loading states during error recovery
- Provide clear retry options
- Use progressive disclosure for error details

### 5. **Testing**
- Test both success and failure scenarios
- Mock services to simulate various error conditions
- Verify error recovery mechanisms work correctly

By implementing these error handling patterns, your Aurelia applications will be more robust, user-friendly, and maintainable, providing better experiences even when things go wrong.