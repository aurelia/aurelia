# Utilities and Lifecycle Management

This guide covers advanced utilities, lifecycle methods, error handling, and cache implementation details for the Aurelia Fetch Client.

## Advanced HttpClient Methods

### buildRequest()

The `buildRequest()` method allows you to construct a `Request` object using the HttpClient's configuration without actually sending the request. This is useful for request inspection, manual request manipulation, or integration with other libraries.

#### Method Signature

```typescript
buildRequest(input: string | Request, init?: RequestInit): Request
```

#### How It Works

The `buildRequest()` method:

1. Applies the client's `baseUrl` to relative URLs
2. Merges the client's default `RequestInit` settings with provided options
3. Applies default headers
4. Auto-detects JSON content and sets appropriate `Content-Type` header
5. Returns a fully-configured `Request` object

#### Basic Usage

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class RequestBuilderService {
  private http = resolve(IHttpClient);

  constructor() {
    this.http.configure(config => config
      .withBaseUrl('https://api.example.com')
      .withDefaults({
        headers: {
          'Authorization': 'Bearer token123',
          'Accept': 'application/json'
        }
      })
    );
  }

  buildExampleRequest() {
    // Build a request without sending it
    const request = this.http.buildRequest('/users/123');

    console.log(request.url);        // 'https://api.example.com/users/123'
    console.log(request.method);     // 'GET'
    console.log(request.headers.get('Authorization')); // 'Bearer token123'
    console.log(request.headers.get('Accept'));        // 'application/json'

    return request;
  }
}
```

#### Advanced Request Building

```typescript
export class AdvancedRequestBuilder {
  private http = resolve(IHttpClient);

  buildPostRequest() {
    // Build a POST request with body
    const request = this.http.buildRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
    });

    // Content-Type automatically set to 'application/json' when body is JSON
    console.log(request.headers.get('Content-Type')); // 'application/json'

    return request;
  }

  buildRequestWithCustomHeaders() {
    const request = this.http.buildRequest('/api/data', {
      headers: {
        'X-Custom-Header': 'CustomValue'
      }
    });

    // Default headers are merged with custom headers
    return request;
  }

  buildFromExistingRequest() {
    // You can also pass an existing Request object
    const originalRequest = new Request('https://example.com/api/data');
    const enhancedRequest = this.http.buildRequest(originalRequest);

    // The enhanced request will have the client's defaults applied
    return enhancedRequest;
  }
}
```

#### Practical Use Cases

##### 1. Request Inspection and Debugging

```typescript
export class RequestDebugger {
  private http = resolve(IHttpClient);

  async inspectRequest(url: string, init?: RequestInit) {
    // Build the request to inspect it before sending
    const request = this.http.buildRequest(url, init);

    console.group('Request Details');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    console.log('Mode:', request.mode);
    console.log('Credentials:', request.credentials);
    console.groupEnd();

    // Now send it
    return this.http.fetch(request);
  }
}
```

##### 2. Manual Request Queue Management

```typescript
export class RequestQueue {
  private http = resolve(IHttpClient);
  private queue: Request[] = [];

  queueRequest(url: string, init?: RequestInit) {
    // Build requests and add to queue
    const request = this.http.buildRequest(url, init);
    this.queue.push(request);
  }

  async processQueue() {
    console.log(`Processing ${this.queue.length} queued requests`);

    // Process all queued requests
    const results = await Promise.all(
      this.queue.map(request => this.http.fetch(request))
    );

    this.queue = [];
    return results;
  }
}
```

##### 3. Integration with Third-Party Libraries

```typescript
export class RequestAdapter {
  private http = resolve(IHttpClient);

  buildForExternalLibrary(url: string) {
    // Build request with HttpClient configuration
    const request = this.http.buildRequest(url);

    // Pass to third-party library that expects a Request object
    return someExternalLibrary.processRequest(request);
  }

