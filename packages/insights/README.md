[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/insights.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/insights)

# Aurelia Insights

The Aurelia Insights package provides performance monitoring capabilities for Aurelia 2 applications, including specialized tracking for template controllers and components.

## Features

### 🎯 Automatic Framework Tracking
- **Component Lifecycle Tracking**: Monitor the performance of component lifecycle methods (binding, bound, attaching, attached, detaching, unbinding)
- **Router Lifecycle Hook Tracking**: Measure the performance of router lifecycle hooks to identify slow loading operations
- **Chrome DevTools Integration**: Measurements appear directly in Chrome DevTools Performance tab using the Extensibility API
- **Zero-overhead when disabled**: No performance impact when the plugin is disabled

### 📊 Custom Telemetry APIs (New!)
**Inspired by .NET Core's telemetry approach** - opt-in, developer-controlled instrumentation:

- **Custom Meters**: Create your own application-specific metrics (counters, histograms, gauges)
- **Activity Sources**: Custom tracing for business logic operations
- **Event Recording**: Track custom application events with rich metadata
- **Structured Telemetry**: Separate metrics, traces, and events for better observability
- **Developer Control**: "Measure everything relevant to your application"

## Installation

```bash
npm install @aurelia/insights
```

## Quick Start

### Automatic Framework Tracking

```typescript
import { Aurelia } from 'aurelia';
import { InsightsPlugin } from '@aurelia/insights';

// Enable with default settings
Aurelia
  .register(InsightsPlugin.DefaultConfiguration)
  .app(app)
  .start();
```

### Custom Telemetry (Opt-in)

```typescript
import { Aurelia } from 'aurelia';
import { InsightsPlugin, ITelemetryService } from '@aurelia/insights';

// Enable with telemetry support
Aurelia
  .register(InsightsPlugin.configure({
    enabled: true,
    trackName: 'MyApp',
    trackGroup: 'Business Logic'
  }))
  .app(app)
  .start();

// In your service/component
export class ProductService {
  private readonly productMeter;
  private readonly productActivitySource;
  private readonly ordersProcessed;
  private readonly apiResponseTime;

  private telemetry = resolve(ITelemetryService);

  constructor() {
    // Create custom meter for your metrics
    this.productMeter = this.telemetry.createMeter('MyApp.ProductService');

    // Create specific metrics you care about
    this.ordersProcessed = this.productMeter.createCounter('orders.processed', 'Orders processed count');
    this.apiResponseTime = this.productMeter.createHistogram('api.response_time', 'API response time', 'ms');

    // Create activity source for tracing business operations
    this.productActivitySource = this.telemetry.createActivitySource('MyApp.ProductService');
  }

  async processOrder(order: Order) {
    // Track business metrics
    this.ordersProcessed.add(1, { category: order.category });

    // Trace the operation with detailed context
    const activity = this.productActivitySource.startActivity('ProcessOrder');
    activity?.setTag('order.id', order.id);
    activity?.setTag('order.total', order.total);

    try {
      const result = await this.doOrderProcessing(order);
      activity?.setTag('success', true);
      return result;
    } catch (error) {
      activity?.setTag('success', false);
      activity?.addEvent('error', { message: String(error) });
      throw error;
    } finally {
      activity?.dispose();
    }
  }
}
```

## Router Lifecycle Hook Tracking

The plugin tracks router lifecycle hooks to help identify performance bottlenecks in your routing logic. **Most importantly**, it measures the **distance** between router lifecycle events to give you true loading performance insights.

### How It Works

The plugin measures the **time distance** between key lifecycle events:

1. **Loading → Attached**: 🎯 **Most Important** - Measures from when `loading` starts until the component is fully `attached` to the DOM
2. **Individual Hook Performance**: Standalone measurements for `canLoad`, `canUnload`, and `unloading` hooks

This approach captures the **real loading time** - from when your component starts loading (including any async API calls) until it's completely ready and rendered.

