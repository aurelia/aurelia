# Interceptors in Aurelia Fetch Client

Interceptors are a powerful feature of Aurelia's Fetch Client, allowing you to modify requests and responses or perform side effects like logging and authentication. They enable developers to implement centralized logic that handles various aspects of HTTP communication.

## Understanding Interceptors

Interceptors can be attached to the Fetch Client configuration and consist of four optional methods: `request`, `requestError`, `response`, and `responseError`. Here’s how each method operates:

- `request`: Invoked before a request is sent. This method receives the `Request` object and can modify it or return a new one. It can also return a `Response` object to short-circuit the fetch operation.
- `requestError`: Triggered if an error occurs during the request generation or in a `request` interceptor. This method can handle the error and potentially recover by returning a new `Request` object.
- `response`: Called after the server responds. This method receives the `Response` object, which can be manipulated or replaced before being returned to the original caller.
- `responseError`: Invoked when a fetch request fails due to network errors or when a `response` interceptor throws an error. It can handle the error and perform tasks like retrying the request or returning an alternative response.

Each method can return either their respective expected object (`Request` or `Response`) or a `Promise` that resolves to it.

## Example Interceptors

### Logging Interceptor

The logging interceptor tracks all outgoing requests and incoming responses, which is useful for debugging and monitoring.

```typescript
import { HttpClient } from '@aurelia/fetch-client';

const http = new HttpClient();
http.configure(config => {
    config.withInterceptor({
        request(request) {
            console.log(`Requesting: ${request.method} ${request.url}`);
            return request;
        },
        response(response) {
            console.log(`Received: ${response.status} ${response.url}`);
            return response;
        }
    });
});
```

### Authentication Interceptor

The authentication interceptor appends a bearer token to each request, centralizing the authentication handling for secured API endpoints.

```typescript
import { HttpClient } from '@aurelia/fetch-client';

const http = new HttpClient();
http.configure(config => {
    config.withInterceptor({
        request(request) {
            const token = 'YOUR_AUTH_TOKEN';
            request.headers.append('Authorization', `Bearer ${token}`);
            return request;
        }
    });
});
```

### Error Handling Interceptor

A robust error handling interceptor intercepts responses and response errors to manage API errors centrally.

```typescript
import { HttpClient } from '@aurelia/fetch-client';

const http = new HttpClient();
http.configure(config => {
    config.withInterceptor({
        response(response) {
            if (!response.ok) {
                handleError(response);
            }
            return response;
        },
        responseError(error) {
            handleError(error);
            throw error; // Rethrow error after handling
        }
    });
});

function handleError(error) {
    console.error('Fetch Error:', error);
    // Implement error logging, user notifications, etc.
}
```

## Advanced Interceptor Patterns

### Async Interceptors and Promise Handling

All interceptor methods support async operations and Promise returns:

```typescript
export class AsyncInterceptorService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupAsyncInterceptors();
  }

  private setupAsyncInterceptors() {
    this.http.configure(config => config.withInterceptor({
      async request(request) {
        // Async operation in request interceptor
        const sessionData = await this.getSessionData();
        
        if (sessionData.requiresAuth) {
          const token = await this.ensureValidToken();
          request.headers.set('Authorization', `Bearer ${token}`);
        }

        return request;
      },

      async response(response, request) {
        // Async response processing
        if (response.status === 401) {
          await this.handleAuthenticationFailure();
        }

        // Process response metadata
        const responseTime = response.headers.get('X-Response-Time');
        if (responseTime) {
          await this.recordMetrics(request?.url, responseTime);
        }

        return response;
      },

      async responseError(error, request, client) {
        // Async error recovery
        if (error instanceof Response && error.status === 503) {
          // Service unavailable - check health and retry
          const isHealthy = await this.checkServiceHealth();
          
          if (isHealthy) {
            // Service recovered, retry request
            await new Promise(resolve => setTimeout(resolve, 1000));
            return client.fetch(request);
          }
        }

        throw error;
      }
    }));
  }

  private async getSessionData() {
    // Simulate async session check
    return new Promise(resolve => 
      setTimeout(() => resolve({ requiresAuth: true }), 100)
    );
  }

  private async ensureValidToken(): Promise<string> {
    // Simulate token validation/refresh
    const storedToken = localStorage.getItem('access_token');
    
    if (this.isTokenExpired(storedToken)) {
      return await this.refreshToken();
    }
    
    return storedToken!;
  }

  private async recordMetrics(url: string, responseTime: string) {
    // Send metrics to analytics service
    await fetch('/analytics/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, responseTime, timestamp: Date.now() })
    });
  }
}
```

