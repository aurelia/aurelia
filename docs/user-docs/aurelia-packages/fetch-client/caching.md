# Advanced Caching with Fetch Client

The Aurelia Fetch Client includes a sophisticated caching system that provides fine-grained control over request caching, cache storage, and cache lifecycle management. This guide covers the complete caching API, including the Cache Service, event system, and storage backends.

## Overview

The caching system consists of several key components:

- **CacheInterceptor**: An interceptor that automatically caches GET requests
- **CacheService**: A service that manages cached data and publishes cache events
- **ICacheStorage**: An interface for implementing custom storage backends
- **Built-in Storage Backends**: Memory, LocalStorage, SessionStorage, and IndexedDB implementations
- **Cache Events**: A comprehensive event system for monitoring cache behavior

## Basic Cache Configuration

### Simple Caching Setup

```typescript
import { IHttpClient, CacheInterceptor } from '@aurelia/fetch-client';
import { DI, resolve } from '@aurelia/kernel';

export class CachedApiService {
  private http = resolve(IHttpClient);

  constructor() {
    // Create cache interceptor with basic configuration
    const cacheInterceptor = DI.getGlobalContainer().invoke(CacheInterceptor, [{
      cacheTime: 300_000,  // Cache valid for 5 minutes
      staleTime: 60_000,   // Data becomes stale after 1 minute
    }]);

    this.http.configure(config => config.withInterceptor(cacheInterceptor));
  }

  async getUser(id: string) {
    // This request will be automatically cached
    const response = await this.http.get(`/api/users/${id}`);
    return response.json();
  }
}
```

## Cache Configuration Options

The cache interceptor accepts several configuration options:

```typescript
interface ICacheConfiguration {
  /** Time in milliseconds before cached data is considered expired (default: 5 minutes) */
  cacheTime?: number;

  /** Time in milliseconds before cached data is considered stale (default: 0) */
  staleTime?: number;

  /** If true, refresh stale data immediately and block the request (default: false) */
  refreshStaleImmediate?: boolean;

  /** Interval in milliseconds for background cache refresh (default: undefined - no background refresh) */
  refreshInterval?: number;

  /** Custom storage backend (default: MemoryStorage) */
  storage?: ICacheStorage;
}
```

### Understanding Cache Timing

The difference between `staleTime` and `cacheTime`:

- **staleTime**: After this period, data is considered "stale" but can still be returned while being refreshed in the background
- **cacheTime**: After this period, data is completely expired and will not be returned; a fresh fetch is required

```typescript
const cacheConfig = {
  staleTime: 60_000,    // After 1 minute, data is stale but usable
  cacheTime: 300_000,   // After 5 minutes, data is completely expired
  refreshStaleImmediate: false,  // Return stale data immediately, refresh in background
};
```

**Flow:**
1. **0-1 minute**: Fresh data returned from cache
2. **1-5 minutes**: Stale data returned from cache, background refresh triggered
3. **After 5 minutes**: No cached data available, fresh fetch required

## Cache Service API

The `CacheService` provides direct access to the cache and its event system.

### Accessing the Cache Service

```typescript
import { ICacheService } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class CacheManagementService {
  private cacheService = resolve(ICacheService);

  // Your cache management methods
}
```

### Cache Service Methods

#### set() and get()

Store and retrieve typed data:

```typescript
export class CacheManagementService {
  private cacheService = resolve(ICacheService);

  async cacheUserData(userId: string, userData: User) {
    // Store data with cache options
    this.cacheService.set(
      `user:${userId}`,
      userData,
      {
        cacheTime: 300_000,  // 5 minutes
        staleTime: 60_000,   // 1 minute
      },
      new Request(`/api/users/${userId}`)  // Original request for potential refresh
    );
  }

  getUserFromCache(userId: string): User | undefined {
    // Retrieve typed data
    return this.cacheService.get<User>(`user:${userId}`);
  }
}
```

#### setItem() and getItem()

Store and retrieve complete cache items with metadata:

```typescript
export class DetailedCacheService {
  private cacheService = resolve(ICacheService);

  getCacheDetails(key: string): ICacheItem<any> | undefined {
    // Returns complete cache item including timing metadata
    const cacheItem = this.cacheService.getItem(key);

    if (cacheItem) {
      console.log('Data:', cacheItem.data);
      console.log('Last cached:', new Date(cacheItem.lastCached));
      console.log('Stale time:', cacheItem.staleTime);
      console.log('Cache time:', cacheItem.cacheTime);
    }

    return cacheItem;
  }

  manualCacheStore<T>(key: string, data: T, options: {
    staleTime?: number;
    cacheTime?: number;
  }, request: Request) {
    const cacheItem: ICacheItem<T> = {
      data,
      staleTime: options.staleTime,
      cacheTime: options.cacheTime,
      // lastCached will be set automatically by setItem
    };

    this.cacheService.setItem(key, cacheItem, request);
  }
}
```

#### delete() and clear()

Remove cached data:

```typescript
export class CacheCleanupService {
  private cacheService = resolve(ICacheService);

  removeCachedUser(userId: string) {
    // Delete specific cache entry
    this.cacheService.delete(`user:${userId}`);
  }

  clearAllCache() {
    // Clear entire cache
    this.cacheService.clear();

    // This also:
    // - Stops background refresh if enabled
    // - Clears all stale timers
    // - Publishes CacheEvent.Reset event
  }
}
```

## Cache Events System

The cache service publishes events for all cache operations, enabling powerful monitoring and debugging capabilities.

### Available Cache Events

```typescript
import { CacheEvent } from '@aurelia/fetch-client';

// All available events:
CacheEvent.Set                      // 'au:fetch:cache:set' - Item added to cache
CacheEvent.Get                      // 'au:fetch:cache:get' - Item retrieved (any result)
CacheEvent.Clear                    // 'au:fetch:cache:clear' - Single item deleted
CacheEvent.Reset                    // 'au:fetch:cache:reset' - All cache cleared
CacheEvent.Dispose                  // 'au:fetch:cache:dispose' - Cache service disposed
CacheEvent.CacheHit                 // 'au:fetch:cache:hit' - Valid item found
CacheEvent.CacheMiss                // 'au:fetch:cache:miss' - Item not found
CacheEvent.CacheStale               // 'au:fetch:cache:stale' - Item found but stale
CacheEvent.CacheStaleRefreshed      // 'au:fetch:cache:stale:refreshed' - Stale item refreshed
CacheEvent.CacheExpired             // 'au:fetch:cache:expired' - Item expired
CacheEvent.CacheBackgroundRefreshing // 'au:fetch:cache:background:refreshing' - Background refresh starting
CacheEvent.CacheBackgroundRefreshed  // 'au:fetch:cache:background:refreshed' - Background refresh completed
CacheEvent.CacheBackgroundStopped    // 'au:fetch:cache:background:stopped' - Background refresh stopped
```

### Subscribing to Cache Events

```typescript
import { ICacheService, CacheEvent, ICacheEventData } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class CacheMonitoringService {
  private cacheService = resolve(ICacheService);

  constructor() {
    this.setupCacheMonitoring();
  }

  private setupCacheMonitoring() {
    // Monitor cache hits
    this.cacheService.subscribe(CacheEvent.CacheHit, (data) => {
      console.log('Cache hit:', data.key, data.value);
    });

    // Monitor cache misses
    this.cacheService.subscribe(CacheEvent.CacheMiss, (data) => {
      console.log('Cache miss:', data.key);
    });

    // Monitor stale data access
    this.cacheService.subscribe(CacheEvent.CacheStale, (data) => {
      console.log('Stale data accessed:', data.key);
    });

    // One-time subscription for specific event
    this.cacheService.subscribeOnce(CacheEvent.CacheExpired, (data) => {
      console.log('Cache expired (first time):', data.key);
    });
  }
}
```

### Practical Event Monitoring Examples

#### Cache Performance Monitoring