### Tracked Router Hooks

- **`loading` → `attached`**: 🎯 **Primary Measurement** - The complete loading journey from start to fully rendered

This is the most important measurement as it captures the real user experience - from when navigation starts until the component is completely ready and visible to the user.

### Configuration

```typescript
import { Aurelia } from 'aurelia';
import { InsightsPlugin } from '@aurelia/insights';

// Simple router tracking (recommended)
Aurelia
  .register(InsightsPlugin.configure({
    enabled: true,
    enableRouterTracking: true,  // 🎯 Tracks loading→attached distance automatically
  }))
  .app(app)
  .start();
```

## Repeat Template Controller Performance Tracking

The insights package includes a performance-enhanced version of the `repeat` template controller that automatically tracks:

- **Binding and unbinding performance**: Measures how long it takes to set up data bindings
- **View creation and destruction timing**: Tracks the time to create/destroy views for collection items
- **Collection change operations**: Monitors performance when items are added, removed, or reordered
- **Large collection handling optimizations**: Uses smart batching to avoid overwhelming DevTools

### Features

- **🔄 Drop-in replacement**: Works with all existing `repeat.for` syntax
- **🧠 Smart tracking**: Automatically switches between detailed and summary tracking based on collection size
- **📊 Rich metadata**: Includes item counts, operation types, and performance characteristics
- **⚡ Zero overhead**: Configurable thresholds prevent performance impact from tracking itself

### Configuration

```typescript
Aurelia.register(
  InsightsPlugin.configure({
    enabled: true,
    repeatPerformance: {
      enabled: true,                        // Enable repeat tracking
      detailedTrackingThreshold: 100,       // Use summary tracking for collections > 100 items
      batchOperationThreshold: 10,          // Operations affecting > 10 items marked as "large"
      trackIndividualOperations: true,      // Track individual add/remove operations
      color: 'secondary'                    // DevTools color for repeat measurements
    }
  })
);
```

### Performance Tab Integration

When enabled, repeat performance tracking appears in Chrome DevTools Performance tab with descriptive names:

- `Repeat • Attaching (50 items) • ProductList_a1b2` - Creating views for 50 items
- `Repeat • Collection Change (add:5, remove:2, move:3) • ProductList_a1b2` - Collection update details
- `Repeat • Items Changed (1000 items) • ProductList_a1b2` - Large collection refresh

### Template Usage

No changes needed in your templates - works with all existing repeat syntax:

```html
<!-- Standard repeat usage -->
<div repeat.for="item of items">
  ${item.name}
</div>

<!-- With key for optimized updates -->
<div repeat.for="item of items; key: item.id">
  ${item.name}
</div>

<!-- Complex expressions and destructuring -->
<div repeat.for="[index, item] of items.entries()">
  ${index}: ${item.name}
</div>

<!-- All existing repeat features supported -->
<div repeat.for="product of products | sort:'name' & throttle:500">
  <product-card product.bind="product"></product-card>
</div>
```

### Avoiding Performance Spam

The repeat tracking is designed to provide insights without overwhelming Chrome DevTools:

1. **🎯 Threshold-based tracking**: Collections larger than the configured threshold use summary measurements
2. **📦 Batched operations**: Multiple related operations are grouped into single measurements
3. **📝 Descriptive names**: Clear, concise measurement names with relevant context
4. **🔧 Configurable**: Can be disabled entirely or fine-tuned per application needs

### What Gets Tracked

| Operation | Small Collections (<100 items) | Large Collections (>100 items) |
|-----------|--------------------------------|--------------------------------|
| **Initial Render** | `Repeat • Attaching (25 items)` | `Repeat • Attaching (1500 items)` |
| **Items Added** | `Repeat • Collection Change (add:3)` | `Repeat • Collection Change (add:150)` |
| **Items Removed** | `Repeat • Collection Change (remove:2)` | `Repeat • Collection Change (remove:75)` |
| **Items Reordered** | `Repeat • Collection Change (move:5)` | `Repeat • Collection Change (mixed)` |
| **Full Refresh** | `Repeat • Items Changed (25→30 items)` | `Repeat • Items Changed (1500 items)` |

