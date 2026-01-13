# Advanced Configuration and Features

The Aurelia Fetch Client offers powerful advanced features for enterprise applications, including sophisticated caching, request monitoring, custom interceptor patterns, and integration with complex authentication systems.

## Advanced Header Management

### Dynamic Authorization Headers

Headers can be functions that are evaluated for each request, perfect for handling token refresh scenarios:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class AuthenticatedApiService {
  private http = resolve(IHttpClient);
  private tokenStorage = new TokenStorage();

  constructor() {
    this.http.configure(config => config
      .withDefaults({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': () => {
            const token = this.tokenStorage.getAccessToken();
            return token ? `Bearer ${token}` : '';
          },
          'X-Client-Version': () => this.getClientVersion(),
          'X-Request-ID': () => this.generateRequestId()
        }
      })
    );
  }

  private getClientVersion(): string {
    return process.env.APP_VERSION || '1.0.0';
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}

class TokenStorage {
  getAccessToken(): string | null {
    const tokenData = localStorage.getItem('auth_tokens');
    if (!tokenData) return null;

    const { accessToken, expiresAt } = JSON.parse(tokenData);
    
    // Check if token is expired
    if (Date.now() >= expiresAt) {
      this.refreshToken();
      return this.getAccessToken(); // Recursive call after refresh
    }

    return accessToken;
  }

  private refreshToken(): void {
    // Token refresh logic here
    // This is synchronous for simplicity, but could be async
  }
}
```

### Conditional Headers

Apply different headers based on request characteristics:

```typescript
export class ConditionalHeaderService {
  private http = resolve(IHttpClient);

  constructor() {
    this.http.configure(config => config.withInterceptor({
      request(request) {
        const url = new URL(request.url);
        
        // Add API key for external APIs
        if (url.hostname !== window.location.hostname) {
          request.headers.set('X-API-Key', this.getExternalApiKey(url.hostname));
        }
        
        // Add CSRF token for state-changing operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
          const csrfToken = this.getCsrfToken();
          if (csrfToken) {
            request.headers.set('X-CSRF-Token', csrfToken);
          }
        }
        
        // Add correlation ID for internal services
        if (url.pathname.startsWith('/api/internal/')) {
          request.headers.set('X-Correlation-ID', this.generateCorrelationId());
        }

        return request;
      }
    }));
  }

  private getExternalApiKey(hostname: string): string {
    const keyMap = {
      'api.external1.com': process.env.EXTERNAL_API_1_KEY,
      'api.external2.com': process.env.EXTERNAL_API_2_KEY
    };
    return keyMap[hostname] || '';
  }

  private getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  }

  private generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}
```

## Built-in Cache Interceptor

The fetch client includes a sophisticated caching system with multiple storage options:

```typescript
import { IHttpClient, CacheInterceptor } from '@aurelia/fetch-client';
import { DI } from '@aurelia/kernel';

export class CachedApiService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupCaching();
  }

  private setupCaching() {
    // Create cache interceptor with configuration
    const cacheInterceptor = DI.getGlobalContainer().invoke(CacheInterceptor, [{
      cacheTime: 300_000,        // Cache for 5 minutes
      staleTime: 60_000,         // Data becomes stale after 1 minute
      refreshStaleImmediate: false, // Don't block on stale refresh
      refreshInterval: 30_000,   // Background refresh every 30 seconds
    }]);

    this.http.configure(config => config.withInterceptor(cacheInterceptor));
  }

  // Cache interceptor automatically handles these GET requests
  async getUserProfile(userId: string) {
    const response = await this.http.get(`/api/users/${userId}`);
    return response.json();
  }

  async getStaticData() {
    // This will be cached and refreshed in background
    const response = await this.http.get('/api/config/static');
    return response.json();
  }
}
```

### Custom Cache Storage

Use different storage backends for caching:

```typescript
import { 
  CacheInterceptor, 
  BrowserLocalStorage, 
  BrowserSessionStorage,
  BrowserIndexDBStorage,
  MemoryStorage 
} from '@aurelia/fetch-client';

export class CustomCacheService {
  private http = resolve(IHttpClient);

