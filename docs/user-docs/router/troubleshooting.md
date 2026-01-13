---
description: Common router issues, debugging techniques, and solutions for troubleshooting Aurelia router problems.
---

# Router Troubleshooting Guide

This guide covers common router issues, debugging techniques, and solutions to help you quickly resolve routing problems in your Aurelia applications.

## Common Issues and Solutions

### 1. Routes Not Matching

**Problem**: Configured routes are not being matched or components not loading.

**Symptoms**:
- Blank viewport
- No component loaded
- "Route not found" errors

**Solutions**:

#### Check Route Configuration
```typescript
// ❌ Common mistake - Missing quotes around path
@route({
  routes: [
    { path: home, component: Home } // Missing quotes
  ]
})

// ✅ Correct
@route({
  routes: [
    { path: 'home', component: Home }
  ]
})
```

#### Verify Route Registration
```typescript
// ✅ Ensure routes are properly registered
@route({
  routes: [
    { path: ['', 'home'], component: Home }, // Multiple paths
    { path: 'about', component: About }
  ]
})
export class App {}

// ✅ Or using static routes
export class App {
  static routes = [
    { path: 'home', component: Home }
  ];
}
```

#### Debug Route Matching
```typescript
// Enable router debugging
import { ILogger, LogLevel } from '@aurelia/kernel';

// In main.ts
container.register(
  Registration.instance(ILogger, 
    new Logger().scopeTo('Router').setLevel(LogLevel.trace)
  )
);
```

### 2. Component Not Loading

**Problem**: Route matches but component doesn't appear.

**Debugging Steps**:

#### 1. Check Viewport Configuration
```html
<!-- ❌ Missing viewport -->
<nav>
  <a href="home">Home</a>
</nav>
<!-- No au-viewport! -->

<!-- ✅ Correct -->
<nav>
  <a href="home">Home</a>
</nav>
<au-viewport></au-viewport>
```

#### 2. Verify Component Registration
```typescript
// ✅ Register components if using string references
// main.ts
au.register(
  HomeComponent,
  AboutComponent
);

// ✅ Or use direct component references
@route({
  routes: [
    { path: 'home', component: HomeComponent } // Direct reference
  ]
})
```

#### 3. Check Component Lifecycle
```typescript
export class MyComponent implements IRouteViewModel {
  canLoad(params: Params): boolean | Promise<boolean> {
    console.log('canLoad called', params);
    return true; // Make sure this returns true
  }

  loading(params: Params): void | Promise<void> {
    console.log('loading called', params);
    // Check for errors here
  }
}
```

### 3. Navigation Not Working

**Problem**: Clicking links or calling router.load() doesn't navigate.

**Common Causes and Fixes**:

#### 1. External Links Blocking Router
```html
<!-- ❌ External attribute blocks router -->
<a href="internal-route" external>Link</a>

<!-- ✅ Remove external for internal links -->
<a href="internal-route">Link</a>

<!-- ✅ Use external only for external links -->
<a href="https://example.com" external>External Link</a>
```

#### 2. Href vs Load Attribute Conflicts
```html
<!-- ❌ Don't mix href and load -->
<a href="route1" load="route2">Conflicting</a>

<!-- ✅ Use one or the other -->
<a href="route1">With Href</a>
<a load="route2">With Load</a>
```

#### 3. Router Configuration Issues
```typescript
// ❌ Router not started
const router = container.get(IRouter);
// Missing: router.start(true);

// ✅ Proper router startup
RouterConfiguration.customize({
  // Your config
})

// Router starts automatically with AppTask
```

#### 4. `router.load('../1')` throws `UnknownRouteError`

**Symptom**: `await this.router.load('../1')` rejects with `UnknownRouteError: AUR3401 ... did you forget to add '..1' to the routes list of 'root'?`, yet `<a load="../1">` works.

**Why it happens**: `router.load()` always evaluates instructions in the root routing context unless you pass a `context` option, so `../` cannot be resolved relative to the current child router.

**Fix**: Resolve `IRouteContext` (or pass the component instance created by the router) and provide it in the navigation options.

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter, IRouteContext } from '@aurelia/router';

export class StepNavigator {
  private readonly router = resolve(IRouter);
  private readonly routeContext = resolve(IRouteContext);

  async previousStep() {
    await this.router.load('../1', { context: this.routeContext });
  }