### Request Transformation Chain

Create sophisticated request transformation pipelines:

```typescript
export class RequestTransformationService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupTransformationChain();
  }

  private setupTransformationChain() {
    // Each interceptor adds specific transformations
    this.http.configure(config => config
      .withInterceptor(this.createSecurityInterceptor())
      .withInterceptor(this.createCompressionInterceptor())
      .withInterceptor(this.createCachingInterceptor())
      .withInterceptor(this.createMetricsInterceptor())
    );
  }

  private createSecurityInterceptor() {
    return {
      request: (request: Request) => {
        // Add security headers
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        request.headers.set('X-Client-Version', this.getClientVersion());
        
        // Add CSRF protection for state-changing requests
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
          const csrfToken = this.getCsrfToken();
          if (csrfToken) {
            request.headers.set('X-CSRF-Token', csrfToken);
          }
        }

        return request;
      }
    };
  }

  private createCompressionInterceptor() {
    return {
      request: (request: Request) => {
        // Request compression for large payloads
        const contentType = request.headers.get('content-type');
        
        if (contentType?.includes('application/json') && request.body) {
          request.headers.set('Accept-Encoding', 'gzip, deflate, br');
        }

        return request;
      }
    };
  }

  private createCachingInterceptor() {
    const cache = new Map<string, { response: Response; timestamp: number }>();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    return {
      request: (request: Request) => {
        // Only cache GET requests
        if (request.method !== 'GET') {
          return request;
        }

        const cacheKey = this.getCacheKey(request);
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log('Returning cached response for:', request.url);
          return cached.response.clone();
        }

        return request;
      },

      response: (response: Response, request?: Request) => {
        // Cache successful GET responses
        if (request?.method === 'GET' && response.ok) {
          const cacheKey = this.getCacheKey(request);
          cache.set(cacheKey, {
            response: response.clone(),
            timestamp: Date.now()
          });
        }

        return response;
      }
    };
  }

  private createMetricsInterceptor() {
    return {
      request: (request: Request) => {
        // Add timing information
        (request as any).__startTime = Date.now();
        return request;
      },

      response: (response: Response, request?: Request) => {
        const startTime = (request as any).__startTime;
        if (startTime) {
          const duration = Date.now() - startTime;
          console.log(`Request to ${request?.url} took ${duration}ms`);
          
          // Record performance metrics
          this.recordPerformanceMetric(request?.url, duration, response.status);
        }

        return response;
      }
    };
  }

  private getCacheKey(request: Request): string {
    return request.url + JSON.stringify(Array.from(request.headers.entries()).sort());
  }
}
```

### Conditional Interceptor Application

Apply interceptors selectively based on request characteristics:

```typescript
export class ConditionalInterceptorService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupConditionalInterceptors();
  }

  private setupConditionalInterceptors() {
    this.http.configure(config => config.withInterceptor({
      request: (request) => {
        const url = new URL(request.url);

        // Apply different logic based on URL patterns
        switch (true) {
          case url.pathname.startsWith('/api/auth/'):
            return this.handleAuthRequests(request);
          
          case url.pathname.startsWith('/api/files/'):
            return this.handleFileRequests(request);
          
          case url.pathname.startsWith('/api/external/'):
            return this.handleExternalApiRequests(request);
          
          case url.searchParams.has('cache'):
            return this.handleCacheableRequests(request);
          
          default:
            return this.handleStandardRequests(request);
        }
      },

      response: (response, request) => {
        const url = new URL(response.url);

        // Different response handling based on endpoints
        if (url.pathname.startsWith('/api/auth/')) {
          return this.handleAuthResponses(response);
        } else if (url.pathname.startsWith('/api/files/')) {
          return this.handleFileResponses(response);
        }

        return response;
      }
    }));
  }

  private handleAuthRequests(request: Request): Request {
    console.log('Processing auth request');
    
    // Remove auth headers for auth endpoints to avoid conflicts
    request.headers.delete('Authorization');
    
    // Add special auth endpoint headers
    request.headers.set('X-Auth-Client', 'web-app');
    
    return request;
  }

  private handleFileRequests(request: Request): Request {
    console.log('Processing file request');
    
    // Set appropriate timeout for file operations
    // Note: This would need custom timeout implementation
    
    // Don't add JSON content-type for file uploads
    if (request.method === 'POST' && !request.headers.has('content-type')) {
      // Let browser set content-type for FormData
    }
    
    return request;
  }

  private handleExternalApiRequests(request: Request): Request {
    console.log('Processing external API request');
    
    // Add API key for external services
    const apiKey = this.getExternalApiKey(request.url);
    if (apiKey) {
      request.headers.set('X-API-Key', apiKey);
    }
    
    // Set different user agent for external requests
    request.headers.set('User-Agent', 'MyApp/1.0');
    
    return request;
  }

  private handleCacheableRequests(request: Request): Request {
    console.log('Processing cacheable request');
    
    // Add cache control headers
    request.headers.set('Cache-Control', 'max-age=300');
    
    return request;
  }

  private handleStandardRequests(request: Request): Request {
    // Default request processing
    if (!request.headers.has('Accept')) {
      request.headers.set('Accept', 'application/json');
    }
    
    return request;
  }

  private handleAuthResponses(response: Response): Response {
    // Store auth tokens, update session, etc.
    if (response.ok && response.headers.has('X-Auth-Token')) {
      const token = response.headers.get('X-Auth-Token');
      localStorage.setItem('auth_token', token!);
    }
    
    return response;
  }

  private handleFileResponses(response: Response): Response {
    // Handle file download headers
    const disposition = response.headers.get('Content-Disposition');
    if (disposition) {
      console.log('File download response:', disposition);
    }
    
    return response;
  }
}
```