```typescript
export class CachePerformanceMonitor {
  private cacheService = resolve(ICacheService);
  private metrics = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    expirations: 0,
  };

  constructor() {
    this.setupMetrics();
  }

  private setupMetrics() {
    this.cacheService.subscribe(CacheEvent.CacheHit, () => {
      this.metrics.hits++;
    });

    this.cacheService.subscribe(CacheEvent.CacheMiss, () => {
      this.metrics.misses++;
    });

    this.cacheService.subscribe(CacheEvent.CacheStale, () => {
      this.metrics.staleHits++;
    });

    this.cacheService.subscribe(CacheEvent.CacheExpired, () => {
      this.metrics.expirations++;
    });

    // Log metrics every minute
    setInterval(() => {
      console.log('Cache Metrics:', {
        hitRate: this.getHitRate(),
        totalRequests: this.metrics.hits + this.metrics.misses,
        ...this.metrics
      });
    }, 60000);
  }

  private getHitRate(): string {
    const total = this.metrics.hits + this.metrics.misses;
    if (total === 0) return '0%';
    return ((this.metrics.hits / total) * 100).toFixed(2) + '%';
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

#### Cache Debugging Dashboard

```typescript
export class CacheDebugger {
  private cacheService = resolve(ICacheService);
  private cacheLog: Array<{ event: string; key: string; timestamp: number }> = [];

  constructor() {
    this.setupDebugging();
  }

  private setupDebugging() {
    // Subscribe to all cache events
    const events = [
      CacheEvent.CacheHit,
      CacheEvent.CacheMiss,
      CacheEvent.CacheStale,
      CacheEvent.CacheExpired,
      CacheEvent.Set,
      CacheEvent.Clear,
    ];

    events.forEach(event => {
      this.cacheService.subscribe(event, (data) => {
        this.cacheLog.push({
          event,
          key: data.key,
          timestamp: Date.now(),
        });

        // Keep only last 100 entries
        if (this.cacheLog.length > 100) {
          this.cacheLog.shift();
        }

        // Console output for development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Cache] ${event}`, data);
        }
      });
    });
  }

  getCacheLog() {
    return [...this.cacheLog];
  }

  getEventsByKey(key: string) {
    return this.cacheLog.filter(entry => entry.key === key);
  }
}
```

## Background Refresh

Enable automatic background cache refresh to keep data fresh without user-triggered requests.

### Basic Background Refresh

```typescript
import { ICacheService } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class BackgroundRefreshService {
  private cacheService = resolve(ICacheService);

  enableBackgroundRefresh() {
    // Refresh all cached items every 30 seconds
    this.cacheService.startBackgroundRefresh(30_000);

    // Monitor refresh activity
    this.cacheService.subscribe(CacheEvent.CacheBackgroundRefreshing, () => {
      console.log('Background refresh starting...');
    });

    this.cacheService.subscribe(CacheEvent.CacheBackgroundRefreshed, (data) => {
      console.log('Refreshed:', data.key);
    });
  }

  disableBackgroundRefresh() {
    this.cacheService.stopBackgroundRefresh();
  }
}
```

### Conditional Background Refresh

```typescript
export class ConditionalRefreshService {
  private cacheService = resolve(ICacheService);
  private isVisible = true;

  constructor() {
    this.setupVisibilityTracking();
    this.setupConditionalRefresh();
  }

  private setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;

      if (this.isVisible) {
        // Page became visible, start background refresh
        this.cacheService.startBackgroundRefresh(30_000);
      } else {
        // Page hidden, stop background refresh to save resources
        this.cacheService.stopBackgroundRefresh();
      }
    });
  }

  private setupConditionalRefresh() {
    // Only start if page is visible
    if (this.isVisible) {
      this.cacheService.startBackgroundRefresh(30_000);
    }
  }
}
```

## Storage Backends

The cache system supports multiple storage backends for different use cases.

### Memory Storage (Default)

Fast, temporary storage that doesn't persist across page reloads:

```typescript
import { MemoryStorage, CacheInterceptor } from '@aurelia/fetch-client';
import { DI } from '@aurelia/kernel';