### Best Practices

- **🔍 Development**: Use lower thresholds (25-50) to catch performance issues early
- **🚀 Production**: Use higher thresholds (100-500) to reduce measurement overhead
- **📈 Monitor trends**: Watch for increasing collection sizes that might need virtualization
- **🎯 Optimize based on data**: Use metadata to identify which repeaters need optimization

### Example: Identifying Performance Issues

```typescript
// In Chrome DevTools Performance tab, you might see:
// ⚠️  "Repeat • Attaching (2000 items) • ProductGrid_x7z9" - 850ms
// ⚠️  "Repeat • Collection Change (add:500) • ProductGrid_x7z9" - 320ms

// This suggests the ProductGrid component might benefit from:
// 1. Virtual scrolling for large collections
// 2. Pagination to reduce initial load
// 3. Optimized item templates
// 4. Better key strategies for faster updates

export class ProductGridComponent {
  // Add virtual scrolling for large collections
  @bindable virtualScrolling: boolean = true;
  @bindable pageSize: number = 50;

  // Use efficient keys for better update performance
  get optimizedProducts() {
    return this.virtualScrolling && this.products.length > 100
      ? this.products.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize)
      : this.products;
  }
}
```

## Custom Telemetry API Reference

### Telemetry Service

The `ITelemetryService` is your entry point for creating custom telemetry:

```typescript
interface ITelemetryService {
  createMeter(name: string, version?: string): ITelemetryMeter;
  createActivitySource(name: string, version?: string): IActivitySource;
  getMeter(name: string, version?: string): ITelemetryMeter;
  getActivitySource(name: string, version?: string): IActivitySource;
}
```

### Meters and Metrics

Create custom metrics to track what matters to your application:

```typescript
// Create a meter for your service/component
const meter = telemetryService.createMeter('MyApp.UserService', '1.0.0');

// Counter: Tracks incrementing values
const userLogins = meter.createCounter('user.logins', 'User login count');
userLogins.add(1, { method: 'google', success: true });

// Histogram: Tracks value distributions (perfect for response times, sizes)
const queryTime = meter.createHistogram('db.query_time', 'Database query time', 'ms');
queryTime.record(150, { table: 'users', operation: 'select' });

// Gauge: Tracks current values (memory usage, queue length, etc.)
const activeUsers = meter.createGauge('users.active', 'Currently active users');
activeUsers.set(42, { region: 'us-west' });

// Events: Record discrete events with rich metadata
meter.recordEvent('user.registration', {
  user_id: '12345',
  plan: 'premium',
  referral_source: 'google_ads'
});
```

### Activity Sources and Tracing

Trace complex operations with custom activities:

```typescript
// Create an activity source
const activitySource = telemetryService.createActivitySource('MyApp.PaymentService');

// Manual activity management
const activity = activitySource.startActivity('ProcessPayment');
activity?.setTag('payment.method', 'credit_card');
activity?.setTag('payment.amount', 99.99);

try {
  activity?.addEvent('validation.start');
  await validatePayment(payment);
  activity?.addEvent('validation.complete');

  activity?.addEvent('charge.start');
  const result = await chargePayment(payment);
  activity?.addEvent('charge.complete');

  activity?.setTag('success', true);
  return result;
} catch (error) {
  activity?.setTag('success', false);
  activity?.addEvent('error', { message: String(error) });
  throw error;
} finally {
  activity?.dispose(); // Always dispose to end the measurement
}

// Or use the helper for automatic disposal
import { withActivity } from '@aurelia/insights';

return await withActivity(
  activitySource,
  'ProcessPayment',
  async (activity) => {
    activity?.setTag('payment.method', 'credit_card');

    const result = await chargePayment(payment);
    activity?.setTag('transaction.id', result.transactionId);

    return result;
  },
  { initial: 'metadata' }
);
```