  setupPersistentCaching() {
    // Use localStorage for persistent caching across sessions
    const persistentCache = DI.getGlobalContainer().invoke(CacheInterceptor, [{
      cacheTime: 3600_000, // 1 hour
      storage: new BrowserLocalStorage()
    }]);

    this.http.configure(config => config.withInterceptor(persistentCache));
  }

  setupSessionCaching() {
    // Use sessionStorage for session-only caching
    const sessionCache = DI.getGlobalContainer().invoke(CacheInterceptor, [{
      cacheTime: 1800_000, // 30 minutes
      storage: new BrowserSessionStorage()
    }]);

    this.http.configure(config => config.withInterceptor(sessionCache));
  }

  setupIndexDBCaching() {
    // Use IndexedDB for large data caching
    const indexDbCache = DI.getGlobalContainer().invoke(CacheInterceptor, [{
      cacheTime: 7200_000, // 2 hours
      storage: new BrowserIndexDBStorage()
    }]);

    this.http.configure(config => config.withInterceptor(indexDbCache));
  }
}
```

## Request Tracking and Lifecycle Management

The HttpClient provides built-in request tracking capabilities that enable you to monitor active requests and respond to request lifecycle events. This is essential for building loading indicators, progress tracking, and request coordination features.

### Built-in Request Properties

The HttpClient exposes two key properties for request tracking:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class RequestTrackerService {
  private http = resolve(IHttpClient);

  checkRequestStatus() {
    // Get the current number of active requests
    console.log('Active requests:', this.http.activeRequestCount);

    // Check if any requests are currently active
    console.log('Is requesting:', this.http.isRequesting);
  }

  async makeTrackedRequest() {
    console.log('Before request:', this.http.activeRequestCount);  // 0
    console.log('Is requesting:', this.http.isRequesting);         // false

    const promise = this.http.get('/api/data');

    console.log('During request:', this.http.activeRequestCount);  // 1
    console.log('Is requesting:', this.http.isRequesting);         // true

    await promise;

    console.log('After request:', this.http.activeRequestCount);   // 0
    console.log('Is requesting:', this.http.isRequesting);         // false
  }
}
```

**Key Properties:**

- **`activeRequestCount`**: The current number of active requests (including those being processed by interceptors)
- **`isRequesting`**: Boolean indicating whether one or more requests are currently active

### Request Lifecycle Events

The HttpClient can dispatch DOM events for request lifecycle tracking. This requires configuring an event dispatcher using `withDispatcher()`.

#### Available Events

```typescript
import { HttpClientEvent } from '@aurelia/fetch-client';

// Available lifecycle events:
HttpClientEvent.started  // 'aurelia-fetch-client-request-started'
HttpClientEvent.drained  // 'aurelia-fetch-client-requests-drained'
```

- **`started`**: Fired when the first request starts (when `activeRequestCount` goes from 0 to 1)
- **`drained`**: Fired when all requests complete (when `activeRequestCount` returns to 0)

#### Configuring Event Dispatcher

```typescript
import { IHttpClient, HttpClientEvent } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class RequestEventService {
  private http = resolve(IHttpClient);

  constructor() {
    // Configure event dispatcher on a DOM node
    this.http.configure(config => config.withDispatcher(document.body));

    // Listen for lifecycle events
    this.setupEventListeners();
  }

  private setupEventListeners() {
    document.body.addEventListener(HttpClientEvent.started, (event: CustomEvent) => {
      console.log('First request started');
      // Event fires when activeRequestCount goes from 0 to 1
    });

    document.body.addEventListener(HttpClientEvent.drained, (event: CustomEvent) => {
      console.log('All requests completed');
      // Event fires when activeRequestCount returns to 0
    });
  }
}
```

### Building a Loading Indicator

Use request tracking to implement a global loading indicator:

```typescript
export class LoadingIndicatorService {
  private http = resolve(IHttpClient);
  private loadingElement: HTMLElement;

  constructor() {
    this.loadingElement = document.getElementById('loading-indicator');
    this.setupLoadingIndicator();
  }

  private setupLoadingIndicator() {
    // Configure event dispatcher
    this.http.configure(config => config.withDispatcher(document.body));

    // Show loading indicator when requests start
    document.body.addEventListener(HttpClientEvent.started, () => {
      this.showLoadingIndicator();
    });

    // Hide loading indicator when all requests complete
    document.body.addEventListener(HttpClientEvent.drained, () => {
      this.hideLoadingIndicator();
    });
  }

  private showLoadingIndicator() {
    this.loadingElement.classList.add('active');
    document.body.classList.add('loading');
  }

  private hideLoadingIndicator() {
    this.loadingElement.classList.remove('active');
    document.body.classList.remove('loading');
  }
}
```

### Advanced Request Monitoring

Combine built-in tracking with custom monitoring:

```typescript
export class AdvancedRequestMonitor {
  private http = resolve(IHttpClient);
  private requestDetails = new Map<string, {
    url: string;
    method: string;
    startTime: number;
  }>();

  constructor() {
    this.setupComprehensiveMonitoring();
  }

  private setupComprehensiveMonitoring() {
    // Configure event dispatcher
    this.http.configure(config => config
      .withDispatcher(document.body)
      .withInterceptor({
        request: (request) => {
          const requestId = this.generateRequestId();
          request.headers.set('X-Request-ID', requestId);

          // Store request details
          this.requestDetails.set(requestId, {
            url: request.url,
            method: request.method,
            startTime: Date.now(),
          });

          console.log(`[${requestId}] Starting: ${request.method} ${request.url}`);
          console.log(`Active requests: ${this.http.activeRequestCount}`);

          return request;
        },

        response: (response, request) => {
          const requestId = request?.headers.get('X-Request-ID');
          if (requestId) {
            const details = this.requestDetails.get(requestId);
            if (details) {
              const duration = Date.now() - details.startTime;
              console.log(`[${requestId}] Completed in ${duration}ms: ${response.status}`);
              this.requestDetails.delete(requestId);
            }
          }

          console.log(`Remaining requests: ${this.http.activeRequestCount - 1}`);
          return response;
        },

        responseError: (error, request) => {
          const requestId = request?.headers.get('X-Request-ID');
          if (requestId) {
            const details = this.requestDetails.get(requestId);
            if (details) {
              const duration = Date.now() - details.startTime;
              console.error(`[${requestId}] Failed after ${duration}ms`);
              this.requestDetails.delete(requestId);
            }
          }

          throw error;
        }
      })
    );

    // Listen for lifecycle events
    document.body.addEventListener(HttpClientEvent.started, () => {
      console.log('🚀 Request activity started');
      this.onRequestActivityStarted();
    });

    document.body.addEventListener(HttpClientEvent.drained, () => {
      console.log('✅ Request activity completed');
      this.onRequestActivityCompleted();
    });
  }

  private onRequestActivityStarted() {
    // Custom logic when requests begin
    // This fires only when going from 0 to 1 active requests
  }

  private onRequestActivityCompleted() {
    // Custom logic when all requests complete
    // This fires only when going from 1+ to 0 active requests
    console.log('All tracked requests completed:', this.requestDetails.size === 0);
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  // Public API
  getActiveRequestCount(): number {
    return this.http.activeRequestCount;
  }

  isRequesting(): boolean {
    return this.http.isRequesting;
  }

  getCurrentRequests(): Array<{ url: string; method: string; duration: number }> {
    return Array.from(this.requestDetails.values()).map(details => ({
      ...details,
      duration: Date.now() - details.startTime,
    }));
  }
}
```

### Progress Tracking Component

Build a reactive progress tracker:

```typescript
export class ProgressTracker {
  private http = resolve(IHttpClient);
  private progressCallbacks = new Set<(progress: RequestProgress) => void>();

  constructor() {
    this.setupProgressTracking();
  }

  private setupProgressTracking() {
    this.http.configure(config => config
      .withDispatcher(document.body)
      .withInterceptor({
        request: (request) => {
          this.notifyProgress();
          return request;
        },

        response: (response) => {
          this.notifyProgress();
          return response;
        },

        responseError: (error) => {
          this.notifyProgress();
          throw error;
        }
      })
    );

    // React to lifecycle events
    document.body.addEventListener(HttpClientEvent.started, () => {
      this.notifyProgress();
    });

    document.body.addEventListener(HttpClientEvent.drained, () => {
      this.notifyProgress();
    });
  }

  private notifyProgress() {
    const progress: RequestProgress = {
      activeCount: this.http.activeRequestCount,
      isRequesting: this.http.isRequesting,
      timestamp: Date.now(),
    };

    this.progressCallbacks.forEach(callback => callback(progress));
  }

  subscribe(callback: (progress: RequestProgress) => void): () => void {
    this.progressCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  getCurrentProgress(): RequestProgress {
    return {
      activeCount: this.http.activeRequestCount,
      isRequesting: this.http.isRequesting,
      timestamp: Date.now(),
    };
  }
}

interface RequestProgress {
  activeCount: number;
  isRequesting: boolean;
  timestamp: number;
}
```

### Request Queue Visualization

Display active requests in real-time:

```typescript
export class RequestQueueVisualizer {
  private http = resolve(IHttpClient);
  private queueDisplay: HTMLElement;

  constructor(queueDisplay: HTMLElement) {
    this.queueDisplay = queueDisplay;
    this.setupVisualization();
  }

  private setupVisualization() {
    this.http.configure(config => config
      .withDispatcher(document.body)
      .withInterceptor({
        request: (request) => {
          this.updateDisplay();
          return request;
        },

        response: (response) => {
          this.updateDisplay();
          return response;
        },

        responseError: (error) => {
          this.updateDisplay();
          throw error;
        }
      })
    );
  }

  private updateDisplay() {
    const count = this.http.activeRequestCount;
    const status = this.http.isRequesting ? 'active' : 'idle';

    this.queueDisplay.innerHTML = `
      <div class="request-queue ${status}">
        <div class="status">${status.toUpperCase()}</div>
        <div class="count">
          <span class="number">${count}</span>
          <span class="label">${count === 1 ? 'request' : 'requests'} active</span>
        </div>
        <div class="indicator">
          ${this.createIndicatorDots(count)}
        </div>
      </div>
    `;
  }

  private createIndicatorDots(count: number): string {
    return Array.from({ length: Math.min(count, 10) }, () =>
      '<span class="dot"></span>'
    ).join('');
  }
}
```

### Best Practices for Request Tracking

#### 1. Use Events for UI Updates

Prefer lifecycle events over polling for UI updates:

```typescript
// Good - Event-driven
document.body.addEventListener(HttpClientEvent.started, () => {
  showLoadingSpinner();
});

// Avoid - Polling
setInterval(() => {
  if (this.http.isRequesting) {
    showLoadingSpinner();
  }
}, 100);
```

#### 2. Single Event Dispatcher

Configure the dispatcher once during initialization:

```typescript
export class HttpClientSetup {
  static initialize(http: IHttpClient) {
    http.configure(config => config
      .withDispatcher(document.body)
      .withBaseUrl('/api')
      // ... other configuration
    );
  }
}
```

#### 3. Cleanup Event Listeners

Always remove event listeners when components are destroyed:

```typescript
export class RequestMonitorComponent {
  private startedListener: EventListener;
  private drainedListener: EventListener;

  constructor() {
    this.startedListener = () => this.onRequestsStarted();
    this.drainedListener = () => this.onRequestsDrained();

    document.body.addEventListener(HttpClientEvent.started, this.startedListener);
    document.body.addEventListener(HttpClientEvent.drained, this.drainedListener);
  }

  dispose() {
    document.body.removeEventListener(HttpClientEvent.started, this.startedListener);
    document.body.removeEventListener(HttpClientEvent.drained, this.drainedListener);
  }
}
```

#### 4. Combine with Interceptors

Use interceptors for detailed request tracking:

```typescript
export class DetailedRequestTracker {
  private http = resolve(IHttpClient);

  constructor() {
    this.http.configure(config => config
      .withDispatcher(document.body)
      .withInterceptor({
        request: (request) => {
          // Track individual request start
          console.log('Request started:', request.url);
          console.log('Total active:', this.http.activeRequestCount);
          return request;
        },

        response: (response, request) => {
          // Track individual request completion
          console.log('Request completed:', request?.url);
          console.log('Remaining active:', this.http.activeRequestCount - 1);
          return response;
        }
      })
    );
  }
}
```