const cacheInterceptor = DI.getGlobalContainer().invoke(CacheInterceptor, [{
  cacheTime: 300_000,
  storage: new MemoryStorage()  // Explicit memory storage (this is the default)
}]);
```

**Characteristics:**
- Fast read/write operations
- No persistence across page reloads
- No storage size limits (constrained by available memory)
- Best for: Temporary caching during a single session

### LocalStorage Backend

Persistent storage that survives browser restarts:

```typescript
import { BrowserLocalStorage, CacheInterceptor } from '@aurelia/fetch-client';
import { DI } from '@aurelia/kernel';

const cacheInterceptor = DI.getGlobalContainer().invoke(CacheInterceptor, [{
  cacheTime: 3600_000,  // 1 hour
  storage: new BrowserLocalStorage()
}]);
```

**Characteristics:**
- Data persists across browser sessions
- ~5-10MB storage limit (varies by browser)
- Synchronous API
- Best for: User preferences, small datasets that should persist

### SessionStorage Backend

Session-scoped storage that persists across page refreshes but not browser restarts:

```typescript
import { BrowserSessionStorage, CacheInterceptor } from '@aurelia/fetch-client';
import { DI } from '@aurelia/kernel';

const cacheInterceptor = DI.getGlobalContainer().invoke(CacheInterceptor, [{
  cacheTime: 1800_000,  // 30 minutes
  storage: new BrowserSessionStorage()
}]);
```

**Characteristics:**
- Data persists across page reloads within the same session
- Cleared when browser tab is closed
- ~5-10MB storage limit (varies by browser)
- Best for: Session-specific data, temporary form state

### IndexedDB Backend

Large-scale persistent storage:

```typescript
import { BrowserIndexDBStorage, CacheInterceptor } from '@aurelia/fetch-client';
import { DI } from '@aurelia/kernel';

const cacheInterceptor = DI.getGlobalContainer().invoke(CacheInterceptor, [{
  cacheTime: 7200_000,  // 2 hours
  storage: new BrowserIndexDBStorage()
}]);
```

**Characteristics:**
- Large storage capacity (typically hundreds of MB or more)
- Asynchronous API
- Data persists across sessions
- Best for: Large datasets, offline-first applications

### Choosing the Right Storage Backend

| Use Case | Recommended Backend | Reason |
|----------|-------------------|---------|
| API responses for current page | MemoryStorage | Fast, no persistence needed |
| User preferences | BrowserLocalStorage | Needs to persist across sessions |
| Shopping cart | BrowserSessionStorage | Session-scoped but survives refresh |
| Large datasets, offline support | BrowserIndexDBStorage | Large capacity, persistent |
| Temporary form data | BrowserSessionStorage | Session-scoped |
| Authentication tokens | BrowserLocalStorage | Needs to persist, security handled elsewhere |

## Custom Storage Implementation

Implement your own storage backend for specialized needs:

```typescript
import { ICacheStorage, ICacheItem } from '@aurelia/fetch-client';

export class CustomRedisStorage implements ICacheStorage {
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  delete(key: string): void {
    this.redisClient.del(key);
  }

  has(key: string): boolean {
    return this.redisClient.exists(key);
  }

  set<T>(key: string, value: ICacheItem<T>): void {
    this.redisClient.set(key, JSON.stringify(value));
  }

  get<T>(key: string): ICacheItem<T> | undefined {
    const value = this.redisClient.get(key);
    return value ? JSON.parse(value) : undefined;
  }

  clear(): void {
    this.redisClient.flushdb();
  }
}

// Usage
const customStorage = new CustomRedisStorage(redisClient);
const cacheInterceptor = DI.getGlobalContainer().invoke(CacheInterceptor, [{
  cacheTime: 600_000,
  storage: customStorage
}]);
```

## Complete Caching Example

Here's a comprehensive example combining multiple caching features:

```typescript
import {
  IHttpClient,
  ICacheService,
  CacheInterceptor,
  CacheEvent,
  BrowserLocalStorage
} from '@aurelia/fetch-client';
import { DI, resolve } from '@aurelia/kernel';

export class AdvancedCachingService {
  private http = resolve(IHttpClient);
  private cacheService = resolve(ICacheService);

