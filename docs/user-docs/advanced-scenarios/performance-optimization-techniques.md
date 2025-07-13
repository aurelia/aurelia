# Performance Optimization Techniques

This guide covers advanced performance optimization techniques for Aurelia applications, including framework-specific optimizations, build configuration, and best practices for high-performance applications.

## Framework-Specific Optimizations

### Task Queue Performance

The Aurelia task queue provides several performance optimization features:

#### Task Batching

Batch DOM updates to improve rendering performance:

```typescript
import { PLATFORM } from 'aurelia';

// Batch multiple DOM updates in a single frame
PLATFORM.domQueue.queueTask(() => {
  // All DOM changes execute in the same animation frame
  element1.style.left = '100px';
  element2.style.top = '200px';
  element3.textContent = 'Updated';
});
```

#### Preemptive Task Execution

Use `preempt` for critical tasks that need immediate execution:

```typescript
// Runs synchronously if queue is currently flushing
PLATFORM.taskQueue.queueTask(() => {
  updateCriticalUI();
}, { preempt: true });
```

#### Suspend Queue for Critical Operations

Use `suspend` to ensure critical async operations complete before other tasks:

```typescript
// Blocks subsequent tasks until this completes
PLATFORM.taskQueue.queueTask(async () => {
  await criticalDataOperation();
}, { suspend: true });
```

### State Management Performance

#### Memoization System

Use the built-in memoization system for expensive computations:

```typescript
import { createStateMemoizer } from '@aurelia/state';

// Single selector memoization
const selectTotal = createStateMemoizer(
  (state: AppState) => state.items,
  (items) => items.reduce((sum, item) => sum + item.value, 0)
);

// Usage in component
@customElement({ name: 'dashboard' })
export class Dashboard {
  @fromState(selectTotal) total: number;
}
```

#### Shared Memoization

Share memoized selectors across components for better performance:

```typescript
// Define once, use everywhere
const selectFilteredItems = createStateMemoizer(
  (state: AppState) => state.items,
  (state: AppState) => state.filter,
  (items, filter) => items.filter(item => item.category === filter)
);

// Multiple components share the same computation
@customElement({ name: 'item-list' })
export class ItemList {
  @fromState(selectFilteredItems) items: Item[];
}

@customElement({ name: 'item-count' })
export class ItemCount {
  @fromState(selectFilteredItems) items: Item[];
  
  get count(): number {
    return this.items.length;
  }
}
```

### Computed Observer Performance

#### Sync vs Async Flush Modes

Choose the appropriate flush mode for computed properties:

```typescript
// Async mode (default) - better performance for most cases
@computed()
get expensiveCalculation(): number {
  return this.complexComputation();
}

// Sync mode - for critical computations that need immediate updates
@computed({ flush: 'sync' })
get criticalValue(): number {
  return this.criticalComputation();
}
```

#### Computed Property Optimization

Optimize computed properties for better performance:

```typescript
export class OptimizedComponent {
  private _memoizedResult: number | null = null;
  private _lastInputs: [number, number] | null = null;

  @computed()
  get optimizedCalculation(): number {
    const inputs: [number, number] = [this.input1, this.input2];
    
    // Manual memoization for expensive calculations
    if (this._lastInputs && 
        this._lastInputs[0] === inputs[0] && 
        this._lastInputs[1] === inputs[1]) {
      return this._memoizedResult!;
    }
    
    this._lastInputs = inputs;
    this._memoizedResult = this.expensiveComputation(inputs[0], inputs[1]);
    return this._memoizedResult;
  }
}
```

### Watch Performance Optimization

#### Efficient Watch Expressions

Use efficient watch expressions to minimize performance impact:

```typescript
export class OptimizedWatching {
  // Good: Watch specific properties
  @watch('user.profile.name')
  onUserNameChange(newName: string): void {
    this.updateDisplay(newName);
  }

  // Better: Use computed properties for complex expressions
  @computed()
  get userDisplayName(): string {
    return `${this.user.profile.firstName} ${this.user.profile.lastName}`;
  }

  @watch('userDisplayName')
  onDisplayNameChange(newName: string): void {
    this.updateDisplay(newName);
  }
}
```

#### Watch Flush Timing

Control when watch callbacks execute:

```typescript
// Async flush (default) - better performance
@watch('counter')
onCounterChange(newValue: number): void {
  // Executes in next microtask
  this.performUpdate(newValue);
}

// Sync flush - for critical updates
@watch('criticalValue', { flush: 'sync' })
onCriticalValueChange(newValue: number): void {
  // Executes immediately
  this.updateCriticalUI(newValue);
}
```