  async exitToParent() {
    await this.router.load('../../summary', {
      context: this.routeContext.parent ?? null,
    });
  }
}
```

If you need to navigate relative to different ancestors (for example inside a reusable widget), compute the target context at runtime (e.g., `const parent = this.routeContext.parent ?? this.routeContext;`) before calling `router.load`.

### 4. Parameters Not Available

**Problem**: Route parameters are undefined or not accessible.

**Debugging**:

#### 1. Check Parameter Definition
```typescript
// ❌ Incorrect parameter syntax
@route({
  routes: [
    { path: 'product/id', component: ProductComponent } // Missing :
  ]
})

// ✅ Correct parameter syntax
@route({
  routes: [
    { path: 'product/:id', component: ProductComponent }
  ]
})
```

#### 2. Access Parameters Correctly
```typescript
export class ProductComponent implements IRouteViewModel {
  private productId: string;

  canLoad(params: Params): boolean {
    console.log('All params:', params); // Debug output
    this.productId = params.id; // Access parameter
    return true;
  }

  // ✅ Alternative: Use ICurrentRoute
  attached() {
    const currentRoute = resolve(ICurrentRoute);
    const paramInfo = currentRoute.parameterInformation[0];
    console.log('Parameter info:', paramInfo?.params);
  }
}
```

### 5. Query Parameters Issues

**Problem**: Query parameters not working or not accessible.

**Solutions**:

#### 1. Setting Query Parameters
```typescript
// ✅ Recommended: let the router stringify query parameters for you
await this.router.load('search', {
  queryParams: {
    q: 'search term',
    page: '1'
  }
});

// ✅ Also supported: include query (and fragment) directly in the instruction string
await this.router.load('search?q=term#results');
```

#### 2. Reading Query Parameters
```typescript
export class SearchComponent {
  private currentRoute = resolve(ICurrentRoute);

  attached() {
    // ✅ Read from URLSearchParams
    const query = this.currentRoute.query;
    const searchTerm = query.get('q');
    const page = parseInt(query.get('page') || '1');

    console.log('Search term:', searchTerm);
    console.log('Page:', page);
  }
}
```

### 6. Hash Routing Issues

**Problem**: Hash routing not working correctly.

**Configuration Check**:
```typescript
// ✅ Enable hash routing
RouterConfiguration.customize({
  useUrlFragmentHash: true
})

// ✅ Ensure base tag is correct for hash routing
// index.html
<base href="/">
```

### 7. Push State Routing Issues

**Problem**: Push state routing not working, especially on refresh.

**Solutions**:

#### 1. Server Configuration
```typescript
// ✅ Configure your server for SPA routing
// Example: Express.js
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
```

#### 2. Base Tag Configuration
```html
<!-- ✅ Correct base tag -->
<base href="/">

<!-- ❌ Incorrect - empty base href breaks URL resolution -->
<base href="">
```

## Debugging Techniques

### 1. Enable Router Logging

```typescript
// main.ts - Enable detailed router logging
import { ILogger, LoggerConfiguration, LogLevel } from '@aurelia/kernel';

container.register(
  LoggerConfiguration.create({
    level: LogLevel.trace,
    colorOptions: 'colors'
  })
);
```

### 2. Router Event Monitoring

```typescript
// Debug navigation with events
export class RouterDebugger {
  constructor() {
    const routerEvents = resolve(IRouterEvents);
    
    routerEvents.subscribe('au:router:navigation-start', (event) => {
      console.log('🚀 Navigation started:', event);
    });
    
    routerEvents.subscribe('au:router:navigation-end', (event) => {
      console.log('✅ Navigation completed:', event);
    });
    
    routerEvents.subscribe('au:router:navigation-error', (event) => {
      console.error('❌ Navigation failed:', event);
    });
    
    routerEvents.subscribe('au:router:navigation-cancel', (event) => {
      console.warn('⚠️ Navigation cancelled:', event);
    });
  }
}
```

### 3. Route State Inspection

```typescript
// Inspect current router state
export class RouterInspector {
  private router = resolve(IRouter);
  private currentRoute = resolve(ICurrentRoute);

  inspectState() {
    console.log('=== Router State ===');
    console.log('Is navigating:', this.router.isNavigating);
    console.log('Current path:', this.currentRoute.path);
    console.log('Current URL:', this.currentRoute.url);
    console.log('Route tree:', this.router.routeTree);
    console.log('Parameter info:', this.currentRoute.parameterInformation);
    console.log('Query params:', Array.from(this.currentRoute.query.entries()));
  }
}
```

### 4. Component Lifecycle Debugging

```typescript
export class DebugComponent implements IRouteViewModel {
  canLoad(params: Params, next: RouteNode, current: RouteNode | null): boolean {
    console.log('canLoad:', { params, next: next.path, current: current?.path });
    return true;
  }