  buildForWebSocket(url: string) {
    // Build HTTP request to get configuration
    const httpRequest = this.http.buildRequest(url);

    // Use request details to configure WebSocket
    const wsUrl = httpRequest.url.replace('http', 'ws');
    const authHeader = httpRequest.headers.get('Authorization');

    return new WebSocket(wsUrl, ['protocol', authHeader]);
  }
}
```

##### 4. Conditional Request Execution

```typescript
export class ConditionalRequestService {
  private http = resolve(IHttpClient);

  async fetchWithCondition(url: string, shouldFetch: () => boolean) {
    // Build the request early
    const request = this.http.buildRequest(url);

    // Perform expensive computation or wait for condition
    await this.waitForCondition();

    if (shouldFetch()) {
      // Send the pre-built request
      return this.http.fetch(request);
    } else {
      console.log('Request cancelled based on condition');
      return null;
    }
  }

  private waitForCondition(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

#### Important Notes

1. **BaseURL Resolution**: Relative URLs are resolved against the configured `baseUrl`
2. **Header Merging**: Default headers are merged with request-specific headers (request headers take precedence)
3. **Content-Type Detection**: JSON bodies automatically get `Content-Type: application/json`
4. **Request Reusability**: Built `Request` objects can be reused with `fetch()` but remember that request bodies can only be read once

### dispose()

The `dispose()` method performs cleanup of the HttpClient instance, releasing resources and cleaning up interceptors.

#### Method Signature

```typescript
dispose(): void
```

#### What It Does

When `dispose()` is called:

1. Calls `dispose()` on all registered interceptors (if they implement it)
2. Clears the interceptor array
3. Removes the event dispatcher reference

#### Basic Usage

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class HttpClientService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupClient();
  }

  private setupClient() {
    this.http.configure(config => config
      .withBaseUrl('https://api.example.com')
      .withInterceptor({
        request: (request) => {
          console.log('Processing request');
          return request;
        },
        dispose: () => {
          console.log('Interceptor disposed');
        }
      })
    );
  }

  // Cleanup method
  dispose() {
    console.log('Disposing HttpClient');
    this.http.dispose();
    // This will:
    // 1. Call dispose() on all interceptors
    // 2. Clear the interceptor array
    // 3. Remove dispatcher reference
  }
}
```

#### Interceptor Cleanup

Interceptors can implement a `dispose()` method for cleanup:

```typescript
export class ResourceManagingInterceptor implements IFetchInterceptor {
  private intervalId: number;
  private eventListeners: Array<{ target: EventTarget; type: string; listener: EventListener }> = [];

  constructor() {
    // Set up resources
    this.intervalId = setInterval(() => {
      console.log('Background task');
    }, 60000);

    // Add event listeners
    const listener = () => console.log('Event');
    document.addEventListener('visibilitychange', listener);
    this.eventListeners.push({ target: document, type: 'visibilitychange', listener });
  }

  request(request: Request): Request {
    return request;
  }

  dispose(): void {
    // Clean up interval
    clearInterval(this.intervalId);

    // Remove event listeners
    this.eventListeners.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener);
    });
    this.eventListeners.length = 0;

    console.log('Interceptor resources cleaned up');
  }
}
```

#### Component Lifecycle Integration

Integrate with Aurelia component lifecycle:

```typescript
export class ApiService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupHttpClient();
  }

  private setupHttpClient() {
    this.http.configure(config => config
      .withBaseUrl('https://api.example.com')
      .withInterceptor(new ResourceManagingInterceptor())
    );
  }

  async fetchData() {
    return this.http.get('/data');
  }

  // Called by Aurelia when component is disposed
  dispose() {
    // Clean up HttpClient and all its interceptors
    this.http.dispose();
  }
}
```

#### Complete Cleanup Example

```typescript
export class ManagedHttpClientService {
  private http = resolve(IHttpClient);
  private cacheInterceptor: CacheInterceptor;
  private retryInterceptor: RetryInterceptor;

  constructor() {
    this.cacheInterceptor = new CacheInterceptor({ cacheTime: 300_000 });
    this.retryInterceptor = new RetryInterceptor({ maxRetries: 3 });

    this.http.configure(config => config
      .withInterceptor(this.cacheInterceptor)
      .withInterceptor(this.retryInterceptor)
    );
  }

