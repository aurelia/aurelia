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

## Request Event Monitoring

Monitor and respond to request lifecycle events:

```typescript
export class RequestMonitoringService {
  private http = resolve(IHttpClient);
  private activeRequests = new Set<string>();

  constructor() {
    this.setupEventMonitoring();
    this.setupRequestTracking();
  }

  private setupEventMonitoring() {
    // Configure event dispatcher
    this.http.configure(config => config.withDispatcher(document.body));

    // Listen for request lifecycle events
    document.body.addEventListener('aurelia-fetch-client-request-started', (event: CustomEvent) => {
      console.log('Request started:', event.detail);
      this.showLoadingIndicator();
    });

    document.body.addEventListener('aurelia-fetch-client-requests-drained', () => {
      console.log('All requests completed');
      this.hideLoadingIndicator();
    });
  }

  private setupRequestTracking() {
    this.http.configure(config => config.withInterceptor({
      request: (request) => {
        const requestId = this.generateRequestId();
        this.activeRequests.add(requestId);
        
        // Add tracking header
        request.headers.set('X-Request-ID', requestId);
        
        console.log(`Starting request ${requestId}: ${request.method} ${request.url}`);
        return request;
      },
      
      response: (response, request) => {
        const requestId = request?.headers.get('X-Request-ID');
        if (requestId) {
          this.activeRequests.delete(requestId);
          console.log(`Completed request ${requestId}: ${response.status}`);
        }
        return response;
      },
      
      responseError: (error, request) => {
        const requestId = request?.headers.get('X-Request-ID');
        if (requestId) {
          this.activeRequests.delete(requestId);
          console.error(`Failed request ${requestId}:`, error);
        }
        throw error;
      }
    }));
  }

  private showLoadingIndicator() {
    // Show global loading indicator
    document.body.classList.add('loading');
  }

  private hideLoadingIndicator() {
    // Hide global loading indicator
    document.body.classList.remove('loading');
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  // Public API for monitoring
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  isRequestActive(): boolean {
    return this.activeRequests.size > 0;
  }
}
```

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
        this.http.post('/api/upload', { body: this.createFormData(file) })
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