### Interceptor Disposal and Cleanup

Properly manage interceptor lifecycle and cleanup:

```typescript
export class ManagedInterceptorService implements IDisposable {
  private http = resolve(IHttpClient);
  private intervalIds: number[] = [];
  private eventListeners: Array<{ target: EventTarget; type: string; listener: EventListener }> = [];

  constructor() {
    this.setupManagedInterceptors();
  }

  private setupManagedInterceptors() {
    this.http.configure(config => config.withInterceptor({
      request: (request) => {
        // Track request metrics
        this.recordRequestMetric(request);
        return request;
      },

      response: (response, request) => {
        // Update health metrics
        this.updateHealthMetrics(response.status);
        return response;
      },

      // Interceptor cleanup method
      dispose: () => {
        console.log('Cleaning up interceptor resources');
        this.cleanup();
      }
    }));

    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      this.performPeriodicCleanup();
    }, 60000); // Every minute

    this.intervalIds.push(cleanupInterval);

    // Set up event listeners
    const visibilityListener = () => {
      if (document.hidden) {
        this.pauseMetrics();
      } else {
        this.resumeMetrics();
      }
    };

    document.addEventListener('visibilitychange', visibilityListener);
    this.eventListeners.push({
      target: document,
      type: 'visibilitychange',
      listener: visibilityListener
    });
  }

  private recordRequestMetric(request: Request) {
    // Implementation for request metrics
  }

  private updateHealthMetrics(status: number) {
    // Implementation for health metrics
  }

  private performPeriodicCleanup() {
    // Clean up expired cache entries, metrics, etc.
  }

  private pauseMetrics() {
    // Pause metric collection when page is hidden
  }

  private resumeMetrics() {
    // Resume metric collection when page is visible
  }

  private cleanup() {
    // Clear intervals
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds.length = 0;

    // Remove event listeners
    this.eventListeners.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener);
    });
    this.eventListeners.length = 0;
  }

  // Aurelia disposal interface
  dispose(): void {
    this.cleanup();
  }
}
```

## Best Practices and Advanced Considerations

### Interceptor Ordering Strategy

```typescript
export class OrderedInterceptorService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupOrderedInterceptors();
  }

  private setupOrderedInterceptors() {
    this.http.configure(config => config
      // 1. Security (first - affects all subsequent requests)
      .withInterceptor(this.createSecurityInterceptor())
      
      // 2. Authentication (needs to run before most other interceptors)
      .withInterceptor(this.createAuthInterceptor())
      
      // 3. Request transformation (modify request before caching/metrics)
      .withInterceptor(this.createTransformationInterceptor())
      
      // 4. Caching (should see final request form)
      .withInterceptor(this.createCacheInterceptor())
      
      // 5. Metrics/Logging (should capture final request state)
      .withInterceptor(this.createMetricsInterceptor())
      
      // 6. Retry (MUST be last - see documentation about retry limitations)
      .withRetry({ maxRetries: 3, strategy: RetryStrategy.exponential })
    );
  }
}
```

### Performance Optimization