### Virtual Repeat Performance

#### Optimize Virtual Repeat for Large Collections

```typescript
@customElement({
  name: 'optimized-list',
  template: `
    <div virtual-repeat.for="item of items" 
         virtual-repeat.with="optimizedConfig">
      <item-view item.bind="item"></item-view>
    </div>
  `
})
export class OptimizedList {
  items: Item[] = [];
  
  optimizedConfig = {
    // Increase buffer size for smoother scrolling
    bufferSize: 20,
    
    // Use fixed item height for better performance
    itemHeight: 60,
    
    // Enable scrolling optimization
    scrollThrottle: 16
  };
}
```

#### Virtual Repeat with Dynamic Heights

```typescript
@customElement({ name: 'dynamic-list' })
export class DynamicList {
  items: Item[] = [];
  
  // Pre-calculate heights for performance
  itemHeights = new Map<string, number>();
  
  getItemHeight(item: Item): number {
    if (!this.itemHeights.has(item.id)) {
      this.itemHeights.set(item.id, this.calculateHeight(item));
    }
    return this.itemHeights.get(item.id)!;
  }
  
  private calculateHeight(item: Item): number {
    // Calculate height based on content
    return item.content.length > 100 ? 120 : 60;
  }
}
```

## Build Optimization

### Bundle Size Optimization

#### Tree Shaking Configuration

Configure your bundler for optimal tree shaking:

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    minimize: true,
  },
  resolve: {
    mainFields: ['module', 'main']
  }
};
```

#### Selective Imports

Import only what you need from Aurelia packages:

```typescript
// Good: Import specific functions
import { observable, computed } from 'aurelia';

// Better: Import from specific modules
import { observable } from '@aurelia/runtime';
import { computed } from '@aurelia/runtime';

// Best: Use direct imports for better tree shaking
import { observable } from '@aurelia/runtime/dist/esm/observation/observable';
```

### Code Splitting

#### Route-Based Code Splitting

Split your application by routes for better loading performance:

```typescript
// Lazy load route components
@route({
  routes: [
    { path: '', component: () => import('./home') },
    { path: 'dashboard', component: () => import('./dashboard') },
    { path: 'settings', component: () => import('./settings') }
  ]
})
export class App { }
```

#### Component-Based Code Splitting

Split large components into separate chunks:

```typescript
// Dynamic component loading
@customElement({ name: 'lazy-component' })
export class LazyComponent {
  private heavyComponent: Promise<any>;
  
  binding(): void {
    this.heavyComponent = import('./heavy-component');
  }
}
```

### Production Optimization

#### Minification and Compression

Configure production builds for optimal performance:

```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['aurelia'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
});
```

#### Service Worker Integration

Implement caching strategies for better performance:

```typescript
// service-worker.ts
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Cache API responses
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

## Memory Management

### Component Cleanup

#### Proper Event Listener Cleanup

```typescript
@customElement({ name: 'event-component' })
export class EventComponent {
  private resizeHandler = this.onResize.bind(this);
  
  attached(): void {
    window.addEventListener('resize', this.resizeHandler);
  }
  
  detached(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }
  
  private onResize(): void {
    // Handle resize
  }
}
```

#### Subscription Management

```typescript
@customElement({ name: 'subscription-component' })
export class SubscriptionComponent {
  private subscriptions: Subscription[] = [];
  
  attached(): void {
    this.subscriptions.push(
      this.eventAggregator.subscribe('event', this.handleEvent.bind(this))
    );
  }
  
  detached(): void {
    this.subscriptions.forEach(sub => sub.dispose());
    this.subscriptions = [];
  }
}
```

### Memory Leak Prevention

#### Avoid Circular References

```typescript
// Avoid this pattern
export class Parent {
  children: Child[] = [];
  
  addChild(child: Child): void {
    child.parent = this; // Circular reference
    this.children.push(child);
  }
}

// Better approach
export class Parent {
  children: Child[] = [];
  
  addChild(child: Child): void {
    child.setParent(this);
    this.children.push(child);
  }
  
  dispose(): void {
    this.children.forEach(child => child.setParent(null));
    this.children = [];
  }
}
```

#### WeakMap for Metadata

Use WeakMap for storing metadata that should be garbage collected:

```typescript
const componentMetadata = new WeakMap<object, ComponentMetadata>();

export class MetadataManager {
  static setMetadata(component: object, metadata: ComponentMetadata): void {
    componentMetadata.set(component, metadata);
  }
  
  static getMetadata(component: object): ComponentMetadata | undefined {
    return componentMetadata.get(component);
  }
}
```

