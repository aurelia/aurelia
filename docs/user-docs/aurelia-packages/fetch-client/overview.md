# Fetch Client

Aurelia's `@aurelia/fetch-client` is a powerful HTTP client built on the native Fetch API, designed specifically for modern web applications. It provides a clean, promise-based interface for making HTTP requests with enterprise-grade features like intelligent caching, automatic retries, and flexible interceptors.

Need real-world patterns? Head over to the [fetch-client outcome recipes](./outcome-recipes.md) for guided setups covering auth, caching, and uploads.

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

class ApiService {
  private http = resolve(IHttpClient);
  
  async getUsers() {
    const response = await this.http.get('/api/users');
    return response.json();
  }
}
```

## Why Use Aurelia's Fetch Client?

While the native Fetch API is powerful, Aurelia's wrapper adds essential features for real-world applications:

### **Built for Production**
- **Automatic retries** with exponential backoff
- **Intelligent caching** with background refresh
- **Request/response interceptors** for cross-cutting concerns
- **Centralized configuration** for consistency across your app

### **Developer Experience**
- **Fluent API** with method chaining
- **TypeScript-first** with full type safety
- **Dependency injection** integration
- **Built-in error handling** patterns

### **Performance Features**
- **Request deduplication** through caching
- **Background data refresh** for stale content
- **Request tracking** and status monitoring
- **Minimal overhead** over native fetch

## Quick Start

```typescript
import { IHttpClient, json } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

class UserService {
  private http = resolve(IHttpClient);
  
  constructor() {
    // One-time configuration
    this.http.configure(config => config
      .withBaseUrl('https://api.example.com/')
      .withDefaults({
        headers: { 'X-API-Key': 'your-key' }
      })
      .rejectErrorResponses() // Reject on 4xx/5xx status codes
    );
  }
  
  async createUser(userData) {
    return this.http.post('/users', {
      body: json(userData)
    });
  }
  
  async getUser(id) {
    const response = await this.http.get(`/users/${id}`);
    return response.json();
  }
}
```

## Core Features

### **HTTP Methods**
Full support for all HTTP verbs with consistent interfaces:
```typescript
http.get(url, options?)
http.post(url, options?)
http.put(url, options?)
http.patch(url, options?)
http.delete(url, options?)
http.fetch(url, options?) // For custom methods
```

### **Request Status Tracking**
Monitor your application's network activity:
```typescript
console.log(http.isRequesting);        // boolean
console.log(http.activeRequestCount);  // number of active requests
console.log(http.isConfigured);        // configuration status
```

### **Smart Base URL Handling**
```typescript
http.configure(config => config.withBaseUrl('https://api.example.com/v1/'));

// Relative URLs use the base
await http.get('/users');     // → https://api.example.com/v1/users

// Absolute URLs are unchanged  
await http.get('https://other-api.com/data'); // → https://other-api.com/data
```

## Advanced Capabilities

### **Intelligent Caching**
Reduce server load and improve performance with built-in caching:
```typescript
import { CacheInterceptor } from '@aurelia/fetch-client';

const cacheInterceptor = container.invoke(CacheInterceptor, [{
  cacheTime: 300_000,     // Cache for 5 minutes
  refreshInterval: 60_000  // Background refresh every minute
}]);

http.configure(config => config.withInterceptor(cacheInterceptor));
```

### **Automatic Retries**
Handle network failures gracefully:
```typescript
import { RetryStrategy } from '@aurelia/fetch-client';

http.configure(config => config.withRetry({
  maxRetries: 3,
  strategy: RetryStrategy.exponential,
  doRetry: (response) => response.status >= 500 // Only retry server errors
}));
```

### **Powerful Interceptors**
Implement cross-cutting concerns like authentication, logging, and error handling:
```typescript
http.configure(config => config.withInterceptor({
  request(request) {
    // Add auth header to every request
    request.headers.set('Authorization', `Bearer ${getToken()}`);
    return request;
  },
  
  response(response) {
    // Log all responses
    console.log(`${response.status} ${response.url}`);
    return response;
  },
  
  responseError(error, request) {
    if (error.status === 401) {
      // Handle token expiration
      return refreshToken().then(() => http.fetch(request));
    }
    throw error;
  }
}));
```

## What's Different from Native Fetch?

| Feature | Native Fetch | Aurelia Fetch Client |
|---------|--------------|---------------------|
| Error Handling | Only network errors reject | Can reject on HTTP error status |
| Configuration | Per-request | Centralized with defaults |
| Caching | Manual implementation | Built-in with multiple strategies |
| Retries | Manual implementation | Automatic with multiple strategies |
| Interceptors | None | Request/Response/Error interceptors |
| JSON Handling | Manual stringify/parse | Helper functions and auto-detection |
| Base URLs | Manual concatenation | Smart URL resolution |
| Request Tracking | Manual | Built-in status monitoring |

## Common Use Cases

**API Client Setup**:
```typescript
// Configure once, use everywhere
http.configure(config => config
  .withBaseUrl('https://api.example.com/v1/')
  .withDefaults({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': () => `Bearer ${getCurrentToken()}`
    }
  })
  .rejectErrorResponses()
  .withRetry({ maxRetries: 3 })
);
```

**Authentication Integration**:
```typescript
http.configure(config => config.withInterceptor({
  responseError(error, request, client) {
    if (error.status === 401) {
      return refreshAuthToken()
        .then(() => client.fetch(request));
    }
    throw error;
  }
}));
```

**Form Submissions**:
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'Profile photo');

await http.post('/upload', formData);
```

## Integration with Aurelia DI

The fetch client is designed to work seamlessly with Aurelia's dependency injection system:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class ApiService {
  private http = resolve(IHttpClient);
  
  async getData() {
    return this.http.get('/api/data');
  }
}
```

Each service gets its own configured instance when using `resolve(IHttpClient)`, allowing for service-specific configurations while maintaining the global defaults.

## Next Steps

- **[Setting Up](./setting-up.md)**: Basic configuration and usage patterns
- **[Interceptors](./interceptors.md)**: Implement cross-cutting concerns
- **[Advanced Configuration](./advanced.md)**: Caching, retries, and complex scenarios
- **[Forms](./forms.md)**: File uploads and form data handling
- **[Response Types](./response-types.md)**: Working with different response formats

The Aurelia Fetch Client transforms the native Fetch API from a low-level primitive into a production-ready HTTP client that scales with your application's needs.