  dispose() {
    // Option 1: Dispose individual interceptors manually
    this.cacheInterceptor.dispose?.();
    this.retryInterceptor.dispose?.();

    // Option 2: Dispose entire client (calls dispose on all interceptors)
    this.http.dispose();

    console.log('All resources cleaned up');
  }
}
```

#### Best Practices

1. **Always implement cleanup**: If your interceptor allocates resources, implement `dispose()`
2. **Component integration**: Call `http.dispose()` in component `dispose()` methods
3. **Singleton clients**: For application-scoped clients, dispose on application shutdown
4. **Testing**: Always dispose clients in test cleanup to prevent memory leaks

## Utility Functions

### json()

A utility function for serializing objects to JSON strings, primarily for creating request bodies.

#### Function Signature

```typescript
function json(body: unknown, replacer?: (key: string, value: unknown) => unknown): string
```

#### Basic Usage

```typescript
import { json } from '@aurelia/fetch-client';

export class JsonUtilityExample {
  createJsonBody() {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };

    // Simple JSON serialization
    const jsonString = json(user);
    console.log(jsonString); // '{"name":"John Doe","email":"john@example.com","age":30}'

    return jsonString;
  }
}
```

#### With Request Body

```typescript
import { IHttpClient, json } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class UserService {
  private http = resolve(IHttpClient);

  async createUser(userData: UserData) {
    // Use json() utility to create request body
    const response = await this.http.post('/api/users', json(userData));
    return response.json();
  }

  async updateUser(userId: string, updates: Partial<UserData>) {
    const response = await this.http.put(
      `/api/users/${userId}`,
      json(updates)
    );
    return response.json();
  }
}

interface UserData {
  name: string;
  email: string;
  age: number;
  preferences?: Record<string, unknown>;
}
```

#### Custom Replacer Function

The `replacer` parameter allows you to customize serialization:

```typescript
export class AdvancedJsonService {
  createFilteredJson() {
    const data = {
      name: 'John',
      password: 'secret123',  // Should not be serialized
      email: 'john@example.com',
      internalId: '12345'     // Should not be serialized
    };

    // Filter out sensitive fields
    const jsonString = json(data, (key, value) => {
      if (key === 'password' || key === 'internalId') {
        return undefined; // Exclude from JSON
      }
      return value;
    });

    console.log(jsonString); // '{"name":"John","email":"john@example.com"}'
    return jsonString;
  }

  createTransformedJson() {
    const data = {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      values: [1, 2, 3, 4, 5]
    };

    // Transform values during serialization
    const jsonString = json(data, (key, value) => {
      // Convert dates to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      // Convert arrays to comma-separated strings
      if (Array.isArray(value)) {
        return value.join(',');
      }
      return value;
    });

    console.log(jsonString);
    // '{"createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-15T00:00:00.000Z","values":"1,2,3,4,5"}'

    return jsonString;
  }
}
```

#### Handling Edge Cases

```typescript
export class EdgeCaseHandling {
  testEdgeCases() {
    // Undefined becomes empty object
    console.log(json(undefined));  // '{}'

    // Null is preserved
    console.log(json(null));       // 'null'

    // Empty object
    console.log(json({}));         // '{}'

    // Circular references will throw (use replacer to handle)
    const circular: any = { name: 'test' };
    circular.self = circular;

    try {
      json(circular);
    } catch (error) {
      console.error('Cannot serialize circular reference');
    }
  }

  handleCircularReferences() {
    const seen = new WeakSet();

    const data: any = { name: 'test' };
    data.self = data;

    const jsonString = json(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });

    console.log(jsonString); // '{"name":"test","self":"[Circular]"}'
  }
}
```

#### Practical Examples

##### API Request Builder

```typescript
export class ApiRequestBuilder {
  private http = resolve(IHttpClient);