  loading(params: Params, next: RouteNode, current: RouteNode | null): void {
    console.log('loading:', { params, next: next.path, current: current?.path });
  }

  canUnload(next: RouteNode | null, current: RouteNode): boolean {
    console.log('canUnload:', { next: next?.path, current: current.path });
    return true;
  }

  unloading(next: RouteNode | null, current: RouteNode): void {
    console.log('unloading:', { next: next?.path, current: current.path });
  }
}
```

## Performance Issues

### 1. Slow Route Loading

**Causes and Solutions**:

#### 1. Large Component Bundles
```typescript
// ❌ Large synchronous imports
import { HugeComponent } from './huge-component';

@route({
  routes: [
    { path: 'huge', component: HugeComponent }
  ]
})

// ✅ Use dynamic imports for large components
@route({
  routes: [
    { path: 'huge', component: () => import('./huge-component') }
  ]
})
```

#### 2. Heavy Lifecycle Operations
```typescript
export class OptimizedComponent implements IRouteViewModel {
  // ❌ Heavy operations in canLoad
  async canLoad(params: Params): Promise<boolean> {
    await this.loadHeavyData(); // Blocks navigation
    return true;
  }

  // ✅ Move heavy operations to loading
  canLoad(params: Params): boolean {
    return true; // Quick validation only
  }

  async loading(params: Params): Promise<void> {
    // Heavy operations here don't block navigation decision
    await this.loadHeavyData();
  }
}
```

### 2. Memory Leaks

**Common Causes**:

#### 1. Event Subscriptions Not Cleaned Up
```typescript
export class ComponentWithSubscription {
  private subscription?: IDisposable;

  attached() {
    this.subscription = this.routerEvents.subscribe(
      'au:router:navigation-end',
      this.handleNavigation
    );
  }

  // ✅ Always clean up subscriptions
  detaching() {
    this.subscription?.dispose();
  }
}
```

#### 2. Large Route Trees
```typescript
// ✅ Monitor route tree size
export class RouteTreeMonitor {
  inspectRouteTree() {
    const routeTree = this.router.routeTree;
    const nodeCount = this.countNodes(routeTree.root);
    
    if (nodeCount > 100) {
      console.warn('Large route tree detected:', nodeCount, 'nodes');
    }
  }

  private countNodes(node: RouteNode): number {
    return 1 + node.children.reduce((sum, child) => sum + this.countNodes(child), 0);
  }
}
```

## Development vs Production Issues

### 1. Works in Development but Not Production

**Common Causes**:

#### 1. Build Configuration
```typescript
// ✅ Check dynamic imports are supported
// webpack.config.js
module.exports = {
  output: {
    chunkFilename: '[name].[chunkhash].js'
  }
};
```

#### 2. Base Path Configuration
```typescript
// ✅ Environment-specific base paths
const basePath = process.env.NODE_ENV === 'production' 
  ? '/my-app/' 
  : '/';

RouterConfiguration.customize({
  basePath
});
```

### 2. Different Behavior Between Hash and Push State

```typescript
// ✅ Test both modes during development
// Use environment variable to switch
RouterConfiguration.customize({
  useUrlFragmentHash: process.env.USE_HASH_ROUTING === 'true'
});
```

## Error Messages and Solutions

### Common Error Messages

1. **"No route found for path"**
   - Check route configuration
   - Verify fallback routes
   - Enable route logging

2. **"Component not found"**
   - Verify component registration
   - Check import statements
   - Confirm component exports

3. **"Navigation cancelled"**
   - Check lifecycle hooks
   - Verify canLoad/canUnload return values
   - Look for thrown exceptions

4. **"Viewport not found"**
   - Ensure `<au-viewport>` is present
   - Check viewport names match
   - Verify viewport hierarchy

## Quick Debugging Checklist

### ✅ Router Setup
- [ ] RouterConfiguration registered
- [ ] Router started with `router.start(true)`
- [ ] Base tag configured correctly
- [ ] Server configured for SPA (if using push state)

### ✅ Route Configuration
- [ ] Routes properly defined
- [ ] Paths have correct syntax
- [ ] Components imported/registered
- [ ] Fallback routes configured

### ✅ Navigation
- [ ] Viewports present in templates
- [ ] Links don't have conflicting attributes
- [ ] External links marked as external
- [ ] Navigation calls handle errors

### ✅ Components
- [ ] Lifecycle hooks return correct values
- [ ] Parameters accessed correctly
- [ ] Subscriptions cleaned up
- [ ] Error handling implemented

This troubleshooting guide provides practical solutions for the most common router issues, helping developers quickly identify and resolve routing problems.
