---
description: >-
  A comprehensive guide to debugging Aurelia 2 applications, troubleshooting common issues, and using development tools effectively.
---

# Debugging and Troubleshooting

Effective debugging is crucial for developing robust Aurelia applications. This guide covers debugging strategies, common issues, development tools, and troubleshooting techniques specifically for Aurelia 2.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Browser Developer Tools](#browser-developer-tools)
- [Aurelia-Specific Debugging](#aurelia-specific-debugging)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Performance Debugging](#performance-debugging)
- [Build and Bundler Issues](#build-and-bundler-issues)
- [Runtime Error Patterns](#runtime-error-patterns)
- [Testing and Debugging](#testing-and-debugging)
- [Advanced Debugging Techniques](#advanced-debugging-techniques)

## Development Environment Setup

### Enable Development Mode

Always use development builds during development for better debugging experience:

```typescript
// main.ts
import { Aurelia, LogLevel } from 'aurelia';

const au = new Aurelia();

// Configure logging for development
if (process.env.NODE_ENV !== 'production') {
  au.register(LoggingConfiguration.customize(options => {
    options.level = LogLevel.debug;
    options.colorOptions = ColorOptions.colors;
  }));
}

au.app(component).start();
```

### Source Maps Configuration

Ensure proper source map configuration for accurate debugging:

**Webpack:**
```javascript
module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-source-map', // Fast rebuild, good debugging
  // For production debugging: 'source-map'
};
```

**Vite:**
```javascript
export default defineConfig({
  build: {
    sourcemap: true
  }
});
```

### Development Aliases

Use development bundles for better debugging:

```javascript
// webpack.config.js
resolve: {
  alias: {
    ...aureliaPackages.reduce((map, pkg) => {
      const name = pkg === 'aurelia' ? pkg : `@aurelia/${pkg}`;
      map[name] = path.resolve(__dirname, 'node_modules', name, 'dist/esm/index.dev.mjs');
      return map;
    }, {})
  }
}
```

## Browser Developer Tools

### Chrome DevTools Extensions

While there's no official Aurelia 2 extension yet, you can use general debugging techniques:

#### Elements Panel
- Inspect custom elements and their properties
- View component instances via `$0.au.controller.viewModel`
- Examine binding contexts and scopes

#### Console Debugging
Access component instances directly:

```javascript
// Select an element in Elements panel, then in Console:
const viewModel = $0.au.controller.viewModel;
const binding = $0.au.controller.bindings;
const scope = $0.au.controller.scope;

// Inspect component state
console.log('Component data:', viewModel);
console.log('Active bindings:', binding);
```

#### Sources Panel
- Set breakpoints in TypeScript source (with source maps)
- Use conditional breakpoints for specific scenarios
- Step through component lifecycle methods

### Firefox Developer Tools

Similar debugging capabilities with excellent source map support:

```javascript
// Access Aurelia internals
const controller = $0.au?.controller;
if (controller) {
  console.log('ViewModel:', controller.viewModel);
  console.log('View:', controller.view);
  console.log('Container:', controller.container);
}
```

## Aurelia-Specific Debugging

### Component Lifecycle Debugging

Add logging to component lifecycle methods:

```typescript
import { ILogger, resolve } from 'aurelia';

export class MyComponent {
  private logger = resolve(ILogger).scopeTo('MyComponent');

  created() {
    this.logger.debug('Component created');
  }

  binding() {
    this.logger.debug('Component binding', this);
  }

  bound() {
    this.logger.debug('Component bound');
  }

  attached() {
    this.logger.debug('Component attached to DOM');
  }

  detaching() {
    this.logger.debug('Component detaching');
  }

  unbinding() {
    this.logger.debug('Component unbinding');
  }
}
```

### Binding Expression Debugging

Debug binding expressions with logging:

```html
<!-- Use debug value converter -->
<div>${value | debug}</div>

<!-- Or use console logging in expressions -->
<div>${value & console.log}</div>
```

Create a debug value converter:

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('debug')
export class DebugValueConverter {
  toView(value: unknown, label?: string): unknown {
    console.log(label || 'Debug:', value);
    return value;
  }
}
```

### Dependency Injection Debugging

Debug DI resolution issues:

```typescript
import { IContainer, ILogger, resolve } from 'aurelia';

export class DiagnosticService {
  private container = resolve(IContainer);
  private logger = resolve(ILogger).scopeTo('DiagnosticService');

  checkRegistrations(keys: any[]) {
    keys.forEach(key => {
      try {
        const instance = this.container.get(key);
        this.logger.debug(`✓ ${key.name || key}: resolved`, instance);
      } catch (error) {
        this.logger.error(`✗ ${key.name || key}: failed to resolve`, error);
      }
    });
  }

  inspectContainer() {
    // Access container registrations (internal API)
    const registrations = (this.container as any)._registrations;
    this.logger.debug('Container registrations:', registrations);
  }
}
```

### Router Debugging

Enable router debugging:

```typescript
import { RouterConfiguration } from '@aurelia/router';

Aurelia.register(
  RouterConfiguration.customize(options => {
    options.logLevel = 'debug'; // Enable router logging
  })
);
```

Add router event listeners:

```typescript
import { IEventAggregator, resolve } from 'aurelia';

export class RouterDebugger {
  private ea = resolve(IEventAggregator);

  created() {
    this.ea.subscribe('au:router:navigation-start', (event) => {
      console.log('Navigation started:', event);
    });

    this.ea.subscribe('au:router:navigation-end', (event) => {
      console.log('Navigation completed:', event);
    });

    this.ea.subscribe('au:router:navigation-error', (event) => {
      console.error('Navigation error:', event);
    });
  }
}
```

## Common Issues and Solutions

### Template Compilation Errors

**Issue:** Template fails to compile
```
Error: Template compilation failed
```

**Solutions:**
1. Check for unclosed HTML tags
2. Verify custom element imports
3. Ensure proper binding syntax

```html
<!-- ✗ Incorrect -->
<input value.bind=name>

<!-- ✓ Correct -->
<input value.bind="name">
```

### Binding Failures

**Issue:** Properties not updating in the view

**Debug steps:**
1. Check property observability:

```typescript
// ✗ Non-observable property
export class MyComponent {
  value = ''; // Won't trigger updates
}

// ✓ Observable property
import { observable } from 'aurelia';

export class MyComponent {
  @observable value = '';
}
```

2. Verify binding mode:

```html
<!-- One-time binding won't update -->
<input value.one-time="name">

<!-- Two-way binding for input -->
<input value.bind="name">
```

### Custom Element Issues

**Issue:** Custom element not recognized

**Solutions:**
1. Verify import and registration:

```html
<!-- ✗ Missing import -->
<my-element></my-element>

<!-- ✓ Proper import -->
<import from="./my-element"></import>
<my-element></my-element>
```

2. Check naming conventions:

```typescript
// ✗ Incorrect naming
export class MyElementCustomElement {} // Redundant suffix

// ✓ Correct naming
export class MyElement {}
```

### Memory Leaks

**Issue:** Components not being garbage collected

**Solutions:**
1. Properly dispose of subscriptions:

```typescript
import { IDisposable } from 'aurelia';

export class MyComponent {
  private subscriptions: IDisposable[] = [];

  attached() {
    const subscription = this.eventAggregator.subscribe('event', handler);
    this.subscriptions.push(subscription);
  }

  detaching() {
    this.subscriptions.forEach(sub => sub.dispose());
    this.subscriptions.length = 0;
  }
}
```

2. Remove event listeners:

```typescript
export class MyComponent {
  private handleClick = () => { /* handler */ };

  attached() {
    document.addEventListener('click', this.handleClick);
  }

  detaching() {
    document.removeEventListener('click', this.handleClick);
  }
}
```

## Performance Debugging

### Component Rendering Performance

Use Chrome DevTools Performance tab:

1. Record performance during navigation
2. Look for long tasks and forced reflows
3. Identify component lifecycle bottlenecks

### Binding Expression Performance

Debug slow binding expressions:

```typescript
import { computed } from 'aurelia';

export class MyComponent {
  items = [];

  // ✗ Expensive computation on every check
  get expensiveComputation() {
    return this.items.filter(item => /* complex logic */);
  }

  // ✓ Cached computation
  @computed('items')
  get optimizedComputation() {
    return this.items.filter(item => /* complex logic */);
  }
}
```

### Memory Usage Analysis

Monitor memory usage in DevTools:

1. Use Memory tab to take heap snapshots
2. Compare snapshots to identify leaks
3. Look for detached DOM nodes

## Build and Bundler Issues

### Webpack Issues

**Issue:** Module resolution errors

**Debug steps:**
1. Check resolve configuration:

```javascript
resolve: {
  extensions: ['.ts', '.js'],
  modules: ['src', 'node_modules']
}
```

2. Verify loader order:

```javascript
rules: [
  {
    test: /\.ts$/,
    use: ['ts-loader', '@aurelia/webpack-loader'],
    exclude: /node_modules/
  }
]
```

### Vite Issues

**Issue:** Import resolution problems

**Solutions:**
1. Check Vite configuration:

```javascript
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  plugins: [
    aurelia({
      useDev: true, // Use development bundles
      enableConventions: true
    })
  ]
});
```

2. Verify file extensions in imports:

```typescript
// ✗ Missing extension in Vite
import { MyService } from './my-service';

// ✓ Include extension
import { MyService } from './my-service.js';
```

## Runtime Error Patterns

### Common Error Messages

**"Cannot read property of undefined"**
- Check for null/undefined values in bindings
- Use safe navigation: `user?.profile?.name`
- Add null checks in computed properties

**"Cyclic dependency detected"**
- Review service dependencies
- Use factory patterns or lazy injection
- Break circular references

**"No matching constructor"**
- Check dependency injection setup
- Verify service registration
- Ensure proper imports

### Error Boundary Pattern

Create error boundary components:

```typescript
import { ILogger, resolve } from 'aurelia';

export class ErrorBoundary {
  private logger = resolve(ILogger);
  hasError = false;
  error: Error | null = null;

  errorCaught(error: Error) {
    this.hasError = true;
    this.error = error;
    this.logger.error('Component error caught:', error);
    
    // Report to error tracking service
    // this.errorTracker.captureException(error);
  }
}
```

```html
<template>
  <div if.bind="hasError" class="error-boundary">
    <h2>Something went wrong</h2>
    <p>${error.message}</p>
    <button click.trigger="retry()">Retry</button>
  </div>
  <div else>
    <slot></slot>
  </div>
</template>
```

## Testing and Debugging

### Unit Test Debugging

Debug unit tests with proper setup:

```typescript
import { TestContext } from '@aurelia/testing';

describe('MyComponent', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = TestContext.create();
    // Enable debug logging in tests
    ctx.container.register(
      LoggingConfiguration.customize(options => {
        options.level = LogLevel.debug;
      })
    );
  });

  it('should render correctly', async () => {
    const { component, startPromise, tearDown } = createFixture(
      '<my-component></my-component>',
      MyComponent
    );

    await startPromise;

    // Debug component state
    console.log('Component instance:', component.controller.viewModel);
    
    await tearDown();
  });
});
```

### Integration Test Debugging

Use browser debugging for integration tests:

```typescript
// Set debugger breakpoints in tests
it('should handle user interaction', async () => {
  const { component } = createFixture(/* ... */);
  
  debugger; // Browser will pause here
  
  const button = component.querySelector('button');
  button.click();
  
  // Continue debugging...
});
```

## Advanced Debugging Techniques

### Custom Debug Panel

Create a development-only debug panel:

```typescript
import { IContainer, ILogger, resolve } from 'aurelia';

export class DebugPanel {
  private container = resolve(IContainer);
  private logger = resolve(ILogger);
  
  visible = false;
  selectedComponent: any = null;

  inspectComponent(element: HTMLElement) {
    const controller = (element as any).au?.controller;
    if (controller) {
      this.selectedComponent = {
        viewModel: controller.viewModel,
        bindings: controller.bindings,
        scope: controller.scope,
        element: element
      };
      this.visible = true;
    }
  }

  logContainerState() {
    // Log all registered services
    const registrations = (this.container as any)._registrations;
    this.logger.debug('Container state:', registrations);
  }
}
```

### Performance Monitoring

Add performance monitoring:

```typescript
export class PerformanceMonitor {
  private marks = new Map<string, number>();

  startTiming(label: string) {
    this.marks.set(label, performance.now());
  }

  endTiming(label: string) {
    const start = this.marks.get(label);
    if (start) {
      const duration = performance.now() - start;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      this.marks.delete(label);
    }
  }

  measureComponentLifecycle(component: any) {
    const originalCreated = component.created;
    const originalBound = component.bound;
    const originalAttached = component.attached;

    component.created = () => {
      this.startTiming(`${component.constructor.name}.created`);
      const result = originalCreated?.call(component);
      this.endTiming(`${component.constructor.name}.created`);
      return result;
    };

    // Similar for other lifecycle methods...
  }
}
```

### Network Request Debugging

Monitor and debug HTTP requests:

```typescript
import { IHttpClient, resolve } from 'aurelia';

export class HttpDebugger {
  private http = resolve(IHttpClient);

  setupRequestInterception() {
    const originalFetch = this.http.fetch;
    
    this.http.fetch = async (input, init) => {
      console.log('HTTP Request:', input, init);
      const start = performance.now();
      
      try {
        const response = await originalFetch.call(this.http, input, init);
        const duration = performance.now() - start;
        console.log(`HTTP Response (${duration.toFixed(2)}ms):`, response);
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`HTTP Error (${duration.toFixed(2)}ms):`, error);
        throw error;
      }
    };
  }
}
```

## Best Practices

### Debugging Strategy

1. **Start Small**: Isolate issues to the smallest possible scope
2. **Use Logging**: Implement comprehensive logging throughout your app
3. **Reproduce Consistently**: Create reliable reproduction steps
4. **Check Dependencies**: Verify all service registrations and imports
5. **Use TypeScript**: Catch errors at compile time

### Development Workflow

1. Enable all development features (source maps, logging, dev bundles)
2. Use browser developer tools effectively
3. Write unit tests for complex logic
4. Monitor performance regularly
5. Set up error tracking for production

### Error Prevention

1. Use TypeScript strict mode
2. Implement proper error boundaries
3. Validate inputs and handle edge cases
4. Use defensive programming techniques
5. Regular code reviews focusing on error scenarios

## Conclusion

Effective debugging in Aurelia 2 requires understanding the framework's architecture, using appropriate tools, and following systematic troubleshooting approaches. By implementing the techniques and strategies outlined in this guide, you'll be able to identify and resolve issues more efficiently, leading to more robust and maintainable applications.

Remember that good debugging practices start with good development practices—clear code structure, comprehensive testing, and proper error handling will prevent many issues before they become debugging challenges.