  async createResource(type: string, data: Record<string, unknown>) {
    // Wrap data in API envelope format
    const envelope = {
      type,
      data,
      timestamp: new Date(),
      version: '1.0'
    };

    const response = await this.http.post(
      '/api/resources',
      json(envelope, (key, value) => {
        // Convert dates to ISO strings
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      })
    );

    return response.json();
  }
}
```

##### Data Sanitization

```typescript
export class DataSanitizer {
  private http = resolve(IHttpClient);
  private sensitiveFields = ['password', 'ssn', 'creditCard', 'apiKey'];

  async sendSanitizedData(url: string, data: Record<string, unknown>) {
    // Automatically filter sensitive fields
    const sanitized = json(data, (key, value) => {
      if (this.sensitiveFields.includes(key)) {
        return '[REDACTED]';
      }
      return value;
    });

    return this.http.post(url, sanitized);
  }
}
```

#### Comparison with JSON.stringify()

```typescript
// Using json() utility
import { json } from '@aurelia/fetch-client';
const body1 = json({ name: 'John' });        // Returns '{"name":"John"}'
const body2 = json(undefined);               // Returns '{}'

// Using JSON.stringify() directly
const body3 = JSON.stringify({ name: 'John' }); // Returns '{"name":"John"}'
const body4 = JSON.stringify(undefined);        // Returns 'undefined'

// The json() utility treats undefined as an empty object,
// which is more convenient for optional request bodies
```

## Error Handling

The Fetch Client includes a comprehensive error code system for debugging and error handling.

### Error Code System

All errors from the Fetch Client use the `AUR50XX` code range and include helpful error messages in development mode.

#### Error Codes Reference

```typescript
enum ErrorNames {
  http_client_fetch_fn_not_found = 5000,
  http_client_configure_invalid_return = 5001,
  http_client_configure_invalid_config = 5002,
  http_client_configure_invalid_header = 5003,
  http_client_more_than_one_retry_interceptor = 5004,
  http_client_retry_interceptor_not_last = 5005,
  http_client_invalid_request_from_interceptor = 5006,
  retry_interceptor_invalid_exponential_interval = 5007,
  retry_interceptor_invalid_strategy = 5008,
}
```

### AUR5000: Fetch Function Not Found

**Error Message**: "Could not resolve fetch function. Please provide a fetch function implementation or a polyfill for the global fetch function."

**Cause**: The global `fetch` function is not available.

**Solution**: Provide a fetch polyfill or implementation:

```typescript
// Install a fetch polyfill
import 'whatwg-fetch';

// Or provide custom fetch implementation
import { DI } from '@aurelia/kernel';
import { IFetchFn } from '@aurelia/fetch-client';

DI.getGlobalContainer().register(
  Registration.instance(IFetchFn, myCustomFetchImplementation)
);
```

### AUR5001: Invalid Configuration Return

**Error Message**: "The config callback did not return a valid HttpClientConfiguration like instance. Received {type}"

**Cause**: Configuration callback returned an invalid value.

**Solution**: Ensure your configuration callback returns a valid configuration:

```typescript
// Wrong - returning wrong type
this.http.configure(config => {
  return 'invalid'; // ❌ Returns string instead of configuration
});

// Correct - return configuration or void
this.http.configure(config => {
  config.withBaseUrl('https://api.example.com');
  return config; // ✅ Return the configuration object
});

// Also correct - no return (void)
this.http.configure(config => {
  config.withBaseUrl('https://api.example.com');
  // ✅ Void return is fine
});
```

### AUR5002: Invalid Configuration Type

**Error Message**: "invalid config, expecting a function or an object, received {type}"

**Cause**: Called `configure()` with an invalid argument type.

**Solution**: Pass either a function or RequestInit object:

```typescript
// Wrong - invalid type
this.http.configure('invalid'); // ❌

// Correct - function
this.http.configure(config => {
  config.withBaseUrl('https://api.example.com');
}); // ✅