## Large Data Handling

### Pagination Strategies

#### Virtual Pagination

```typescript
@customElement({ name: 'virtual-pagination' })
export class VirtualPagination {
  private allItems: Item[] = [];
  private pageSize = 50;
  private currentPage = 0;
  
  get visibleItems(): Item[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.allItems.slice(start, end);
  }
  
  loadMoreItems(): void {
    if (this.hasMoreItems) {
      this.currentPage++;
    }
  }
  
  get hasMoreItems(): boolean {
    return (this.currentPage + 1) * this.pageSize < this.allItems.length;
  }
}
```

#### Infinite Scroll

```typescript
@customElement({ name: 'infinite-scroll' })
export class InfiniteScroll {
  private loadingMore = false;
  private hasMore = true;
  
  @observable items: Item[] = [];
  
  attached(): void {
    this.scrollContainer.addEventListener('scroll', this.onScroll.bind(this));
  }
  
  private onScroll(): void {
    if (this.loadingMore || !this.hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = this.scrollContainer;
    const threshold = 200;
    
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      this.loadMoreItems();
    }
  }
  
  private async loadMoreItems(): Promise<void> {
    this.loadingMore = true;
    
    try {
      const newItems = await this.dataService.getItems(this.items.length, 20);
      this.items.push(...newItems);
      this.hasMore = newItems.length === 20;
    } finally {
      this.loadingMore = false;
    }
  }
}
```

### Data Streaming

#### Streaming Large Datasets

```typescript
@customElement({ name: 'data-stream' })
export class DataStream {
  private items: Item[] = [];
  private processingQueue: Item[] = [];
  
  async loadData(): Promise<void> {
    const stream = this.dataService.getStreamingData();
    
    for await (const chunk of stream) {
      this.processingQueue.push(...chunk);
      
      // Process in batches to avoid blocking the UI
      if (this.processingQueue.length >= 100) {
        await this.processBatch();
      }
    }
    
    // Process remaining items
    if (this.processingQueue.length > 0) {
      await this.processBatch();
    }
  }
  
  private async processBatch(): Promise<void> {
    const batch = this.processingQueue.splice(0, 100);
    
    // Process batch in task queue to avoid blocking
    await new Promise(resolve => {
      PLATFORM.taskQueue.queueTask(() => {
        this.items.push(...batch);
        resolve(void 0);
      });
    });
  }
}
```

## Performance Monitoring

### Runtime Performance Profiling

#### Task Queue Monitoring

```typescript
// Enable task queue debugging
PLATFORM.taskQueue._tracer.enabled = true;

// Monitor queue performance
class TaskQueueMonitor {
  private taskCounts = new Map<string, number>();
  
  startMonitoring(): void {
    const originalQueueTask = PLATFORM.taskQueue.queueTask;
    
    PLATFORM.taskQueue.queueTask = (callback, options) => {
      const name = callback.name || 'anonymous';
      this.taskCounts.set(name, (this.taskCounts.get(name) || 0) + 1);
      
      return originalQueueTask.call(PLATFORM.taskQueue, callback, options);
    };
  }
  
  getTaskStatistics(): Map<string, number> {
    return new Map(this.taskCounts);
  }
}
```

#### Performance Metrics Collection

```typescript
class PerformanceMetrics {
  private metrics: Map<string, number[]> = new Map();
  
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(end - start);
    return result;
  }
  
  getAverageTime(name: string): number {
    const times = this.metrics.get(name) || [];
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  getPercentile(name: string, percentile: number): number {
    const times = this.metrics.get(name) || [];
    const sorted = times.sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile / 100);
    return sorted[index];
  }
}
```

## Best Practices Summary

### 1. Framework Usage
- Use task queue for DOM updates and async operations
- Implement memoization for expensive computations
- Choose appropriate flush modes for computed properties
- Optimize watch expressions and use computed properties

### 2. Memory Management
- Always clean up event listeners and subscriptions
- Use WeakMap for metadata storage
- Avoid circular references
- Monitor memory usage during development

### 3. Data Handling
- Implement virtual scrolling for large lists
- Use pagination or infinite scroll for large datasets
- Process data in batches to avoid blocking the UI
- Stream large datasets when possible

### 4. Build Optimization
- Configure tree shaking properly
- Use code splitting for routes and components
- Optimize bundle size with selective imports
- Implement service worker caching

### 5. Performance Monitoring
- Profile task queue usage
- Monitor component lifecycle performance
- Track memory usage patterns
- Use performance metrics to identify bottlenecks

These optimization techniques will help you build high-performance Aurelia applications that scale well and provide excellent user experiences.

