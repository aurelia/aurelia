# Setup and Configuration

The Aurelia Fetch Client provides multiple ways to create and configure HTTP clients. You can create instances directly, use dependency injection, or configure shared instances for your application.

## Quick Start

The simplest way to get started is by resolving the fetch client through Aurelia's dependency injection:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class ApiService {
  private http = resolve(IHttpClient);
  
  async getUsers() {
    const response = await this.http.get('/api/users');
    return response.json();
  }
}
```

## Creating Instances

### Using Dependency Injection (Recommended)

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class UserService {
  private http = resolve(IHttpClient);

  constructor() {
    // Configure the singleton instance
    // ⚠️ WARNING: This configuration applies GLOBALLY to all services that resolve IHttpClient
    this.http.configure(config => config
      .withBaseUrl('https://api.example.com/')
      .withDefaults({
        headers: { 'Authorization': 'Bearer token' }
      })
    );
  }
}
```

> **Important**: By default, `IHttpClient` is registered as a singleton. This means all services that resolve `IHttpClient` will share the same instance and configuration. If you configure the client in one service (e.g., setting a base URL), that configuration will affect **all** services using `IHttpClient`. If you need service-specific configurations with different base URLs or settings, use `newInstanceOf(IHttpClient)` as shown in the "Multiple Configured Instances" section below.

### Creating New Instances

```typescript
import { HttpClient } from '@aurelia/fetch-client';

const httpClient = new HttpClient();

httpClient.configure(config => config
  .withDefaults({ mode: 'cors' })
  .withBaseUrl('https://api.example.com/')
);

const users = await httpClient.get('users')
  .then(response => response.json());
```

### Multiple Configured Instances

For applications that need to communicate with different APIs, each with its own base URL or configuration, use `newInstanceOf(IHttpClient)` to create separate instances:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve, newInstanceOf } from '@aurelia/kernel';

export class UserApi {
  // Create a new instance specifically for user API
  private http = resolve(newInstanceOf(IHttpClient));

  constructor() {
    this.http.configure(config => config
      .withBaseUrl('https://api.example.com/users/')
      .withDefaults({
        headers: { 'Content-Type': 'application/json' }
      })
    );
  }

  async getUser(id: string) {
    const response = await this.http.get(id);
    return response.json();
  }
}

export class TodoApi {
  // Create a separate new instance for todo API
  private http = resolve(newInstanceOf(IHttpClient));

  constructor() {
    this.http.configure(config => config
      .withBaseUrl('https://api.example.com/todos/')
      .withDefaults({
        headers: { 'X-Custom-Header': 'todo-value' }
      })
    );
  }

  async getTodos() {
    const response = await this.http.get('');
    return response.json();
  }
}
```

Each service above gets its own `HttpClient` instance with its own configuration. The `UserApi` will use base URL `https://api.example.com/users/` while `TodoApi` uses `https://api.example.com/todos/`, and their configurations won't interfere with each other.

You can also combine multiple instances in a single service:

```typescript
export class MultiApiService {
  // Separate instances for different APIs
  private mainApi = resolve(newInstanceOf(IHttpClient));
  private authApi = resolve(newInstanceOf(IHttpClient));

  constructor() {
    this.mainApi.configure(config => config
      .withBaseUrl('https://api.example.com/v1/')
      .withDefaults({
        headers: { 'Content-Type': 'application/json' }
      })
    );

    this.authApi.configure(config => config
      .withBaseUrl('https://auth.example.com/')
      .withDefaults({
        headers: { 'X-Client-ID': 'your-client-id' }
      })
    );
  }
}
```

> **Best Practice**: Use `newInstanceOf(IHttpClient)` when you need service-specific configurations (different base URLs, headers, or interceptors). For simple cases where all requests share the same configuration, the singleton `IHttpClient` is more efficient.

## Configuration Options

The Aurelia Fetch Client supports all native Fetch API options plus additional convenience methods for common scenarios.

### Basic Configuration

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class ApiService {
  private http = resolve(IHttpClient);
  
  constructor() {
    this.http.configure(config => config
      .withBaseUrl('https://api.example.com/v1/')
      .withDefaults({
        credentials: 'same-origin',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'Fetch'
        }
      })
      .withInterceptor({
        request(request) {
          console.log(`→ ${request.method} ${request.url}`);
          return request;
        },
        response(response) {
          console.log(`← ${response.status} ${response.url}`);
          return response;
        }
      })
    );
  }
}
```

### Configuration Methods

#### `withBaseUrl(url: string)`
Sets the base URL for all relative requests:
```typescript
config.withBaseUrl('https://api.example.com/v1/');