// Correct - RequestInit object
this.http.configure({
  headers: { 'Accept': 'application/json' }
}); // ✅
```

### AUR5003: Invalid Default Headers

**Error Message**: "Default headers must be a plain object."

**Cause**: Provided a `Headers` instance instead of a plain object for default headers.

**Solution**: Use plain objects for default headers:

```typescript
// Wrong - Headers instance
this.http.configure(config => config.withDefaults({
  headers: new Headers({ 'Accept': 'application/json' }) // ❌
}));

// Correct - plain object
this.http.configure(config => config.withDefaults({
  headers: { 'Accept': 'application/json' } // ✅
}));
```

### AUR5004: Multiple Retry Interceptors

**Error Message**: "Only one RetryInterceptor is allowed."

**Cause**: Attempted to register more than one `RetryInterceptor`.

**Solution**: Use only one retry interceptor:

```typescript
// Wrong - multiple retry interceptors
this.http.configure(config => config
  .withRetry({ maxRetries: 3 })
  .withRetry({ maxRetries: 5 }) // ❌ Second retry interceptor
);

// Correct - single retry interceptor
this.http.configure(config => config
  .withRetry({ maxRetries: 3 }) // ✅
);
```

### AUR5005: Retry Interceptor Not Last

**Error Message**: "The retry interceptor must be the last interceptor defined."

**Cause**: The retry interceptor was not registered as the final interceptor.

**Solution**: Always register retry interceptor last:

```typescript
// Wrong - retry not last
this.http.configure(config => config
  .withRetry({ maxRetries: 3 })        // ❌ Not last
  .withInterceptor(loggingInterceptor) // This comes after retry
);

// Correct - retry is last
this.http.configure(config => config
  .withInterceptor(loggingInterceptor)
  .withRetry({ maxRetries: 3 })        // ✅ Last interceptor
);
```

### AUR5006: Invalid Interceptor Result

**Error Message**: "An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [{value}]"

**Cause**: An interceptor returned an invalid value (not a `Request` or `Response`).

**Solution**: Ensure interceptors return valid types:

```typescript
// Wrong - returning invalid type
config.withInterceptor({
  request: (request) => {
    return 'invalid'; // ❌ Must return Request or Response
  }
});

// Correct - return Request
config.withInterceptor({
  request: (request) => {
    return request; // ✅ Return Request object
  }
});

// Correct - return Response to short-circuit
config.withInterceptor({
  request: (request) => {
    return new Response('cached'); // ✅ Return Response to bypass fetch
  }
});
```

### AUR5007: Invalid Exponential Interval

**Error Message**: "An interval less than or equal to 1 second is not allowed when using the exponential retry strategy. Received: {interval}"

**Cause**: Exponential retry strategy configured with too short an interval.

**Solution**: Use an interval > 1000ms for exponential strategy:

```typescript
// Wrong - interval too short for exponential
this.http.configure(config => config.withRetry({
  strategy: RetryStrategy.exponential,
  interval: 500 // ❌ < 1000ms
}));

// Correct - interval >= 1000ms
this.http.configure(config => config.withRetry({
  strategy: RetryStrategy.exponential,
  interval: 2000 // ✅ >= 1000ms
}));
```

### AUR5008: Invalid Retry Strategy

**Error Message**: "Invalid retry strategy: {strategy}"

**Cause**: Provided an invalid retry strategy value.

**Solution**: Use valid retry strategy constants:

```typescript
import { RetryStrategy } from '@aurelia/fetch-client';

// Wrong - invalid strategy
this.http.configure(config => config.withRetry({
  strategy: 'invalid' // ❌
}));

// Correct - use RetryStrategy enum
this.http.configure(config => config.withRetry({
  strategy: RetryStrategy.fixed // ✅
}));

// Available strategies:
// - RetryStrategy.fixed
// - RetryStrategy.incremental
// - RetryStrategy.exponential
```

### Error Handling Best Practices

#### Development vs Production

```typescript
export class ErrorAwareService {
  private http = resolve(IHttpClient);