## Real-World Examples

### E-commerce Application

```typescript
export class ProductService {
  private telemetry = resolve(ITelemetryService);

  constructor() {
    this.productMeter = this.telemetry.createMeter('ECommerce.ProductService');
    this.searchesPerformed = this.productMeter.createCounter('searches.performed');
    this.searchLatency = this.productMeter.createHistogram('search.latency', 'Search response time', 'ms');
    this.inventoryLevels = this.productMeter.createGauge('inventory.levels');

    this.productActivitySource = this.telemetry.createActivitySource('ECommerce.ProductService');
  }

  async searchProducts(query: string, filters: any) {
    return await withActivity(
      this.productActivitySource,
      'SearchProducts',
      async (activity) => {
        const startTime = performance.now();

        activity?.setTags({
          'search.query': query,
          'search.filters_count': Object.keys(filters).length,
          'user.session': this.getCurrentSession()
        });

        activity?.addEvent('cache.check');
        const cached = await this.checkSearchCache(query, filters);

        if (cached) {
          activity?.setTag('cache.hit', true);
          this.searchLatency.record(performance.now() - startTime, { cache_hit: true });
          return cached;
        }

        activity?.setTag('cache.hit', false);
        activity?.addEvent('database.query.start');

        const results = await this.performDatabaseSearch(query, filters);

        activity?.addEvent('database.query.complete', {
          results_count: results.length
        });

        // Track metrics
        this.searchesPerformed.add(1, {
          cache_miss: true,
          results_found: results.length > 0
        });

        this.searchLatency.record(performance.now() - startTime, {
          cache_hit: false,
          results_count: results.length
        });

        return results;
      }
    );
  }
}
```

### Real-time Dashboard Component

```typescript
export class DashboardComponent {
  private telemetry = resolve(ITelemetryService);

  constructor() {
    this.dashboardMeter = this.telemetry.createMeter('Dashboard.Component');
    this.widgetLoads = this.dashboardMeter.createCounter('widgets.loaded');
    this.refreshRate = this.dashboardMeter.createGauge('refresh.rate');
    this.errorRate = this.dashboardMeter.createCounter('errors.occurred');
  }

  async loadWidget(widgetType: string) {
    const activity = this.dashboardActivitySource.startActivity('LoadWidget');
    activity?.setTag('widget.type', widgetType);

    try {
      const data = await this.fetchWidgetData(widgetType);

      // Track successful widget loads
      this.widgetLoads.add(1, {
        type: widgetType,
        success: true
      });

      activity?.setTag('data.size', JSON.stringify(data).length);
      activity?.addEvent('widget.rendered');

      return data;
    } catch (error) {
      this.errorRate.add(1, {
        widget_type: widgetType,
        error_type: error.constructor.name
      });

      activity?.addEvent('error', {
        error_type: error.constructor.name,
        message: String(error)
      });

      throw error;
    } finally {
      activity?.dispose();
    }
  }
}
```

## Viewing Performance Data

### Chrome DevTools Performance Tab

1. Open Chrome DevTools (F12)
2. Go to the **Performance** tab
3. Click **Record** (⚫)
4. Navigate through your application and trigger your custom telemetry
5. Stop recording
6. Look for **"Aurelia"** track in the timeline (or your custom track name)

You'll see:
- **Framework measurements**: Component lifecycle measurements in the main track
- **Router measurements**: Router hook measurements showing exactly which hooks are slow
- **Custom telemetry**: Your application-specific metrics and activities
- **Custom events**: Discrete events with rich metadata
- **Error tracking**: Separate error measurements for debugging
- **Business metrics**: Counters, histograms, and gauges with dimensions

### Performance Markers

The plugin creates several types of performance markers:

#### Automatic Framework Tracking
- **Component Lifecycles**: `ComponentName.binding`, `ComponentName.attached`, etc.
- **Router Loading Distance**: `ComponentName • Loading → Attached (route-path)` - The complete loading journey
- **Router Hook Validation**: `ComponentName • canLoad (route-path)`, `ComponentName • canUnload (route-path)`

#### Custom Telemetry
- **Custom Activities**: `ServiceName.OperationName` with rich metadata and events
- **Metrics**: Counter increments, histogram recordings, gauge updates
- **Events**: Discrete application events with custom attributes
- **Error Tracking**: Failed operations with error details

## Best Practices

### When to Use Automatic vs Custom Telemetry

**Use Automatic Tracking for:**
- 🎯 Framework performance monitoring (components, router)
- 🎯 Identifying slow lifecycle hooks
- 🎯 Overall application performance baseline

**Use Custom Telemetry for:**
- 🎯 Business logic performance (API calls, data processing)
- 🎯 User behavior tracking (clicks, searches, transactions)
- 🎯 Application-specific metrics (conversion rates, error rates)
- 🎯 Complex operation tracing (multi-step workflows)

### Telemetry Design Guidelines

1. **Choose Meaningful Names**: Use hierarchical naming like `MyApp.ServiceName.metric_name`
2. **Add Rich Attributes**: Include context that helps with filtering and analysis
3. **Use Appropriate Metric Types**:
   - **Counters**: For things that increment (requests, errors, events)
   - **Histograms**: For value distributions (response times, data sizes)
   - **Gauges**: For current state (active users, queue length, memory usage)
4. **Activity Tracing**: Use for complex operations that span multiple steps
5. **Events**: Use for discrete occurrences with rich context

### Example: Optimizing Based on Telemetry

```typescript
// Before: Slow product loading
export class ProductPage implements IRouteableComponent {
  async loading(params: Parameters) {
    // ⏱️ Measurement starts here
    this.product = await this.api.getProduct(params.productId); // ⚠️ 2000ms
    this.reviews = await this.api.getReviews(params.productId);  // ⚠️ 1500ms
    // ⏱️ Measurement ends when attached() completes
  }
}

// After: Optimized with parallel loading + custom telemetry
export class ProductPage implements IRouteableComponent {
  private telemetry = resolve(ITelemetryService);

  constructor() {
    this.productMeter = this.telemetry.createMeter('MyApp.ProductPage');
    this.loadTime = this.productMeter.createHistogram('page.load_time', 'Page load time', 'ms');
    this.activitySource = this.telemetry.createActivitySource('MyApp.ProductPage');
  }

  async loading(params: Parameters) {
    return await withActivity(
      this.activitySource,
      'LoadProductPage',
      async (activity) => {
        const startTime = performance.now();
        activity?.setTag('product.id', params.productId);

        // Parallel loading reduces total time
        const [product, reviews] = await Promise.all([
          this.api.getProduct(params.productId),    // ✅ Parallel
          this.api.getReviews(params.productId)     // ✅ Parallel
        ]);

        this.product = product;
        this.reviews = reviews;

        const loadTime = performance.now() - startTime;
        this.loadTime.record(loadTime, {
          product_category: product.category,
          reviews_count: reviews.length
        });

        activity?.setTags({
          'product.category': product.category,
          'reviews.count': reviews.length,
          'load_time': loadTime
        });

        // ⏱️ Framework measurement ends when attached() completes (~1200ms total)
      }
    );
  }
}

// Results visible in DevTools:
// - Framework: `ProductPage • Loading → Attached (product/123)` now takes ~1200ms
// - Custom: `MyApp.ProductPage.LoadProductPage` with rich metadata
// - Metrics: Histogram showing load time distribution by product category
// - **1800ms improvement** in real user experience
```