// Later requests:
http.get('/users');      // → https://api.example.com/v1/users
http.get('posts');       // → https://api.example.com/v1/posts
```

#### `withDefaults(options: RequestInit)`
Sets default options merged with every request:
```typescript
config.withDefaults({
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json'
  }
});
```

#### `withInterceptor(interceptor: IFetchInterceptor)`
Adds request/response interceptors for cross-cutting concerns:
```typescript
config.withInterceptor({
  request(request) {
    // Modify outgoing requests
    request.headers.set('X-Timestamp', Date.now().toString());
    return request;
  },
  
  response(response) {
    // Process incoming responses
    if (!response.ok) {
      console.warn(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  }
});
```

#### `useStandardConfiguration()`
Applies common defaults for typical applications:
```typescript
config.useStandardConfiguration();

// Equivalent to:
config
  .withDefaults({ credentials: 'same-origin' })
  .rejectErrorResponses();
```

#### `rejectErrorResponses()`
Makes the client reject promises for HTTP error status codes (4xx, 5xx):
```typescript
config.rejectErrorResponses();

// Now 4xx/5xx responses will reject the promise
try {
  await http.get('/api/invalid-endpoint');
} catch (error) {
  console.log('HTTP error:', error.status); // e.g., 404
}
```

#### `withRetry(options: IRetryConfiguration)`
Enables automatic retries for failed requests:
```typescript
import { RetryStrategy } from '@aurelia/fetch-client';

config.withRetry({
  maxRetries: 3,
  strategy: RetryStrategy.exponential,
  doRetry: (response) => response.status >= 500
});
```

### Advanced Configuration

#### Dynamic Headers
Headers can be functions that are evaluated for each request:
```typescript
config.withDefaults({
  headers: {
    'Authorization': () => `Bearer ${getCurrentToken()}`,
    'X-Request-ID': () => generateUUID(),
    'X-Timestamp': () => new Date().toISOString()
  }
});
```

#### Request Event Dispatcher
Enable events for request lifecycle monitoring:
```typescript
config.withDispatcher(document.body);

// Listen for events
document.body.addEventListener('aurelia-fetch-client-request-started', (e) => {
  console.log('Request started');
});

document.body.addEventListener('aurelia-fetch-client-requests-drained', (e) => {
  console.log('All requests completed');
});
```

## Making Requests

### HTTP Methods
The fetch client provides convenient methods for all standard HTTP verbs:

```typescript
// GET request  
const users = await http.get('/api/users');
const userData = await users.json();

// POST with JSON body
const newUser = await http.post('/api/users', {
  body: json({ name: 'John', email: 'john@example.com' })
});

// PUT request
await http.put(`/api/users/${userId}`, {
  body: json(updatedUser)
});

// PATCH request
await http.patch(`/api/users/${userId}`, {
  body: json({ status: 'active' })
});

// DELETE request
await http.delete(`/api/users/${userId}`);
```

### JSON Helper
The `json()` helper automatically stringifies objects and sets the correct content-type:

```typescript
import { IHttpClient, json } from '@aurelia/fetch-client';

export class CommentService {
  private http = resolve(IHttpClient);

  async createComment(commentData) {
    return this.http.post('/api/comments', {
      body: json(commentData) // Automatically sets Content-Type: application/json
    });
  }
  
  // Equivalent to the manual approach:
  async createCommentManual(commentData) {
    return this.http.post('/api/comments', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
  }
}
```

### Request Options
All methods accept standard Fetch API options:

```typescript
// GET with custom headers
const response = await http.get('/api/data', {
  headers: {
    'Accept': 'application/xml',
    'X-Custom-Header': 'value'
  }
});

// POST with credentials
await http.post('/api/secure-endpoint', {
  credentials: 'include',
  body: json(data)
});

// Request with AbortController
const controller = new AbortController();
const promise = http.get('/api/slow-endpoint', {
  signal: controller.signal
});

// Cancel the request after 5 seconds
setTimeout(() => controller.abort(), 5000);
```

### Response Handling
```typescript
const response = await http.get('/api/users');

// Check response status
if (response.ok) {
  const users = await response.json();
  console.log(users);
} else {
  console.error(`HTTP ${response.status}: ${response.statusText}`);
}

// Or use rejectErrorResponses() to handle this automatically
http.configure(config => config.rejectErrorResponses());

try {
  const response = await http.get('/api/users');
  const users = await response.json();
} catch (error) {
  if (error instanceof Response) {
    console.error(`HTTP ${error.status}: ${error.statusText}`);
  }
}
```

## Error Handling Strategies

### Basic Error Handling
The native Fetch API only rejects promises for network errors, not HTTP error status codes. Use `rejectErrorResponses()` to change this behavior:

```typescript
http.configure(config => config.rejectErrorResponses());

try {
  const response = await http.get('/api/users');
  const users = await response.json();
} catch (error) {
  if (error instanceof Response) {
    // HTTP error (4xx, 5xx)
    console.error(`HTTP ${error.status}: ${error.statusText}`);
    
    if (error.status === 401) {
      // Handle unauthorized
      redirectToLogin();
    } else if (error.status >= 500) {
      // Handle server errors
      showServerErrorMessage();
    }
  } else {
    // Network error
    console.error('Network error:', error);
    showNetworkErrorMessage();
  }
}
```

### Centralized Error Handling
Use interceptors to handle errors globally:

```typescript
http.configure(config => config.withInterceptor({
  response(response) {
    if (!response.ok) {
      logError(`HTTP ${response.status}`, response.url);
      
      // Still return the response to let calling code handle it
      return response;
    }
    return response;
  },
  
  responseError(error, request) {
    console.error('Request failed:', {
      url: request?.url,
      method: request?.method,
      error: error.message
    });
    
    // Show user-friendly error message
    showNotification('Something went wrong. Please try again.');
    
    // Re-throw to let calling code handle if needed
    throw error;
  }
}));

function logError(message, url) {
  // Send to logging service
  logger.error(message, { url, timestamp: new Date() });
}
```

### Recovery Patterns
Implement automatic recovery for common scenarios:

```typescript
http.configure(config => config.withInterceptor({
  async responseError(error, request, client) {
    if (error instanceof Response && error.status === 401) {
      // Try to refresh auth token
      try {
        await refreshAuthToken();
        
        // Retry the original request with new token
        const newRequest = new Request(request.url, {
          method: request.method,
          headers: {
            ...Object.fromEntries(request.headers.entries()),
            'Authorization': `Bearer ${getNewToken()}`
          },
          body: request.body
        });
        
        return client.fetch(newRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        redirectToLogin();
        throw error;
      }
    }
    
    throw error;
  }
}));
```

## Automatic Retries

The fetch client includes built-in retry functionality for handling transient network failures:

### Basic Retry Configuration
```typescript
import { RetryStrategy } from '@aurelia/fetch-client';

http.configure(config => config.withRetry({
  maxRetries: 3,
  interval: 1000,
  strategy: RetryStrategy.exponential
}));
```

### Retry Strategies

#### Fixed Interval
Retries with the same delay between attempts:
```typescript
config.withRetry({
  maxRetries: 3,
  interval: 2000,
  strategy: RetryStrategy.fixed
});
// Retries after: 2s, 2s, 2s
```

#### Incremental Backoff
Increases delay with each retry:
```typescript
config.withRetry({
  maxRetries: 3,
  interval: 1000,
  strategy: RetryStrategy.incremental
});
// Retries after: 1s, 2s, 3s
```

#### Exponential Backoff
Doubles the delay with each retry:
```typescript
config.withRetry({
  maxRetries: 3,
  interval: 1000,
  strategy: RetryStrategy.exponential
});
// Retries after: 1s, 2s, 4s
```

#### Random Interval
Random delay within specified bounds:
```typescript
config.withRetry({
  maxRetries: 3,
  strategy: RetryStrategy.random,
  minRandomInterval: 500,
  maxRandomInterval: 2000
});
// Retries after random intervals between 500ms-2000ms
```

#### Custom Strategy
Provide your own retry timing logic:
```typescript
config.withRetry({
  maxRetries: 5,
  strategy: (retryCount) => {
    // Custom backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
    return Math.min(100 * Math.pow(2, retryCount), 5000);
  }
});
```

### Conditional Retries
Control which requests should be retried:

```typescript
config.withRetry({
  maxRetries: 3,
  strategy: RetryStrategy.exponential,
  
  // Only retry server errors, not client errors
  doRetry: (response, request) => {
    return response.status >= 500;
  },
  
  // Modify request before retry
  beforeRetry: (request, client) => {
    // Add a retry header
    request.headers.set('X-Retry-Count', retryCount.toString());
    return request;
  }
});
```

### Complete Retry Configuration
```typescript
interface IRetryConfiguration {
  maxRetries: number;                                    // Maximum retry attempts
  interval?: number;                                     // Base interval in milliseconds
  strategy?: RetryStrategy | ((retryCount: number) => number); // Retry timing strategy
  minRandomInterval?: number;                            // Min random interval (for random strategy)
  maxRandomInterval?: number;                            // Max random interval (for random strategy)
  doRetry?(response: Response, request: Request): boolean | Promise<boolean>; // Conditional retry logic
  beforeRetry?(request: Request, client: HttpClient): Request | Promise<Request>; // Request modification before retry
}
```

### Real-world Example
```typescript
http.configure(config => config.withRetry({
  maxRetries: 3,
  strategy: RetryStrategy.exponential,
  interval: 1000,
  
  // Only retry on server errors or network failures
  doRetry: (response, request) => {
    // Retry on 5xx server errors
    if (response.status >= 500) return true;
    
    // Don't retry on client errors (4xx)
    if (response.status >= 400 && response.status < 500) return false;
    
    // Retry on network errors (no response)
    return !response;
  },
  
  beforeRetry: async (request, client) => {
    // Refresh auth token before retry if needed
    if (request.headers.get('Authorization')) {
      const newToken = await refreshTokenIfNeeded();
      request.headers.set('Authorization', `Bearer ${newToken}`);
    }
    
    // Add retry tracking
    request.headers.set('X-Retry-Attempt', Date.now().toString());
    
    return request;
  }
}));
```

> **Important**: Only one retry interceptor can be configured per client, and it must be the last interceptor in the chain.