  constructor() {
    this.setupCaching();
    this.setupMonitoring();
  }

  private setupCaching() {
    // Create cache interceptor with persistent storage
    const cacheInterceptor = DI.getGlobalContainer().invoke(CacheInterceptor, [{
      cacheTime: 600_000,      // 10 minutes
      staleTime: 120_000,      // 2 minutes
      refreshStaleImmediate: false,  // Use stale data while refreshing
      refreshInterval: 300_000,      // Background refresh every 5 minutes
      storage: new BrowserLocalStorage()
    }]);

    this.http.configure(config => config.withInterceptor(cacheInterceptor));
  }

  private setupMonitoring() {
    // Track cache performance
    let hitCount = 0;
    let missCount = 0;

    this.cacheService.subscribe(CacheEvent.CacheHit, (data) => {
      hitCount++;
      console.log('Cache hit:', data.key);
    });

    this.cacheService.subscribe(CacheEvent.CacheMiss, (data) => {
      missCount++;
      console.log('Cache miss:', data.key);
    });

    this.cacheService.subscribe(CacheEvent.CacheStale, (data) => {
      console.log('Serving stale data:', data.key);
    });

    // Log cache statistics every minute
    setInterval(() => {
      const total = hitCount + missCount;
      const hitRate = total > 0 ? ((hitCount / total) * 100).toFixed(2) : '0';
      console.log(`Cache hit rate: ${hitRate}%`);
    }, 60000);
  }

  // API methods automatically benefit from caching
  async getUser(id: string) {
    const response = await this.http.get(`/api/users/${id}`);
    return response.json();
  }

  async getProducts() {
    const response = await this.http.get('/api/products');
    return response.json();
  }

  // Manual cache management
  invalidateUserCache(userId: string) {
    this.cacheService.delete(`user:${userId}`);
  }

  clearAllCache() {
    this.cacheService.clear();
  }
}
```

## Best Practices

### 1. Choose Appropriate Cache Times

```typescript
// Short-lived data (real-time updates)
const realtimeCache = {
  staleTime: 5_000,    // 5 seconds
  cacheTime: 30_000,   // 30 seconds
};

// Moderate caching (user data)
const userCache = {
  staleTime: 60_000,   // 1 minute
  cacheTime: 300_000,  // 5 minutes
};

// Long-lived data (static content)
const staticCache = {
  staleTime: 600_000,  // 10 minutes
  cacheTime: 3600_000, // 1 hour
};
```

### 2. Monitor Cache Performance

Always implement cache monitoring in development to optimize cache configuration:

```typescript
if (process.env.NODE_ENV === 'development') {
  this.cacheService.subscribe(CacheEvent.CacheHit, (data) => {
    console.log('✅ Cache hit:', data.key);
  });

  this.cacheService.subscribe(CacheEvent.CacheMiss, (data) => {
    console.log('❌ Cache miss:', data.key);
  });
}
```

### 3. Use Background Refresh Strategically

Enable background refresh for frequently accessed data:

```typescript
// Enable for critical data
this.cacheService.startBackgroundRefresh(60_000);  // Every minute

// Disable when page is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    this.cacheService.stopBackgroundRefresh();
  } else {
    this.cacheService.startBackgroundRefresh(60_000);
  }
});
```

### 4. Handle Cache Invalidation

Invalidate cache when data changes:

```typescript
async updateUser(userId: string, data: UserData) {
  // Update the user
  await this.http.put(`/api/users/${userId}`, data);

  // Invalidate the cache
  this.cacheService.delete(`user:${userId}`);
}
```

## Summary

The Aurelia Fetch Client caching system provides:

- **Multiple storage backends**: Memory, LocalStorage, SessionStorage, IndexedDB
- **Comprehensive event system**: 13 different cache events for monitoring
- **Background refresh**: Automatic cache updating
- **Stale-while-revalidate**: Serve stale data while fetching fresh data
- **Fine-grained control**: Direct cache service access for manual management

This powerful caching system enables you to build high-performance applications with optimal data freshness and minimal network requests.