### Summary

Request tracking provides:

- **`activeRequestCount`**: Number of currently active requests
- **`isRequesting`**: Boolean indicating if any requests are active
- **`HttpClientEvent.started`**: Fired when first request starts
- **`HttpClientEvent.drained`**: Fired when all requests complete
- **`withDispatcher(node)`**: Configure DOM node for event dispatching

These features enable robust loading indicators, progress tracking, and request coordination in your applications.

## Advanced Authentication Patterns

### Automatic Token Refresh

Handle token expiration and refresh transparently:

```typescript
export class TokenRefreshService {
  private http = resolve(IHttpClient);
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.setupTokenRefresh();
  }

  private setupTokenRefresh() {
    this.http.configure(config => config.withInterceptor({
      async responseError(error, request, client) {
        if (error instanceof Response && error.status === 401) {
          // Token expired, try to refresh
          try {
            const newToken = await this.refreshAccessToken();
            
            // Retry original request with new token
            const newRequest = new Request(request.url, {
              method: request.method,
              headers: {
                ...Object.fromEntries(request.headers.entries()),
                'Authorization': `Bearer ${newToken}`
              },
              body: request.body
            });
            
            return client.fetch(newRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.redirectToLogin();
            throw error;
          }
        }
        
        throw error;
      }
    }));
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    
    // Store new tokens
    this.storeTokens(accessToken, newRefreshToken);
    
    return accessToken;
  }

  private getRefreshToken(): string | null {
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens).refreshToken : null;
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    const tokens = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (55 * 60 * 1000) // 55 minutes
    };
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  private redirectToLogin() {
    localStorage.removeItem('auth_tokens');
    window.location.href = '/login';
  }
}
```

## Request Batching and Coordination

### Request Deduplication

Prevent duplicate concurrent requests:

```typescript
export class RequestDeduplicationService {
  private http = resolve(IHttpClient);
  private pendingRequests = new Map<string, Promise<Response>>();

  constructor() {
    this.setupDeduplication();
  }

  private setupDeduplication() {
    this.http.configure(config => config.withInterceptor({
      request: (request) => {
        // Only deduplicate GET requests
        if (request.method !== 'GET') {
          return request;
        }

        const key = this.getRequestKey(request);
        const existingRequest = this.pendingRequests.get(key);

        if (existingRequest) {
          // Return the existing request's promise
          return existingRequest.then(response => response.clone());
        }

        // Store the request promise
        const requestPromise = fetch(request).then(response => {
          // Clean up when request completes
          this.pendingRequests.delete(key);
          return response;
        }).catch(error => {
          // Clean up on error too
          this.pendingRequests.delete(key);
          throw error;
        });

        this.pendingRequests.set(key, requestPromise);
        
        // Return the request to continue normal processing
        return request;
      }
    }));
  }

  private getRequestKey(request: Request): string {
    // Create unique key based on URL and headers
    const headers = Array.from(request.headers.entries()).sort();
    return `${request.method}:${request.url}:${JSON.stringify(headers)}`;
  }
}
```

### Request Queuing

Queue and coordinate multiple requests:

```typescript
export class RequestQueueService {
  private http = resolve(IHttpClient);
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private activeRequests = 0;

  async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    const request = this.requestQueue.shift();
    if (!request) {
      return;
    }

    this.isProcessing = true;
    this.activeRequests++;

    try {
      await request();
    } finally {
      this.activeRequests--;
      this.isProcessing = false;
      
      // Process next request in queue
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 0);
      }
    }
  }

  // Usage example
  async uploadFiles(files: File[]) {
    const uploadPromises = files.map(file => 
      this.queueRequest(() => 
        this.http.post('/api/upload', this.createFormData(file))
      )
    );

    return Promise.all(uploadPromises);
  }

  private createFormData(file: File): FormData {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  }
}
```

## Performance Optimization

### Request Timeout Management

Implement sophisticated timeout handling:

```typescript
export class TimeoutService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupTimeouts();
  }

  private setupTimeouts() {
    this.http.configure(config => config.withInterceptor({
      request: (request) => {
        // Add timeout based on request type
        const timeout = this.getTimeoutForRequest(request);
        
        if (timeout > 0) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          // Store cleanup function
          (request as any).__timeoutId = timeoutId;
          
          return new Request(request, { signal: controller.signal });
        }
        
        return request;
      },
      
      response: (response, request) => {
        // Clear timeout on successful response
        const timeoutId = (request as any).__timeoutId;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        return response;
      },
      
      responseError: (error, request) => {
        // Clear timeout on error
        const timeoutId = (request as any).__timeoutId;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Convert AbortError to TimeoutError for clarity
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout: ${request?.url}`);
        }
        
        throw error;
      }
    }));
  }

  private getTimeoutForRequest(request: Request): number {
    const url = new URL(request.url);
    
    // Different timeouts for different types of requests
    if (url.pathname.includes('/upload')) {
      return 300_000; // 5 minutes for uploads
    } else if (url.pathname.includes('/reports')) {
      return 120_000; // 2 minutes for reports
    } else if (request.method === 'GET') {
      return 30_000;  // 30 seconds for GET requests
    } else {
      return 60_000;  // 1 minute for other requests
    }
  }
}
```

### Response Compression Handling

Handle compressed responses efficiently:

```typescript
export class CompressionService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupCompression();
  }

  private setupCompression() {
    this.http.configure(config => config
      .withDefaults({
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        }
      })
      .withInterceptor({
        response: (response) => {
          const encoding = response.headers.get('content-encoding');
          
          if (encoding) {
            console.log(`Response compressed with: ${encoding}`);
            
            // The browser automatically decompresses, but we can log it
            const originalSize = response.headers.get('content-length');
            if (originalSize) {
              console.log(`Compressed size: ${originalSize} bytes`);
            }
          }
          
          return response;
        }
      })
    );
  }
}
```

## Testing and Debugging Support

### Request/Response Logging

Comprehensive logging for development and debugging:

```typescript
export class LoggingService {
  private http = resolve(IHttpClient);
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    if (this.isDevelopment) {
      this.setupDetailedLogging();
    } else {
      this.setupProductionLogging();
    }
  }

  private setupDetailedLogging() {
    this.http.configure(config => config.withInterceptor({
      request: (request) => {
        const requestId = this.generateRequestId();
        (request as any).__requestId = requestId;
        
        console.group(`🚀 Request ${requestId}`);
        console.log('Method:', request.method);
        console.log('URL:', request.url);
        console.log('Headers:', Object.fromEntries(request.headers.entries()));
        
        if (request.body) {
          this.logRequestBody(request);
        }
        console.groupEnd();
        
        return request;
      },
      
      response: async (response, request) => {
        const requestId = (request as any).__requestId;
        const responseClone = response.clone();
        
        console.group(`✅ Response ${requestId}`);
        console.log('Status:', response.status, response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        try {
          const body = await responseClone.text();
          if (body) {
            console.log('Body:', this.formatResponseBody(body, response));
          }
        } catch (error) {
          console.log('Body: (could not read)');
        }
        
        console.groupEnd();
        return response;
      },
      
      responseError: (error, request) => {
        const requestId = (request as any).__requestId;
        
        console.group(`❌ Error ${requestId}`);
        console.error('Error:', error);
        console.groupEnd();
        
        throw error;
      }
    }));
  }

  private setupProductionLogging() {
    this.http.configure(config => config.withInterceptor({
      responseError: (error, request) => {
        // Only log errors in production
        console.error('HTTP Error:', {
          url: request?.url,
          method: request?.method,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      }
    }));
  }

  private logRequestBody(request: Request) {
    // Note: This is tricky because Request.body is a stream
    // In practice, you might want to log at a higher level
    console.log('Body: (stream - cannot log without consuming)');
  }

  private formatResponseBody(body: string, response: Response): any {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    
    return body.length > 200 ? `${body.substring(0, 200)}...` : body;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 8);
  }
}
```

These advanced patterns demonstrate the full power of the Aurelia Fetch Client for enterprise applications. The combination of interceptors, event monitoring, caching, and authentication patterns provides a robust foundation for complex HTTP client requirements.