## Configuration Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Master enable/disable switch |
| `trackName` | string | `'Aurelia'` | Name of the performance track |
| `enableRouterTracking` | boolean | `true` | Enable router loading→attached measurement |
| `prioritizeAsyncHooks` | boolean | `true` | Highlight async operations |
| `trackSyncHooksAsInstant` | boolean | `true` | Use instant measurements for sync hooks |

## Browser Support

- **Chrome DevTools Extensibility API**: Chrome 102+
- **Fallback Performance API**: All modern browsers
- **Best Experience**: Chrome with DevTools Extensibility API support

## Migration from v1

The existing automatic tracking features remain unchanged. The new custom telemetry APIs are opt-in additions:

```typescript
// v1 - Still works exactly the same
Aurelia.register(InsightsPlugin.DefaultConfiguration);

// v2 - Add custom telemetry when you need it
export class MyService {
  private telemetry = resolve(ITelemetryService);

  constructor() {
    // New opt-in telemetry APIs
    this.meter = this.telemetry.createMeter('MyApp.MyService');
  }
}
```

## Inspiration

The custom telemetry APIs are inspired by [.NET Core's telemetry approach](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-otlp-example), emphasizing:
- **Opt-in instrumentation**: Developers choose what to measure
- **Rich metadata**: Context-aware measurements with attributes
- **Structured telemetry**: Clear separation of metrics, traces, and events
- **Developer control**: "Measure everything relevant to your application"

## License

MIT

## Repeat Performance Tracking

The insights package includes a performance-enhanced version of the `repeat` template controller that tracks:

- Binding and unbinding performance
- View creation and destruction timing
- Collection change operations
- Large collection handling optimizations

### Features

- **Non-intrusive**: Drop-in replacement for the standard repeat template controller
- **Smart tracking**: Automatically batches measurements for large collections to avoid performance tab spam
- **Configurable thresholds**: Customize when detailed vs. summary tracking is used
- **Rich metadata**: Includes item counts, operation types, and timing information

### Configuration

```typescript
Aurelia.register(
  InsightsPlugin.configure({
    enabled: true,
    repeatPerformance: {
      enabled: true,
      detailedTrackingThreshold: 100, // Use summary tracking for collections > 100 items
      batchOperationThreshold: 10,    // Consider operations affecting > 10 items as "large"
      trackIndividualOperations: true,
      color: 'secondary'
    }
  })
);
```

### Performance Tab Integration

When enabled, the repeat performance tracking will show in Chrome DevTools Performance tab as:

- `Repeat • Attaching (50 items) • component_abc123` - View creation
- `Repeat • Collection Change (add: 5, remove: 2) • component_abc123` - Collection updates
- `Repeat • Items Changed (1000 items) • component_abc123` - Large collection updates

### Template Usage

No changes needed in your templates - the performance tracking works with existing repeat syntax:

```html
<!-- Standard repeat usage -->
<div repeat.for="item of items">
  ${item.name}
</div>

<!-- With key -->
<div repeat.for="item of items; key: item.id">
  ${item.name}
</div>

<!-- All existing repeat features work -->
<div repeat.for="[index, item] of items.entries()">
  ${index}: ${item.name}
</div>
```

### Avoiding Performance Spam

The insights package is designed to avoid overwhelming the Chrome DevTools Performance tab:

1. **Threshold-based tracking**: Collections larger than the configured threshold use summary measurements
2. **Batched operations**: Multiple related operations are grouped together
3. **Descriptive names**: Clear, concise measurement names that include relevant context
4. **Conditional tracking**: Can be disabled entirely or selectively enabled

### Best Practices

- Use lower thresholds during development to catch performance issues early
- Set higher thresholds in production to reduce measurement overhead
- Monitor the "Large Collection" flag in measurements to identify potential optimization opportunities
- Use the metadata to understand which repeaters are causing performance bottlenecks

## Other Features

- Component lifecycle tracking
- Router performance monitoring
- Custom telemetry and metrics
- Visualization components
- Performance utilities

## Configuration Options

```
