# Aurelia Insights

The **@aurelia/insights** package provides comprehensive performance monitoring and telemetry capabilities for Aurelia applications. It offers both automatic framework tracking and custom telemetry APIs to help you understand and optimize your application's performance.

## Overview

Aurelia Insights combines three powerful approaches to application monitoring:

- **🎯 Automatic Framework Tracking**: Zero-configuration monitoring of Aurelia components, router, and template controllers
- **📊 Custom Telemetry APIs**: Developer-controlled instrumentation for business logic and application-specific metrics
- **🎨 Rich Visualization Components**: Beautiful UI components for displaying telemetry data without relying on browser developer tools

The package integrates seamlessly with Chrome DevTools Performance tab and provides structured telemetry data that can be exported for external analysis.

## Table of Contents

1. [Installation & Quick Start](#installation--quick-start)
2. [Automatic Framework Tracking](#automatic-framework-tracking)
3. [Custom Telemetry APIs](#custom-telemetry-apis)
4. [Visualization Components](#visualization-components)
5. [Configuration](#configuration)
6. [Performance Analysis Utilities](#performance-analysis-utilities)
7. [Real-World Examples](#real-world-examples)
8. [API Reference](#api-reference)
9. [Best Practices](#best-practices)
10. [Browser Support & Integration](#browser-support--integration)
11. [Troubleshooting](#troubleshooting)

## Installation & Quick Start

### Installation

```bash
npm install @aurelia/insights
```

### Basic Setup (Automatic Tracking)

```typescript
import { Aurelia } from 'aurelia';
import { InsightsPlugin } from '@aurelia/insights';

// Enable with default configuration - zero setup required!
Aurelia
  .register(InsightsPlugin.DefaultConfiguration)
  .app(app)
  .start();
```

### Advanced Setup (With Custom Configuration)

```typescript
import { Aurelia } from 'aurelia';
import { InsightsPlugin } from '@aurelia/insights';

Aurelia
  .register(InsightsPlugin.configure({
    enabled: true,
    trackName: 'MyApp',
    trackGroup: 'Performance',
    enableRouterTracking: true,
    defaultColor: 'primary',
    repeatPerformance: {
      enabled: true,
      detailedTrackingThreshold: 100,
      batchOperationThreshold: 10
    }
  }))
  .app(app)
  .start();
```

## Automatic Framework Tracking

The insights package automatically tracks key Aurelia framework operations without requiring any changes to your code:

### Component Lifecycle Monitoring

All component lifecycle methods are automatically measured:

- `binding` - When the component is being bound to its view-model
- `bound` - When the component has been bound
- `attaching` - When the component is being attached to the DOM
- `attached` - When the component has been attached to the DOM
- `detaching` - When the component is being detached from the DOM
- `detached` - When the component has been detached
- `unbinding` - When the component is being unbound

### Router Performance Tracking

The most important measurement for user experience is the **Loading → Attached** distance, which captures the complete loading journey from when navigation starts until the component is fully rendered and ready.

```typescript
// This will automatically be measured:
export class ProductDetailsPage implements IRouteableComponent {
  // ⏱️ Measurement starts here
  async loading(params: Params) {
    // API calls, data loading
    this.product = await this.api.getProduct(params.id);
    this.reviews = await this.api.getReviews(params.id);
  }

  // ⏱️ Measurement ends when attached() completes
  attached() {
    // Component is fully ready
  }
}
```

### Event Handler Performance Tracking

The insights package automatically tracks the performance of event handlers throughout your application, focusing on where real performance bottlenecks occur - in user code execution.

#### What Gets Tracked Automatically

Every event handler (click, input, scroll, etc.) is automatically instrumented to measure:

**User Code Execution:**
- **Event Handler Execution**: Time spent executing your actual event handler code (where performance bottlenecks typically occur)

**Rich Metadata:**
- **Event Type**: The type of event (click, input, scroll, etc.)
- **Target Element**: Which DOM element the event is bound to
- **Target Event**: The specific event name being handled

#### Performance Measurements in DevTools

In Chrome DevTools Performance tab, you'll see measurements like:

```
// Event handler execution (focus on slow handlers)
ListenerBinding.callSource • click • button (LoginForm)
ListenerBinding.callSource • input • input (SearchBox)
ListenerBinding.callSource • scroll • div (ProductList)
```

This focused tracking helps you identify:
- **Slow Event Handlers**: Which user code takes too long to execute
- **Hot Events**: Which events fire most frequently (scroll, mousemove)
- **Performance Bottlenecks**: Specific elements or handlers causing UI jank

### Repeat Template Controller Tracking

The insights package provides comprehensive performance monitoring for the `repeat.for` template controller, which is crucial for applications that render dynamic lists of data. This tracking helps identify performance bottlenecks in list rendering, especially with large datasets.

#### What Gets Tracked Automatically

Every `repeat.for` instance is automatically instrumented to measure:

**Complete Rendering Cycles:**
- **Complete Render**: From initial binding through DOM attachment and browser paint
- **Items Update**: Complete update cycle when the items array changes
- **Collection Update**: Comprehensive measurement when individual items are modified

**Individual Lifecycle Phases:**
- **Binding**: When the repeat controller binds to its data
- **Attaching**: When repeat views are being attached to the DOM
- **Attached**: When views are fully attached (triggers after DOM paint)
- **Detaching**: When views are being removed from the DOM
- **Unbinding**: When the repeat controller unbinds

**Collection Change Operations:**
- **Items Changed**: When the entire items array is replaced
- **Collection Change**: When individual items are added, removed, or moved
- **Change Type Analysis**: Automatic detection of operation types (add, remove, reorder, replace, mixed)

#### Performance Measurements in DevTools

In Chrome DevTools Performance tab, you'll see measurements like:

```
// Complete rendering cycles (most important for optimization)
Repeat • Complete Render (150 items) • ProductList_a3f2
Repeat • Items Update (87 items) • CategoryList_b7e1
Repeat • Collection Update (add) • ShoppingCart_c9d4

// Individual phases (for detailed analysis)
Repeat • Binding (150 items) • ProductList_a3f2
Repeat • Attaching (150 items) • ProductList_a3f2
Repeat • Collection Change (remove) • ShoppingCart_c9d4

// Large collection indicators
Repeat • Complete Render (1,500 items) • ProductCatalog_d2f8
```

## Custom Telemetry APIs

For application-specific monitoring, the package provides a comprehensive set of custom telemetry APIs inspired by .NET Core's telemetry approach.

### Telemetry Service

The `ITelemetryService` is your entry point for creating custom telemetry:

```typescript
import { resolve } from '@aurelia/kernel';
import { ITelemetryService } from '@aurelia/insights';

export class ProductService {
  private readonly telemetry = resolve(ITelemetryService);
}
```

### Meters and Metrics

Create custom metrics to track what matters to your application:

```typescript
import { resolve } from '@aurelia/kernel';
import { ITelemetryService } from '@aurelia/insights';

export class ProductService {
  private readonly telemetry = resolve(ITelemetryService);
  private readonly productMeter;
  private readonly searchesPerformed;
  private readonly searchLatency;
  private readonly inventoryLevels;

  constructor() {
    // Create a meter for your service/component
    this.productMeter = this.telemetry.createMeter('MyApp.ProductService', '1.0.0');

    // Counter: Tracks incrementing values
    this.searchesPerformed = this.productMeter.createCounter(
      'searches.performed',
      'Number of product searches'
    );

    // Histogram: Tracks value distributions (perfect for response times, sizes)
    this.searchLatency = this.productMeter.createHistogram(
      'search.latency',
      'Product search response time',
      'ms'
    );

    // Gauge: Tracks current values (memory usage, queue length, etc.)
    this.inventoryLevels = this.productMeter.createGauge(
      'inventory.current',
      'Current inventory levels'
    );
  }

  async searchProducts(query: string, filters: SearchFilters) {
    const startTime = performance.now();

    try {
      const results = await this.performSearch(query, filters);

      // Track successful searches
      this.searchesPerformed.add(1, {
        has_filters: Object.keys(filters).length > 0,
        results_found: results.length > 0
      });

      // Record response time
      const latency = performance.now() - startTime;
      this.searchLatency.record(latency, {
        query_length: query.length,
        filter_count: Object.keys(filters).length
      });

      // Update inventory gauge
      this.inventoryLevels.set(results.reduce((sum, r) => sum + r.stock, 0));

      return results;
    } catch (error) {
      // Record error event
      this.productMeter.recordEvent('search.error', {
        error_type: error.constructor.name,
        query_length: query.length
      });
      throw error;
    }
  }
}
```

### Activity Sources and Tracing

Trace complex operations with custom activities:

```typescript
import { resolve } from '@aurelia/kernel';
import { ITelemetryService } from '@aurelia/insights';

export class OrderService {
  private readonly telemetry = resolve(ITelemetryService);
  private readonly orderActivitySource;

  constructor() {
    this.orderActivitySource = this.telemetry.createActivitySource('MyApp.OrderService');
  }

  async processOrder(order: Order) {
    // Manual activity management
    const activity = this.orderActivitySource.startActivity('ProcessOrder');
    activity?.setTag('order.id', order.id);
    activity?.setTag('order.total', order.total);
    activity?.setTag('customer.type', order.customer.type);

    try {
      activity?.addEvent('validation.start');
      await this.validateOrder(order);
      activity?.addEvent('validation.complete');

      activity?.addEvent('payment.start');
      const paymentResult = await this.processPayment(order);
      activity?.addEvent('payment.complete', {
        transaction_id: paymentResult.transactionId
      });

      activity?.addEvent('fulfillment.start');
      await this.scheduleShipping(order);
      activity?.addEvent('fulfillment.complete');

      activity?.setTag('success', true);
      return paymentResult;
    } catch (error) {
      activity?.setTag('success', false);
      activity?.addEvent('error', {
        message: String(error),
        stage: this.determineErrorStage(error)
      });
      throw error;
    } finally {
      activity?.dispose(); // Always dispose to end the measurement
    }
  }
}
```

### Helper Functions

For cleaner code, use the `withActivity` helper:

```typescript
import { resolve } from '@aurelia/kernel';
import { ITelemetryService, withActivity } from '@aurelia/insights';

export class PaymentService {
  private readonly telemetry = resolve(ITelemetryService);
  private readonly paymentActivitySource;

  constructor() {
    this.paymentActivitySource = this.telemetry.createActivitySource('MyApp.PaymentService');
  }

  async processPayment(payment: Payment) {
    return await withActivity(
      this.paymentActivitySource,
      'ProcessPayment',
      async (activity) => {
        activity?.setTags({
          'payment.method': payment.method,
          'payment.amount': payment.amount,
          'customer.id': payment.customerId
        });

        const result = await this.chargeCard(payment);
        activity?.setTag('transaction.id', result.transactionId);

        return result;
      },
      {
        payment_type: payment.method,
        amount_range: this.getAmountRange(payment.amount)
      }
    );
  }
}
```

## Visualization Components

The insights package includes beautiful, modern UI components for visualizing telemetry data without relying on browser developer tools.

### Features

- **🎯 Zero DevTools Dependency** - Beautiful UI instead of browser performance tab
- **⚡ Real-time Updates** - Components automatically refresh as data comes in
- **🎨 Modern Design** - Glassmorphism, gradients, smooth animations
- **📱 Fully Responsive** - Works on all devices and screen sizes
- **🔧 TypeScript First** - Fully typed with excellent IntelliSense support

### Available Components

#### Telemetry Dashboard (`<au-telemetry-dashboard>`)

Main overview dashboard showing all telemetry meters, activity sources, and system status.

```html
<au-telemetry-dashboard
  meter-selected.trigger="showMeterDetails($event.detail.meter)"
  activity-source-selected.trigger="showActivityTimeline($event.detail.source)">
</au-telemetry-dashboard>
```

**Features:**
- Real-time statistics cards
- Interactive lists of meters and activity sources
- Performance tracker status
- Refresh and clear controls
- Fully responsive design

#### Metric Gauge (`<au-metric-gauge>`)

Circular progress gauge for displaying single metric values with status indicators.

```html
<au-metric-gauge data.bind="performanceGauge"></au-metric-gauge>
```

```typescript
public performanceGauge: IGaugeData = {
  value: 85,
  min: 0,
  max: 100,
  unit: '%',
  label: 'System Performance',
  thresholds: { warning: 70, critical: 90 }
};
```

#### Metric Chart (`<au-metric-chart>`)

Real-time time-series chart for displaying streaming telemetry data.

```html
<au-metric-chart chart-data.bind="responseTimeChart"></au-metric-chart>
```

```typescript
public responseTimeChart: IChartData = {
  name: 'API Response Time',
  data: [],
  type: 'line',
  color: '#8b5cf6',
  unit: 'ms',
  maxDataPoints: 50
};
```

## Configuration

### Configuration Options

The insights package can be configured with comprehensive options:

```typescript
interface IInsightsConfigurationOptions {
  /** Whether to enable performance tracking (default: true) */
  enabled?: boolean;

  /** Default track name for Aurelia insights (default: 'Aurelia') */
  trackName?: string;

  /** Default track group name (default: 'Framework') */
  trackGroup?: string;

  /** Default color for measurements (default: 'primary') */
  defaultColor?: DevToolsColor;

  /** Custom measurement filters */
  filters?: IPerformanceFilter[];

  /** Router tracking configuration (default: true) */
  enableRouterTracking?: boolean;

  /** Repeat template controller tracking configuration */
  repeatPerformance?: IRepeatPerformanceConfig;
}

interface IRepeatPerformanceConfig {
  /** Enable repeat tracking (default: true) */
  enabled?: boolean;
  /** Threshold for detailed tracking of large collections (default: 100) */
  detailedTrackingThreshold?: number;
  /** Threshold for batch operation detection (default: 10) */
  batchOperationThreshold?: number;
  /** Track individual operations for small collections (default: true) */
  trackIndividualOperations?: boolean;
  /** Color for repeat performance measurements (default: 'secondary') */
  color?: DevToolsColor;
}

interface IPerformanceFilter {
  /** Filter name */
  name: string;
  /** Whether the filter should include or exclude matches */
  include: boolean;
  /** Pattern to match against measurement names */
  pattern: string | RegExp;
}
```

### Configuration Methods

#### Using the Configuration Builder

```typescript
import { InsightsConfiguration } from '@aurelia/insights';

Aurelia
  .register(
    InsightsConfiguration
      .create()
      .enabled(true)
      .trackName('MyApplication')
      .trackGroup('Business Logic')
      .defaultColor('secondary')
      .enableRouterTracking(true)
      .addFilter({
        name: 'exclude-test-components',
        include: false,
        pattern: /Test.*Component/
      })
      .build()
  )
  .app(app)
  .start();
```

#### Environment-Specific Configuration

```typescript
import { InsightsPlugin } from '@aurelia/insights';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const config = isDevelopment
  ? InsightsPlugin.configure({
      enabled: true,
      trackName: 'DevMode',
      repeatPerformance: {
        detailedTrackingThreshold: 25,  // Lower threshold for dev
        batchOperationThreshold: 5,     // More sensitive change detection
        trackIndividualOperations: true
      }
    })
  : isProduction
  ? InsightsPlugin.configure({
      enabled: true,
      trackName: 'Production',
      repeatPerformance: {
        detailedTrackingThreshold: 500,  // Higher threshold for production
        batchOperationThreshold: 50,     // Less sensitive for performance
        trackIndividualOperations: false
      }
    })
  : InsightsPlugin.disable();

Aurelia
  .register(config)
  .app(app)
  .start();
```

## Performance Analysis Utilities

The package includes comprehensive utilities for analyzing performance data:

```typescript
import { resolve } from '@aurelia/kernel';
import { IInsightsUtilities } from '@aurelia/insights';

export class PerformanceAnalyzer {
  private readonly insights = resolve(IInsightsUtilities);

  analyzeApplicationPerformance() {
    // Get all measurements
    const allMeasurements = this.insights.getMeasurements();
    console.log(`Total measurements: ${allMeasurements.length}`);

    // Get grouped measurements by component
    const grouped = this.insights.groupMeasurementsByComponent();

    // Find the slowest components
    const slowest = this.insights.getSlowestComponents(5);
    console.log('Slowest components:', slowest);

    // Find the most active components
    const mostActive = this.insights.getMostActiveComponents(5);
    console.log('Most active components:', mostActive);

    // Get specific component stats
    const productPageStats = this.insights.getComponentStats('ProductPage');
    if (productPageStats) {
      console.log('ProductPage loading time:', productPageStats.loading?.average);
    }

    // Get specific phase stats
    const loadingStats = this.insights.getPhaseStats('ProductPage', 'loading');
    if (loadingStats) {
      console.log('Loading phase stats:', loadingStats);
    }

    // Export data for external analysis
    const performanceData = this.insights.exportPerformanceData();
    await this.sendToAnalytics(performanceData);
  }

  logPerformanceSummary() {
    // This will log a comprehensive performance summary to the console
    this.insights.logPerformanceSummary();
  }

  clearOldData() {
    // Clear measurements to prevent memory leaks
    this.insights.clearMeasurements();
  }
}
```

## Real-World Examples

### E-commerce Application

```typescript
import { resolve } from '@aurelia/kernel';
import { ITelemetryService, withActivity } from '@aurelia/insights';

export class ShoppingCartService {
  private readonly telemetry = resolve(ITelemetryService);
  private readonly cartMeter;
  private readonly cartActivitySource;
  private readonly itemsAdded;
  private readonly cartValue;
  private readonly checkoutTime;

  constructor() {
    this.cartMeter = this.telemetry.createMeter('ECommerce.ShoppingCart');
    this.cartActivitySource = this.telemetry.createActivitySource('ECommerce.ShoppingCart');

    this.itemsAdded = this.cartMeter.createCounter('items.added', 'Items added to cart');
    this.cartValue = this.cartMeter.createGauge('cart.value', 'Current cart value', '$');
    this.checkoutTime = this.cartMeter.createHistogram('checkout.duration', 'Checkout process time', 'ms');
  }

  async addToCart(product: Product, quantity: number) {
    const activity = this.cartActivitySource.startActivity('AddToCart');
    activity?.setTags({
      'product.id': product.id,
      'product.category': product.category,
      'quantity': quantity,
      'product.price': product.price
    });

    try {
      // Business logic
      await this.validateProduct(product);
      await this.updateInventory(product, quantity);
      const newCartValue = await this.addItemToCart(product, quantity);

      // Track metrics
      this.itemsAdded.add(quantity, {
        category: product.category,
        price_range: this.getPriceRange(product.price)
      });

      this.cartValue.set(newCartValue);

      activity?.addEvent('item.added', {
        new_cart_value: newCartValue,
        items_in_cart: await this.getCartItemCount()
      });

      activity?.setTag('success', true);
    } catch (error) {
      activity?.setTag('success', false);
      activity?.addEvent('error', {
        error_type: error.constructor.name,
        stage: 'add_to_cart'
      });
      throw error;
    } finally {
      activity?.dispose();
    }
  }

  async checkout(cart: Cart) {
    return await withActivity(
      this.cartActivitySource,
      'Checkout',
      async (activity) => {
        const startTime = performance.now();

        activity?.setTags({
          'cart.item_count': cart.items.length,
          'cart.total_value': cart.total,
          'customer.type': cart.customer.type
        });

        const result = await this.processCheckout(cart);

        const duration = performance.now() - startTime;
        this.checkoutTime.record(duration, {
          item_count_range: this.getItemCountRange(cart.items.length),
          payment_method: result.paymentMethod
        });

        activity?.addEvent('checkout.completed', {
          order_id: result.orderId,
          duration: duration
        });

        return result;
      }
    );
  }
}
```

### Event Handler Optimization Example

```typescript
// Before: Slow search identified through automatic event handler tracking
export class SearchComponent {
  // ⏱️ DevTools shows: ListenerBinding.callSource • input • input (SearchBox) - 150ms
  // This is way too slow for an input handler!
  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    // ❌ Synchronous search on every keystroke
    this.searchResults = this.performExpensiveSearch(query);
    this.updateUI();
  }

  private performExpensiveSearch(query: string) {
    // Expensive operations: filtering, sorting, highlighting
    return this.allProducts
      .filter(p => p.name.includes(query) || p.description.includes(query))
      .sort((a, b) => this.calculateRelevanceScore(a, query) - this.calculateRelevanceScore(b, query))
      .map(p => ({ ...p, highlighted: this.highlightMatches(p, query) }));
  }
}

// After: Optimized with debouncing + async processing
export class SearchComponent {
  private searchTimeout: number | null = null;

  // ⏱️ DevTools now shows: ListenerBinding.callSource • input • input (SearchBox) - 2ms
  // Much better! Fast and responsive
  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    // ✅ Debounce and async search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(async () => {
      this.isSearching = true;
      this.searchResults = await this.performOptimizedSearch(query);
      this.isSearching = false;
    }, 300) as any;
  }

  private async performOptimizedSearch(query: string) {
    // Move expensive work to web worker or batch with requestIdleCallback
    return new Promise(resolve => {
      requestIdleCallback(() => {
        const results = this.allProducts
          .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 50); // Limit results
        resolve(results);
      });
    });
  }
}
```

### Performance Optimization Example

```typescript
import { resolve } from '@aurelia/kernel';
import { ITelemetryService, withActivity } from '@aurelia/insights';

// Before: Slow loading identified through automatic tracking
export class ProductListPage implements IRouteableComponent {
  async loading() {
    // ⏱️ Automatic measurement shows this takes 3000ms
    this.products = await this.api.getProducts(); // 2000ms
    this.categories = await this.api.getCategories(); // 1000ms
  }
}

// After: Optimized with parallel loading + custom telemetry
export class ProductListPage implements IRouteableComponent {
  private readonly telemetry = resolve(ITelemetryService);
  private readonly pageMeter;
  private readonly pageActivitySource;

  constructor() {
    this.pageMeter = this.telemetry.createMeter('MyApp.ProductListPage');
    this.pageActivitySource = this.telemetry.createActivitySource('MyApp.ProductListPage');
  }

  async loading() {
    return await withActivity(
      this.pageActivitySource,
      'LoadProductList',
      async (activity) => {
        const startTime = performance.now();

        // Parallel loading reduces total time
        const [products, categories] = await Promise.all([
          this.api.getProducts(),    // ✅ Parallel
          this.api.getCategories()   // ✅ Parallel
        ]);

        this.products = products;
        this.categories = categories;

        const loadTime = performance.now() - startTime;

        // Track our optimization success
        this.pageMeter.createHistogram('page.load_time', 'Page load time', 'ms')
          .record(loadTime, {
            products_count: products.length,
            categories_count: categories.length,
            cache_status: this.getCacheStatus()
          });

        activity?.setTags({
          'products.count': products.length,
          'categories.count': categories.count,
          'load_time_ms': loadTime
        });

        // ⏱️ Automatic measurement now shows ~1200ms (60% improvement!)
      }
    );
  }
}
```

## API Reference

### Core Interfaces

#### ITelemetryService
```typescript
interface ITelemetryService {
  createMeter(name: string, version?: string): ITelemetryMeter;
  createActivitySource(name: string, version?: string): IActivitySource;
  getMeter(name: string, version?: string): ITelemetryMeter;
  getActivitySource(name: string, version?: string): IActivitySource;
  getMeters(): readonly ITelemetryMeter[];
  getActivitySources(): readonly IActivitySource[];
  clear(): void;
  dispose(): void;
}
```

#### ITelemetryMeter
```typescript
interface ITelemetryMeter {
  readonly name: string;
  readonly version: string;
  createCounter<T extends number>(name: string, description?: string, unit?: string): ICounter<T>;
  createHistogram<T extends number>(name: string, description?: string, unit?: string): IHistogram<T>;
  createGauge<T extends number>(name: string, description?: string, unit?: string): IGauge<T>;
  recordEvent(name: string, attributes?: Record<string, string | number | boolean>): void;
}
```

#### IActivitySource
```typescript
interface IActivitySource {
  startActivity(name: string, attributes?: Record<string, string | number | boolean>): IActivity | null;
  readonly name: string;
  readonly version: string;
}
```

#### IActivity
```typescript
interface IActivity {
  readonly name: string;
  setTag(key: string, value: string | number | boolean): IActivity;
  setTags(attributes: Record<string, string | number | boolean>): IActivity;
  addEvent(name: string, attributes?: Record<string, string | number | boolean>): IActivity;
  end(): void;
  dispose(): void;
  readonly isRecording: boolean;
}
```

#### IInsightsUtilities
```typescript
interface IInsightsUtilities {
  getMeasurements(): readonly IPerformanceMeasurement[];
  clearMeasurements(): void;
  groupMeasurementsByComponent(): IGroupedMeasurements;
  getComponentStats(componentName: string): { [phase: string]: IPerformanceStats } | undefined;
  getPhaseStats(componentName: string, phase: string): IPerformanceStats | undefined;
  getSlowestComponents(limit?: number): ComponentPerformanceInfo[];
  getMostActiveComponents(limit?: number): ComponentActivityInfo[];
  logPerformanceSummary(): void;
  exportPerformanceData(): string;
}
```

### Metric Interfaces

#### ICounter
```typescript
interface ICounter<T extends number> {
  add(value: T, attributes?: Record<string, string | number | boolean>): void;
}
```

#### IHistogram
```typescript
interface IHistogram<T extends number> {
  record(value: T, attributes?: Record<string, string | number | boolean>): void;
}
```

#### IGauge
```typescript
interface IGauge<T extends number> {
  set(value: T, attributes?: Record<string, string | number | boolean>): void;
}
```

### Visualization Interfaces

#### IGaugeData
```typescript
interface IGaugeData {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}
```

#### IChartData
```typescript
interface IChartData {
  name: string;
  data: IChartDataPoint[];
  type: 'line' | 'bar' | 'area';
  color?: string;
  unit?: string;
  maxDataPoints?: number;
}

interface IChartDataPoint {
  timestamp: number;
  value: number;
  metadata?: Record<string, unknown>;
}
```

### Utility Functions

#### withActivity
```typescript
const withActivity: <T>(
  activitySource: IActivitySource,
  name: string,
  operation: (activity: IActivity | null) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
) => Promise<T>
```

## Best Practices

### When to Use Automatic vs Custom Telemetry

#### Use Automatic Tracking for:
- 🎯 Framework performance monitoring (components, router, repeat template controllers)
- 🎯 Identifying slow lifecycle hooks and list rendering bottlenecks
- 🎯 Overall application performance baseline
- 🎯 Quick performance insights without code changes

#### Use Custom Telemetry for:
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

### Performance Considerations

- **Zero overhead when disabled**: No performance impact when `enabled: false`
- **Use environment-specific configuration**: Different thresholds for dev vs production
- **Clear measurements periodically**: Prevent memory leaks in long-running applications
- **Use filters wisely**: Focus on components that matter most

### Event Handler Performance Guidelines

Event handler tracking helps identify common performance anti-patterns:

#### High-Frequency Events (scroll, mousemove, resize)
```typescript
// ❌ Bad: Expensive work on every scroll
onScroll(event: Event) {
  this.updateExpensiveVisualization(); // 50ms each time
}

// ✅ Good: Throttle expensive work
onScroll = throttle((event: Event) => {
  this.updateExpensiveVisualization();
}, 100);
```

#### Input Events (input, keyup, change)
```typescript
// ❌ Bad: Immediate expensive operations
onInput(event: Event) {
  this.performComplexValidation(); // 20ms
  this.updateSearchResults();       // 100ms
}

// ✅ Good: Debounce and optimize
onInput = debounce(async (event: Event) => {
  await this.performOptimizedValidation();
  await this.updateSearchResults();
}, 300);
```

#### Look for These Patterns in DevTools
- **> 16ms handlers**: Will cause frame drops (60fps = 16.67ms budget)
- **Hot event handlers**: scroll, mousemove taking > 1ms consistently
- **Input handlers > 10ms**: Will feel sluggish during typing
- **Click handlers > 100ms**: Users will notice the delay

### Memory Management

```typescript
import { resolve } from '@aurelia/kernel';
import { IInsightsUtilities } from '@aurelia/insights';

export class MemoryManager {
  private readonly insights = resolve(IInsightsUtilities);

  constructor() {
    // Clear measurements every 10 minutes in production
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => {
        this.insights.clearMeasurements();
      }, 10 * 60 * 1000);
    }
  }
}
```

## Browser Support & Integration

### Browser Compatibility

- **Chrome DevTools Extensibility API**: Chrome 102+
- **Fallback Performance API**: All modern browsers
- **Best Experience**: Chrome with DevTools Extensibility API support

When the DevTools Extensibility API is not available, the package falls back to the standard Performance API while maintaining full functionality.

### Chrome DevTools Integration

The insights package integrates with Chrome DevTools Performance tab:

#### Viewing Performance Data

1. Open Chrome DevTools (F12)
2. Go to the **Performance** tab
3. Click **Record** (⚫)
4. Navigate through your application
5. Stop recording
6. Look for your track name (default: "Aurelia") in the timeline

#### What You'll See

**Framework Measurements:**
- Component lifecycle measurements: `ComponentName.binding`, `ComponentName.attached`
- Router loading measurements: `PageComponent • Loading → Attached (/route/path)`
- Repeat template controller measurements: `Repeat • Complete Render (150 items)`, `Repeat • Collection Update (add)`

**Custom Telemetry:**
- Custom activities: `ServiceName.OperationName` with rich metadata
- Metric recordings: Counter increments, histogram values, gauge updates
- Events: Discrete application events with attributes

### Migration and Integration

#### Adding to Existing Applications

```typescript
// Simply add to your existing bootstrap
Aurelia
  .register(
    // ... your existing registrations
    InsightsPlugin.DefaultConfiguration // Add this line
  )
  .app(app)
  .start();
```

#### Gradual Adoption Strategy

```typescript
// Phase 1: Just automatic tracking
Aurelia.register(InsightsPlugin.DefaultConfiguration)

// Phase 2: Add custom telemetry to critical services
export class CriticalService {
  private readonly telemetry = resolve(ITelemetryService);
  // Add custom metrics for critical operations
}

// Phase 3: Comprehensive telemetry across the application
```

## Troubleshooting

### Common Issues

#### Measurements Not Appearing in DevTools

**Problem**: You don't see any measurements in Chrome DevTools Performance tab.

**Solutions**:
1. Ensure Chrome DevTools Extensibility API is supported (Chrome 102+)
2. Check that insights are enabled: `enabled: true`
3. Verify the Performance tab is recording when you navigate
4. Look for your track name (default: "Aurelia") in the timeline
5. Try refreshing DevTools after recording

#### High Memory Usage

**Problem**: Application memory usage grows over time.

**Solution**:
```typescript
import { resolve } from '@aurelia/kernel';
import { IInsightsUtilities } from '@aurelia/insights';

// Clear measurements periodically
export class MemoryManager {
  private readonly insights = resolve(IInsightsUtilities);

  constructor() {
    // Clear measurements every 5 minutes
    setInterval(() => {
      this.insights.clearMeasurements();
    }, 5 * 60 * 1000);
  }
}
```

#### Custom Telemetry Not Working

**Problem**: Custom metrics or activities are not being recorded.

**Solutions**:
1. Ensure `ITelemetryService` is properly resolved using `resolve(ITelemetryService)`
2. Check that the performance tracker is enabled
3. Verify activity disposal: always call `activity?.dispose()`
4. Check for TypeScript compilation errors
5. Ensure proper import statements

#### Performance Impact

**Problem**: The insights package is affecting application performance.

**Solutions**:
```typescript
// Use production-optimized configuration
Aurelia.register(InsightsPlugin.configure({
  enabled: process.env.NODE_ENV !== 'production', // Disable in production
  repeatPerformance: {
    detailedTrackingThreshold: 1000, // Higher threshold
    trackIndividualOperations: false // Disable detailed tracking
  }
}));
```

#### Repeat Performance Measurements Overwhelming

**Problem**: Too many repeat measurements cluttering DevTools.

**Solution**:
```typescript
// Adjust thresholds for your use case
Aurelia.register(InsightsPlugin.configure({
  repeatPerformance: {
    enabled: true,
    detailedTrackingThreshold: 500,    // Higher threshold
    batchOperationThreshold: 100,      // Less sensitive
    trackIndividualOperations: false   // Disable individual operations
  }
}));
```

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
import { resolve } from '@aurelia/kernel';
import { IPerformanceTracker } from '@aurelia/insights';

// In your service
export class DebugService {
  private readonly tracker = resolve(IPerformanceTracker);

  constructor() {
    // Enable debug mode in development
    if (process.env.NODE_ENV === 'development') {
      this.tracker.debug(); // Enables debug logging
    }
  }
}
```

### Checking Configuration

```typescript
import { resolve } from '@aurelia/kernel';
import { IInsightsConfiguration } from '@aurelia/insights';

export class ConfigChecker {
  private readonly config = resolve(IInsightsConfiguration);

  checkConfiguration() {
    console.log('Insights enabled:', this.config.enabled);
    console.log('Track name:', this.config.trackName);
    console.log('Router tracking:', this.config.enableRouterTracking);
    console.log('Repeat tracking:', this.config.repeatPerformance?.enabled);
  }
}
```

### Performance Debugging

```typescript
import { resolve } from '@aurelia/kernel';
import { IInsightsUtilities } from '@aurelia/insights';

export class PerformanceDebugger {
  private readonly insights = resolve(IInsightsUtilities);

  debugPerformance() {
    // Log comprehensive performance summary
    this.insights.logPerformanceSummary();

    // Get detailed component analysis
    const slowest = this.insights.getSlowestComponents(10);
    console.table(slowest);

    // Export data for external analysis
    const data = this.insights.exportPerformanceData();
    console.log('Performance data:', JSON.parse(data));
  }
}
```

## TypeScript Support

The package is written in TypeScript and provides comprehensive type definitions:

```typescript
import { resolve } from '@aurelia/kernel';
import {
  ITelemetryService,
  ITelemetryMeter,
  IActivitySource,
  IActivity,
  IInsightsUtilities,
  IInsightsConfiguration,
  IGaugeData,
  IChartData,
  withActivity
} from '@aurelia/insights';

// Full type safety for all APIs
export class TypedService {
  private readonly telemetry = resolve(ITelemetryService);
  private readonly insights = resolve(IInsightsUtilities);
  private readonly config = resolve(IInsightsConfiguration);
}
```

---

The `@aurelia/insights` package provides a comprehensive solution for understanding and optimizing your Aurelia application's performance. By combining automatic framework tracking with powerful custom telemetry APIs and beautiful visualization components, you can gain deep insights into both framework-level performance and application-specific behavior.
