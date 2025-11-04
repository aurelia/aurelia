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
PLATFORM.taskQueue.queueTask(() => {
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

// Deep observation - watch nested property changes
@computed({ deep: true })
get nestedTotal(): number {
  return this.items.reduce((sum, item) => sum + item.value, 0);
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

#### Manual computed dependencies declaration

[Read more on `@computed` decorator here](../essentials/reactivity.md#decorator-computed).

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

### Binding Behaviors for Performance

#### Throttle Binding Behavior

Limit how often a binding updates, useful for expensive operations triggered by user input:

```html
<!-- Throttle search updates - max once every 300ms -->
<input type="text"
       value.bind="searchQuery & throttle:300">

<!-- Throttle scroll position updates -->
<div scroll.trigger="handleScroll($event) & throttle:100">
  <!-- Content -->
</div>

<!-- Multiple values: delay and signal name -->
<input value.bind="filterText & throttle:200:'filter-changed'">
```

```typescript
import { customElement } from 'aurelia';

@customElement({ name: 'search-box' })
export class SearchBox {
  searchQuery = '';

  // This will only be called max once every 300ms
  searchQueryChanged(newValue: string): void {
    this.performExpensiveSearch(newValue);
  }

  private performExpensiveSearch(query: string): void {
    // Expensive API call or computation
  }
}
```

#### Debounce Binding Behavior

Delay binding updates until user stops typing, ideal for search-as-you-type:

```html
<!-- Wait 500ms after user stops typing before updating -->
<input type="text"
       value.bind="searchTerm & debounce:500">

<!-- Debounce with custom signal -->
<textarea value.bind="content & debounce:1000:'content-saved'">
</textarea>
```

```typescript
import { customElement } from 'aurelia';

@customElement({ name: 'live-search' })
export class LiveSearch {
  searchTerm = '';
  results: any[] = [];

  // Only called 500ms after user stops typing
  async searchTermChanged(newValue: string): Promise<void> {
    if (newValue.length < 3) return;

    // This expensive API call only fires after user stops typing
    this.results = await this.searchAPI.query(newValue);
  }
}
```

**Performance Tips:**
- Use **throttle** for continuous events (scroll, mousemove, resize)
- Use **debounce** for discrete user input (typing, form fields)
- Throttle allows periodic updates; debounce waits for quiet period
- Default delay is 200ms if not specified

### Virtual Repeat Performance

#### Optimize Virtual Repeat for Large Collections

Configure virtual-repeat inline for optimal performance with large datasets:

```html
<!-- Fixed item height - best performance -->
<div virtual-repeat.for="item of items"
     item-height="60"
     buffer-size="20">
  <item-view item.bind="item"></item-view>
</div>

<!-- Horizontal layout -->
<div virtual-repeat.for="item of items"
     layout="horizontal"
     item-width="200"
     buffer-size="10">
  <item-card item.bind="item"></item-card>
</div>

<!-- Configure minimum views -->
<div virtual-repeat.for="item of items"
     item-height="80"
     min-views="15">
  <item-row item.bind="item"></item-row>
</div>
```

#### Virtual Repeat with Variable Heights

For items with varying heights, enable the `variable-height` option:

```html
<!-- Variable height support - Aurelia will measure each item -->
<div virtual-repeat.for="item of items"
     variable-height="true"
     buffer-size="20">
  <div class="item">
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <!-- Heights can vary based on content -->
  </div>
</div>

<!-- Variable width for horizontal layouts -->
<div virtual-repeat.for="item of items"
     layout="horizontal"
     variable-width="true"
     buffer-size="15">
  <item-card item.bind="item"></item-card>
</div>
```

**Performance Note:** Variable sizing has more overhead than fixed sizing. Use fixed heights when possible for best performance.

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
import { resolve } from '@aurelia/kernel';
import { IEventAggregator } from '@aurelia/kernel';
import { customElement } from 'aurelia';

@customElement({ name: 'subscription-component' })
export class SubscriptionComponent {
  private eventAggregator = resolve(IEventAggregator);
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

  private handleEvent(data: unknown): void {
    // Handle event
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

### Observable Batching

#### Batch Multiple State Changes

When making multiple property changes, use `batch()` to combine them into a single change notification:

```typescript
import { batch, observable } from '@aurelia/runtime';
import { customElement } from 'aurelia';

@customElement({ name: 'user-profile' })
export class UserProfile {
  @observable firstName = '';
  @observable lastName = '';
  @observable email = '';
  @observable phoneNumber = '';

  // Without batching: 4 separate change notifications
  updateUserSlow(data: UserData): void {
    this.firstName = data.firstName;    // triggers update
    this.lastName = data.lastName;      // triggers update
    this.email = data.email;            // triggers update
    this.phoneNumber = data.phoneNumber; // triggers update
  }

  // With batching: 1 combined change notification
  updateUserFast(data: UserData): void {
    batch(() => {
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.email = data.email;
      this.phoneNumber = data.phoneNumber;
      // All changes are batched into a single update cycle
    });
  }
}
```

#### Batch Array Mutations

Batch multiple array operations to prevent repeated re-renders:

```typescript
import { batch, observable } from '@aurelia/runtime';
import { customElement } from 'aurelia';

@customElement({ name: 'todo-list' })
export class TodoList {
  @observable items: TodoItem[] = [];

  // Batch multiple array operations
  bulkUpdate(updates: TodoUpdate[]): void {
    batch(() => {
      for (const update of updates) {
        if (update.action === 'add') {
          this.items.push(update.item);
        } else if (update.action === 'remove') {
          const index = this.items.indexOf(update.item);
          if (index > -1) this.items.splice(index, 1);
        } else if (update.action === 'update') {
          Object.assign(update.item, update.changes);
        }
      }
      // Only one change notification for all operations
    });
  }
}
```

**Performance Benefits:**
- Reduces the number of change notifications
- Prevents unnecessary intermediate UI updates
- Particularly effective when updating multiple related properties
- Essential for bulk data operations

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
import { observable } from '@aurelia/runtime';
import { customElement } from 'aurelia';

interface IDataService {
  getItems(offset: number, limit: number): Promise<Item[]>;
}

@customElement({ name: 'infinite-scroll' })
export class InfiniteScroll {
  private loadingMore = false;
  private hasMore = true;
  private scrollContainer!: HTMLElement;

  @observable items: Item[] = [];

  attached(): void {
    this.scrollContainer.addEventListener('scroll', this.onScroll.bind(this));
  }

  detached(): void {
    this.scrollContainer.removeEventListener('scroll', this.onScroll.bind(this));
  }

  private onScroll(): void {
    if (this.loadingMore || !this.hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = this.scrollContainer;
    const threshold = 200;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      void this.loadMoreItems();
    }
  }

  private async loadMoreItems(): Promise<void> {
    this.loadingMore = true;

    try {
      // Fetch from your data service
      const newItems = await this.fetchItems(this.items.length, 20);
      this.items.push(...newItems);
      this.hasMore = newItems.length === 20;
    } finally {
      this.loadingMore = false;
    }
  }

  private async fetchItems(offset: number, limit: number): Promise<Item[]> {
    // Your API call here
    return [] as Item[];
  }
}
```

### Data Streaming

#### Streaming Large Datasets

```typescript
import { customElement } from 'aurelia';
import { PLATFORM } from 'aurelia';

@customElement({ name: 'data-stream' })
export class DataStream {
  private items: Item[] = [];
  private processingQueue: Item[] = [];

  async loadData(): Promise<void> {
    const stream = this.getStreamingData();

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
    await new Promise<void>(resolve => {
      PLATFORM.taskQueue.queueTask(() => {
        this.items.push(...batch);
        resolve();
      });
    });
  }

  private async *getStreamingData(): AsyncGenerator<Item[]> {
    // Your streaming data source
    // Example: fetch data in chunks from API
    yield [] as Item[];
  }
}
```

## Performance Monitoring

### Runtime Performance Profiling

#### Task Queue Monitoring

```typescript
import { PLATFORM } from 'aurelia';

// Enable task queue debugging
PLATFORM.taskQueue._tracer.enabled = true;

// Monitor queue performance
class TaskQueueMonitor {
  private taskCounts = new Map<string, number>();
  private originalQueueTask?: typeof PLATFORM.taskQueue.queueTask;

  startMonitoring(): void {
    this.originalQueueTask = PLATFORM.taskQueue.queueTask.bind(PLATFORM.taskQueue);

    PLATFORM.taskQueue.queueTask = (callback: any, options?: any) => {
      const name = callback.name || 'anonymous';
      this.taskCounts.set(name, (this.taskCounts.get(name) || 0) + 1);

      return this.originalQueueTask!(callback, options);
    };
  }

  stopMonitoring(): void {
    if (this.originalQueueTask) {
      PLATFORM.taskQueue.queueTask = this.originalQueueTask;
    }
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

## Real-World Performance Scenarios

### Scenario 1: Optimized Data Grid

Build a high-performance data grid with 10,000+ rows:

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'data-grid',
  template: `
    <div class="grid-container">
      <div class="grid-header">
        <input type="text"
               value.bind="filterText & debounce:300"
               placeholder="Search...">
      </div>

      <div class="grid-body"
           virtual-repeat.for="row of filteredRows"
           item-height="40"
           buffer-size="20">
        <div class="grid-row">
          <span>\${row.id}</span>
          <span>\${row.name}</span>
          <span>\${row.email}</span>
        </div>
      </div>
    </div>
  `
})
export class DataGrid {
  rows: DataRow[] = [];
  filterText = '';

  @computed({ deps: ['rows', 'filterText'] })
  get filteredRows(): DataRow[] {
    if (!this.filterText) return this.rows;

    const search = this.filterText.toLowerCase();
    return this.rows.filter(row =>
      row.name.toLowerCase().includes(search) ||
      row.email.toLowerCase().includes(search)
    );
  }
}
```

**Performance Features Used:**
- `debounce` prevents filtering on every keystroke
- `virtual-repeat` renders only visible rows
- `@computed` with explicit deps caches filter results
- Fixed `item-height` enables optimal scrolling

### Scenario 2: Real-Time Dashboard Updates

Handle high-frequency updates efficiently:

```typescript
import { batch, observable } from '@aurelia/runtime';
import { customElement, resolve } from 'aurelia';
import { PLATFORM } from 'aurelia';

@customElement({ name: 'live-dashboard' })
export class LiveDashboard {
  @observable metrics: DashboardMetrics = {
    activeUsers: 0,
    requestsPerSecond: 0,
    errorRate: 0,
    avgResponseTime: 0
  };

  private updateTask?: any;

  attaching(): void {
    // Batch multiple metric updates together
    this.updateTask = PLATFORM.taskQueue.queueTask(() => {
      this.updateMetrics();
    }, { persistent: true, delay: 1000 });
  }

  detaching(): void {
    this.updateTask?.cancel();
  }

  private updateMetrics(): void {
    // Fetch latest metrics from API
    const newMetrics = this.fetchLatestMetrics();

    // Use batch to update all metrics at once
    batch(() => {
      this.metrics.activeUsers = newMetrics.activeUsers;
      this.metrics.requestsPerSecond = newMetrics.requestsPerSecond;
      this.metrics.errorRate = newMetrics.errorRate;
      this.metrics.avgResponseTime = newMetrics.avgResponseTime;
    });
  }

  private fetchLatestMetrics(): DashboardMetrics {
    // API call
    return {} as DashboardMetrics;
  }
}
```

**Performance Features Used:**
- `batch()` combines multiple updates into one notification
- Persistent task with delay for regular updates
- Task cancellation on component detach prevents leaks

### Scenario 3: Image Gallery with Lazy Loading

Optimize large image galleries:

```html
<!-- image-gallery.html -->
<div class="gallery">
  <div virtual-repeat.for="image of images"
       variable-height="true"
       buffer-size="15"
       layout="horizontal">
    <img src.bind="image.thumbnail"
         loading="lazy"
         alt="\${image.title}">
  </div>
</div>
```

```typescript
import { customElement } from 'aurelia';

@customElement({ name: 'image-gallery' })
export class ImageGallery {
  images: GalleryImage[] = [];

  async attached(): Promise<void> {
    // Load images in chunks
    await this.loadImagesInChunks();
  }

  private async loadImagesInChunks(): Promise<void> {
    const chunkSize = 50;
    const allImages = await this.fetchAllImageMetadata();

    for (let i = 0; i < allImages.length; i += chunkSize) {
      const chunk = allImages.slice(i, i + chunkSize);

      // Use task queue to prevent blocking
      await new Promise<void>(resolve => {
        PLATFORM.taskQueue.queueTask(() => {
          this.images.push(...chunk);
          resolve();
        });
      });
    }
  }

  private async fetchAllImageMetadata(): Promise<GalleryImage[]> {
    // Fetch from API
    return [] as GalleryImage[];
  }
}
```

**Performance Features Used:**
- `variable-height` handles different aspect ratios
- Native lazy loading with `loading="lazy"`
- Task queue prevents UI blocking during data loading
- Chunked loading for progressive rendering

### Scenario 4: Complex Form with Validation

Optimize forms with many fields:

```typescript
import { batch, observable } from '@aurelia/runtime';
import { customElement } from 'aurelia';

@customElement({ name: 'complex-form' })
export class ComplexForm {
  @observable formData: FormData = {
    personalInfo: {},
    address: {},
    preferences: {},
    settings: {}
  };

  // Debounce validation to avoid excessive checks
  template = `
    <form>
      <input value.bind="formData.personalInfo.firstName & debounce:200">
      <input value.bind="formData.personalInfo.lastName & debounce:200">
      <input value.bind="formData.personalInfo.email & debounce:300">
      <!-- More fields... -->
    </form>
  `;

  loadFormData(data: FormData): void {
    // Batch all field updates
    batch(() => {
      Object.assign(this.formData.personalInfo, data.personalInfo);
      Object.assign(this.formData.address, data.address);
      Object.assign(this.formData.preferences, data.preferences);
      Object.assign(this.formData.settings, data.settings);
    });
  }

  @computed({ flush: 'async' })
  get isFormValid(): boolean {
    // Expensive validation runs asynchronously
    return this.validateAllFields();
  }

  private validateAllFields(): boolean {
    // Validation logic
    return true;
  }
}
```

**Performance Features Used:**
- `debounce` on inputs reduces validation frequency
- `batch()` when loading initial form data
- Async flush for validation computation
- Object.assign for efficient property updates

## Best Practices Summary

### 1. Framework Usage
- Use `PLATFORM.taskQueue` for DOM updates and async operations
- Implement memoization with `createStateMemoizer` for expensive state computations
- Choose appropriate flush modes (`sync` or `async`) for computed properties
- Optimize watch expressions and prefer computed properties
- Use `throttle` for continuous events, `debounce` for discrete user input
- Enable `deep` observation only when needed for nested objects

### 2. Memory Management
- Always clean up event listeners and subscriptions in `detaching()`
- Use WeakMap for metadata storage that should be garbage collected
- Avoid circular references or use explicit cleanup
- Cancel persistent tasks when components detach
- Monitor memory usage during development

### 3. Data Handling
- Implement virtual-repeat for lists with 100+ items
- Use fixed `item-height` for best virtual-repeat performance
- Enable `variable-height` only when necessary
- Use pagination or infinite scroll for large datasets
- Process data in batches with `batch()` to avoid blocking the UI
- Stream large datasets when possible using task queue

### 4. Binding Optimization
- Use `debounce` on form inputs (300-500ms for text, 200ms for other fields)
- Use `throttle` on scroll/resize/mousemove handlers (100-200ms)
- Batch multiple observable changes with `batch()`
- Prefer `@computed` with explicit `deps` over complex expressions in templates
- Use `flush: 'async'` (default) unless immediate updates are critical

### 5. Build Optimization
- Configure tree shaking properly in your bundler
- Use code splitting for routes and large components
- Optimize bundle size with selective imports
- Implement service worker caching for production apps
- Minify and compress assets

### 6. Performance Monitoring
- Profile task queue usage with `PLATFORM.taskQueue._tracer.enabled = true`
- Monitor component lifecycle performance
- Track memory usage patterns with browser DevTools
- Use performance metrics to identify bottlenecks
- Test with realistic data volumes

These optimization techniques will help you build high-performance Aurelia applications that scale well and provide excellent user experiences.

