---
description: Advanced router APIs, utilities, and lesser-known features for complex routing scenarios.
---

# Advanced Router API Reference

This guide covers advanced router APIs, utilities, and lesser-known features that provide powerful capabilities for complex routing scenarios. These APIs are particularly useful for building sophisticated applications with dynamic routing requirements.

## Router Advanced APIs

### Router State Management

#### `router.routeTree`
Access the current route tree structure for advanced navigation analysis:

```typescript
import { IRouter, RouteNode } from '@aurelia/router';

export class RouteAnalyzer {
  private router = resolve(IRouter);

  analyzeCurrentRoutes(): void {
    const routeTree = this.router.routeTree;
    
    console.log('Root route:', routeTree.root);
    console.log('Active routes:', this.getActiveRoutes(routeTree.root));
    console.log('Route depth:', this.getRouteDepth(routeTree.root));
  }

  private getActiveRoutes(node: RouteNode): RouteNode[] {
    const active = [node];
    node.children.forEach(child => {
      active.push(...this.getActiveRoutes(child));
    });
    return active;
  }

  private getRouteDepth(node: RouteNode, depth = 0): number {
    if (node.children.length === 0) return depth;
    return Math.max(...node.children.map(child => 
      this.getRouteDepth(child, depth + 1)
    ));
  }
}
```

#### `router.currentTr` (Current Transition)
Access detailed information about the current navigation transition:

```typescript
export class TransitionMonitor {
  private router = resolve(IRouter);

  inspectCurrentTransition(): void {
    const transition = this.router.currentTr;
    
    console.log('Transition ID:', transition.id);
    console.log('Trigger:', transition.trigger); // 'api', 'popstate', 'hashchange'
    console.log('Previous instructions:', transition.prevInstructions);
    console.log('Current instructions:', transition.instructions);
    console.log('Final instructions:', transition.finalInstructions);
    console.log('Options:', transition.options);
    console.log('Route tree:', transition.routeTree);
    console.log('Previous route tree:', transition.previousRouteTree);
  }

  async waitForTransition(): Promise<boolean> {
    // Wait for current transition to complete
    const transition = this.router.currentTr;
    if (transition.promise) {
      return await transition.promise;
    }
    return true;
  }
}
```

### Advanced Navigation Options

#### Navigation with Custom State
Store custom data with navigation history:

```typescript
export class StatefulNavigation {
  private router = resolve(IRouter);

  async navigateWithState(route: string, customData: any): Promise<boolean> {
    return this.router.load(route, {
      state: {
        timestamp: Date.now(),
        userData: customData,
        source: 'application'
      }
    });
  }

  async navigateWithContext(route: string, context: IRouteContext): Promise<boolean> {
    return this.router.load(route, {
      context: context, // Navigate relative to specific context
      historyStrategy: 'push'
    });
  }
}
```

#### Advanced Query Parameter Handling
```typescript
export class QueryParameterManager {
  private router = resolve(IRouter);
  private currentRoute = resolve(ICurrentRoute);

  // Merge new query params with existing ones
  async updateQueryParams(newParams: Record<string, string>): Promise<boolean> {
    const currentQuery = this.currentRoute.query;
    const mergedParams = new URLSearchParams(currentQuery);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        mergedParams.delete(key);
      } else {
        mergedParams.set(key, value);
      }
    });

    return this.router.load(this.currentRoute.path, {
      queryParams: Object.fromEntries(mergedParams),
      historyStrategy: 'replace' // Don't create new history entry
    });
  }

  // Batch query parameter updates
  async batchUpdateQueryParams(updates: Array<{key: string, value: string | null}>): Promise<boolean> {
    const currentQuery = this.currentRoute.query;
    const newParams = new URLSearchParams(currentQuery);
    
    updates.forEach(({key, value}) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    return this.router.load(this.currentRoute.path, {
      queryParams: Object.fromEntries(newParams),
      historyStrategy: 'replace'
    });
  }
}
```

## Advanced Route Configuration

### Dynamic Route Configuration
Create routes programmatically at runtime:

```typescript
export class DynamicRouteManager {
  private router = resolve(IRouter);

  async addDynamicRoute(routeConfig: IChildRouteConfig, context: IRouteContext): Promise<void> {
    // Get the route configuration context
    const routeConfigContext = context.routeConfigContext;
    
    // Add new route to existing configuration
    const newRoutes = [...routeConfigContext.config.routes || [], routeConfig];
    
    // Update configuration (this is a simplified example)
    // In practice, you'd need to handle this through proper route tree updates
    console.log('Adding dynamic route:', routeConfig);
  }

  createConditionalRoute(condition: () => boolean): IChildRouteConfig {
    return {
      path: 'conditional',
      component: condition() ? ComponentA : ComponentB
    };
  }
}
```

### Route Data and Metadata
Advanced usage of route data for feature flags, permissions, and metadata:

```typescript
export interface RouteMetadata {
  requiresAuth?: boolean;
  permissions?: string[];
  feature?: string;
  analytics?: {
    category: string;
    action: string;
  };
  breadcrumb?: {
    label: string;
    icon?: string;
  };
}

@route({
  routes: [
    {
      path: 'admin',
      component: AdminComponent,
      data: {
        requiresAuth: true,
        permissions: ['admin.access'],
        feature: 'admin-panel',
        breadcrumb: { label: 'Administration', icon: 'settings' }
      } as RouteMetadata
    }
  ]
})
export class App {}

// Access route metadata
export class MetadataReader {
  private currentRoute = resolve(ICurrentRoute);

  getRouteMetadata(): RouteMetadata | null {
    const paramInfo = this.currentRoute.parameterInformation[0];
    return paramInfo?.config?.data as RouteMetadata || null;
  }

  checkPermissions(): boolean {
    const metadata = this.getRouteMetadata();
    if (!metadata?.permissions) return true;
    
    return metadata.permissions.every(permission => 
      this.authService.hasPermission(permission)
    );
  }
}
```

## Advanced Viewport Features

### Viewport Agents
Direct interaction with viewport agents for custom behaviors:

```typescript
export class AdvancedViewportController {
  private routeContext = resolve(IRouteContext);

  getViewportAgents(): ViewportAgent[] {
    return this.routeContext.getAvailableViewportAgents();
  }

  async loadComponentInSpecificViewport(
    component: any, 
    viewportName: string
  ): Promise<void> {
    const agents = this.getViewportAgents();
    const targetAgent = agents.find(agent => 
      agent.viewport.name === viewportName
    );

    if (targetAgent) {
      // Advanced viewport manipulation
      console.log('Loading component in viewport:', viewportName);
      // Implementation would involve direct viewport agent manipulation
    }
  }

  monitorViewportChanges(): void {
    const agents = this.getViewportAgents();
    agents.forEach(agent => {
      // Monitor viewport state changes
      console.log('Viewport agent:', agent.viewport.name);
    });
  }
}
```

### Named Viewport Coordination
Coordinate multiple named viewports:

```typescript
export class MultiViewportController {
  private router = resolve(IRouter);

  async loadSiblingComponents(components: {
    [viewportName: string]: any
  }): Promise<boolean> {
    const instructions = Object.entries(components).map(([viewport, component]) => ({
      component,
      viewport
    }));

    return this.router.load(instructions);
  }

  async loadHierarchicalComponents(hierarchy: {
    parent: any;
    children: { [viewport: string]: any };
  }): Promise<boolean> {
    // Load parent first, then children
    const success = await this.router.load(hierarchy.parent);
    if (!success) return false;

    // Load children into named viewports
    return this.loadSiblingComponents(hierarchy.children);
  }
}
```

## Router Events and Hooks Advanced Usage

### Custom Router Event Publisher
Create custom router events for application-specific needs:

```typescript
export class CustomRouterEvents {
  private routerEvents = resolve(IRouterEvents);
  private eventAggregator = resolve(IEventAggregator);

  publishCustomNavigationEvent(eventType: string, data: any): void {
    const customEvent = {
      name: `au:app:${eventType}`,
      timestamp: Date.now(),
      data
    };

    // Publish through event aggregator
    this.eventAggregator.publish(customEvent.name, customEvent);
  }

  subscribeToNavigationPattern(
    pattern: RegExp, 
    callback: (event: any) => void
  ): IDisposable {
    return this.routerEvents.subscribe('au:router:navigation-end', (event) => {
      const path = event.finalInstructions.toPath();
      if (pattern.test(path)) {
        callback(event);
      }
    });
  }
}
```

### Advanced Lifecycle Hook Composition
Compose multiple lifecycle behaviors:

```typescript
export class CompositeLifecycleHook implements IRouteViewModel {
  private hooks: IRouteViewModel[] = [];

  constructor(...hooks: IRouteViewModel[]) {
    this.hooks = hooks;
  }

  async canLoad(params: Params, next: RouteNode, current: RouteNode | null): Promise<boolean> {
    // Run all canLoad hooks
    for (const hook of this.hooks) {
      if (hook.canLoad) {
        const result = await hook.canLoad(params, next, current);
        if (!result) return false;
      }
    }
    return true;
  }

  async loading(params: Params, next: RouteNode, current: RouteNode | null): Promise<void> {
    // Run all loading hooks in parallel
    const promises = this.hooks
      .filter(hook => hook.loading)
      .map(hook => hook.loading!(params, next, current));

    await Promise.all(promises);
  }

  async loaded(params: Params, next: RouteNode, current: RouteNode | null): Promise<void> {
    // Run all loaded hooks in parallel
    const promises = this.hooks
      .filter(hook => hook.loaded)
      .map(hook => hook.loaded!(params, next, current));

    await Promise.all(promises);
  }
}

// Usage
export class MyComponent extends CompositeLifecycleHook {
  constructor() {
    super(
      new AuthenticationHook(),
      new AnalyticsHook(),
      new DataLoadingHook()
    );
  }
}
```

## Advanced Path Generation and Parsing

### Custom Path Generators
Generate complex paths with custom logic:

```typescript
export class AdvancedPathGenerator {
  private router = resolve(IRouter);

  async generatePathWithFallback(
    primary: NavigationInstruction,
    fallback: NavigationInstruction
  ): Promise<string> {
    try {
      return await this.router.generatePath(primary);
    } catch {
      return await this.router.generatePath(fallback);
    }
  }

  generatePathsForPermutations(
    baseRoute: string,
    params: Record<string, string[]>
  ): Promise<string[]> {
    const permutations = this.generatePermutations(params);
    
    return Promise.all(
      permutations.map(permutation =>
        this.router.generatePath(baseRoute, { params: permutation })
      )
    );
  }

  private generatePermutations(params: Record<string, string[]>): Record<string, string>[] {
    const keys = Object.keys(params);
    if (keys.length === 0) return [{}];

    const [firstKey, ...restKeys] = keys;
    const firstValues = params[firstKey];
    const restParams = Object.fromEntries(restKeys.map(key => [key, params[key]]));
    const restPermutations = this.generatePermutations(restParams);

    return firstValues.flatMap(value =>
      restPermutations.map(perm => ({ [firstKey]: value, ...perm }))
    );
  }
}
```

### Route Pattern Matching
Advanced route pattern matching and validation:

```typescript
export class RoutePatternMatcher {
  private router = resolve(IRouter);

  matchesPattern(path: string, pattern: string): boolean {
    // Convert Aurelia route pattern to RegExp
    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)')      // Required params
      .replace(/:[^/]+\?/g, '([^/]*)')    // Optional params
      .replace(/\*/g, '(.*)')             // Wildcard
      .replace(/\//g, '\\/');             // Escape slashes

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  extractParameters(path: string, pattern: string): Record<string, string> {
    const paramNames = this.extractParameterNames(pattern);
    const values = this.extractParameterValues(path, pattern);
    
    return Object.fromEntries(
      paramNames.map((name, index) => [name, values[index] || ''])
    );
  }

  private extractParameterNames(pattern: string): string[] {
    const matches = pattern.match(/:([^/?]+)/g) || [];
    return matches.map(match => match.slice(1).replace('?', ''));
  }

  private extractParameterValues(path: string, pattern: string): string[] {
    const regexPattern = pattern
      .replace(/:[^/]+\?/g, '([^/]*)')
      .replace(/:[^/]+/g, '([^/]+)')
      .replace(/\*/g, '(.*)')
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);
    return match ? match.slice(1) : [];
  }
}
```

## Performance Optimization APIs

### Route Preloading
Preload routes for better performance:

```typescript
export class RoutePreloader {
  private router = resolve(IRouter);
  private preloadedComponents = new Map<string, any>();

  async preloadRoute(route: string): Promise<void> {
    if (this.preloadedComponents.has(route)) return;

    try {
      // Generate instructions without navigating
      const instructions = await this.router.createViewportInstructions(route, null, true);
      
      // Pre-load component modules
      await this.preloadInstructionComponents(instructions);
      
      console.log(`Preloaded route: ${route}`);
    } catch (error) {
      console.warn(`Failed to preload route ${route}:`, error);
    }
  }

  private async preloadInstructionComponents(instructions: any): Promise<void> {
    // Implementation would traverse instruction tree and preload components
    console.log('Preloading components for instructions:', instructions);
  }

  async preloadCriticalRoutes(routes: string[]): Promise<void> {
    await Promise.all(routes.map(route => this.preloadRoute(route)));
  }
}
```

### Route Caching
Cache route resolution for performance:

```typescript
export class RouteCache {
  private cache = new Map<string, any>();
  private maxAge = 5 * 60 * 1000; // 5 minutes

  getCachedRoute(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCachedRoute(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
```

## Best Practices for Advanced Usage

### 1. Resource Management
```typescript
// ✅ Good - Proper cleanup of advanced router features
export class AdvancedRouterFeature {
  private subscriptions: IDisposable[] = [];
  private timers: number[] = [];

  initialize() {
    const subscription = this.routerEvents.subscribe(/* ... */);
    this.subscriptions.push(subscription);
  }

  dispose() {
    this.subscriptions.forEach(sub => sub.dispose());
    this.timers.forEach(timer => clearTimeout(timer));
  }
}
```

### 2. Error Handling in Advanced Scenarios
```typescript
// ✅ Good - Robust error handling for complex operations
export class RobustRouterOperations {
  async performComplexNavigation(): Promise<boolean> {
    try {
      const preloadSuccess = await this.preloadRequiredComponents();
      if (!preloadSuccess) return false;

      const navigationSuccess = await this.router.load(/* ... */);
      if (!navigationSuccess) return false;

      await this.performPostNavigationTasks();
      return true;
    } catch (error) {
      this.handleNavigationError(error);
      return false;
    }
  }
}
```

### 3. Type Safety
```typescript
// ✅ Good - Strong typing for advanced router usage
interface NavigationResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
}

export class TypeSafeRouterOperations {
  async navigateWithResult<T>(
    route: string,
    options?: INavigationOptions
  ): Promise<NavigationResult<T>> {
    try {
      const success = await this.router.load(route, options);
      return { success };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
}
```

This advanced API reference provides developers with comprehensive guidance on leveraging the router's more sophisticated features for complex routing scenarios.