```typescript
export class PerformantInterceptorService {
  private http = resolve(IHttpClient);
  private requestCache = new Map();
  private metricsBuffer: any[] = [];

  constructor() {
    this.setupPerformantInterceptors();
  }

  private setupPerformantInterceptors() {
    this.http.configure(config => config.withInterceptor({
      request: (request) => {
        // Minimize work in request interceptor
        
        // Use efficient header checking
        if (!request.headers.has('Accept')) {
          request.headers.set('Accept', 'application/json');
        }

        // Batch expensive operations
        this.queueMetricsUpdate('request', request.url);
        
        return request;
      },

      response: (response, request) => {
        // Efficient response processing
        
        // Use cloning sparingly (it's expensive)
        if (this.shouldCache(request)) {
          const cacheKey = this.getCacheKey(request!);
          this.requestCache.set(cacheKey, response.clone());
        }

        // Batch metrics updates
        this.queueMetricsUpdate('response', request?.url, response.status);
        
        return response;
      }
    }));

    // Process metrics in batches
    setInterval(() => {
      if (this.metricsBuffer.length > 0) {
        this.processMetricsBatch([...this.metricsBuffer]);
        this.metricsBuffer.length = 0;
      }
    }, 5000);
  }

  private shouldCache(request?: Request): boolean {
    return request?.method === 'GET' && 
           !request.url.includes('no-cache') &&
           this.requestCache.size < 100; // Prevent memory leaks
  }

  private queueMetricsUpdate(type: string, url?: string, status?: number) {
    this.metricsBuffer.push({ type, url, status, timestamp: Date.now() });
    
    // Prevent buffer from growing too large
    if (this.metricsBuffer.length > 1000) {
      this.metricsBuffer.splice(0, 500); // Remove oldest half
    }
  }

  private processMetricsBatch(metrics: any[]) {
    // Efficient batch processing of metrics
    console.log(`Processing ${metrics.length} metrics updates`);
  }
}
```

### Debugging and Testing Support

```typescript
export class DebuggableInterceptorService {
  private http = resolve(IHttpClient);
  private isDebugMode = process.env.NODE_ENV === 'development';

  constructor() {
    this.setupDebuggableInterceptors();
  }

  private setupDebuggableInterceptors() {
    this.http.configure(config => config.withInterceptor({
      request: (request) => {
        if (this.isDebugMode) {
          this.debugRequest(request);
        }

        // Add debug headers in development
        if (this.isDebugMode) {
          request.headers.set('X-Debug-Mode', 'true');
          request.headers.set('X-Debug-Timestamp', Date.now().toString());
        }

        return request;
      },

      response: (response, request) => {
        if (this.isDebugMode) {
          this.debugResponse(response, request);
        }

        return response;
      },

      responseError: (error, request) => {
        if (this.isDebugMode) {
          this.debugError(error, request);
        }

        // In development, add more context to errors
        if (this.isDebugMode && error instanceof Error) {
          error.message += ` (Request: ${request?.method} ${request?.url})`;
        }

        throw error;
      }
    }));
  }

  private debugRequest(request: Request) {
    console.group(`📤 Request: ${request.method} ${request.url}`);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    console.log('Mode:', request.mode);
    console.log('Credentials:', request.credentials);
    console.groupEnd();
  }

  private debugResponse(response: Response, request?: Request) {
    console.group(`📥 Response: ${response.status} ${request?.url}`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('OK:', response.ok);
    console.log('Redirected:', response.redirected);
    console.groupEnd();
  }

  private debugError(error: any, request?: Request) {
    console.group(`❌ Error: ${request?.url}`);
    console.error('Error:', error);
    console.log('Request method:', request?.method);
    console.log('Request headers:', request ? Object.fromEntries(request.headers.entries()) : 'N/A');
    console.groupEnd();
  }
}
```

## Key Takeaways

1. **Interceptor Order Matters**: Design your interceptor chain thoughtfully
2. **Async Support**: All interceptor methods can be async and return Promises
3. **Performance Impact**: Monitor and optimize interceptor performance
4. **Resource Management**: Implement proper cleanup in interceptor dispose methods
5. **Conditional Logic**: Use URL patterns and headers to apply logic selectively
6. **Debugging Support**: Add comprehensive logging for development environments
7. **Error Recovery**: Implement sophisticated error handling and recovery strategies
8. **Retry Limitations**: Be aware of AbortController compatibility issues with the retry interceptor

Interceptors are the most powerful feature of the Aurelia Fetch Client, enabling sophisticated HTTP request/response processing pipelines that can handle authentication, caching, metrics, error recovery, and much more.