  async fetchWithErrorHandling(url: string) {
    try {
      return await this.http.get(url);
    } catch (error) {
      if (error instanceof Error) {
        // In development, errors include full details and documentation links
        if (process.env.NODE_ENV === 'development') {
          console.error('Detailed error:', error.message);
          // Error format: "AUR5000: <message>\n\nFor more information, see: <docs link>"
        } else {
          // In production, errors are concise
          console.error('Error code:', error.message.split(':')[0]);
        }
      }
      throw error;
    }
  }
}
```

## Cache Implementation Details

### Cache Key Generation

The cache interceptor uses a simple but effective cache key strategy:

```typescript
// Cache key format
const cacheKey = `${CacheInterceptor.prefix}${request.url}`;
// Example: 'au:interceptor:https://api.example.com/users/123'
```

**Key Components:**
- **Prefix**: `'au:interceptor:'` - Identifies Aurelia cache entries
- **URL**: Full request URL including query parameters

**Important Notes:**
- Only the URL is used for cache keys
- Request headers are NOT part of the cache key
- Query parameters ARE part of the cache key (different query = different cache entry)

#### Cache Key Examples

```typescript
// These create different cache entries:
http.get('/api/users?page=1');  // Key: 'au:interceptor:/api/users?page=1'
http.get('/api/users?page=2');  // Key: 'au:interceptor:/api/users?page=2'

// These share the same cache entry:
http.get('/api/users', { headers: { 'X-Custom': 'A' } });
http.get('/api/users', { headers: { 'X-Custom': 'B' } });
// Both use key: 'au:interceptor:/api/users'
```

### Cache Header Marker

The cache interceptor uses a custom header to mark cached responses:

```typescript
// Header name
CacheInterceptor.cacheHeader = 'x-au-fetch-cache';

// Header value for cache hits
response.headers.get('x-au-fetch-cache'); // 'hit'
```

**Usage:**

```typescript
export class CacheAwareService {
  private http = resolve(IHttpClient);

  async fetchWithCacheDetection(url: string) {
    const response = await this.http.get(url);

    if (response.headers.has('x-au-fetch-cache')) {
      console.log('Response served from cache');
    } else {
      console.log('Response fetched from server');
    }

    return response.json();
  }
}
```

### Refresh Stale Immediate

When `refreshStaleImmediate: true` is configured, the cache interceptor sets up automatic refresh timers:

```typescript
const cacheConfig = {
  staleTime: 60_000,           // 1 minute
  refreshStaleImmediate: true  // Enable automatic refresh
};
```

**Behavior:**

1. When data is cached, a timer is set for the `staleTime` duration
2. When the timer fires:
   - The cache entry is deleted
   - The original request is automatically re-fetched
   - The cache is updated with fresh data
   - `CacheEvent.CacheStaleRefreshed` event is published

**Example:**

```typescript
export class AutoRefreshExample {
  private http = resolve(IHttpClient);
  private cacheService = resolve(ICacheService);

  constructor() {
    const cacheInterceptor = new CacheInterceptor({
      cacheTime: 300_000,           // 5 minutes total cache time
      staleTime: 60_000,            // 1 minute until stale
      refreshStaleImmediate: true   // Auto-refresh when stale
    });

    this.http.configure(config => config.withInterceptor(cacheInterceptor));

    // Monitor refresh events
    this.cacheService.subscribe(CacheEvent.CacheStaleRefreshed, (data) => {
      console.log('Cache automatically refreshed:', data.key);
    });
  }

  async getData() {
    // First call: fetches from server, caches for 5 min, sets 1 min stale timer
    const data1 = await this.http.get('/api/data');

    // Calls within 1 minute: served from cache
    const data2 = await this.http.get('/api/data');

    // After 1 minute: cache automatically refreshed in background
    // After refresh: new 5 min cache, new 1 min stale timer set

    return data1;
  }
}
```

## Summary

This guide covered:

- **buildRequest()**: Build requests without sending them
- **dispose()**: Proper cleanup of HttpClient and interceptors
- **json()**: Utility for JSON serialization with custom replacers
- **Error Codes**: Complete AUR50XX error reference with solutions
- **Cache Details**: Key generation, cache headers, and refresh behavior

These advanced features enable robust, production-ready HTTP client implementations with proper resource management and error handling.
