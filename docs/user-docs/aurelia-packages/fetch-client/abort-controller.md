# Request Cancellation with AbortController

The Aurelia Fetch Client fully supports the native AbortController API for cancelling HTTP requests. Understanding how to properly use AbortController is crucial for building responsive applications and managing resource cleanup.

## Basic Request Cancellation

### Simple Abort Example

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class CancellableRequestService {
  private http = resolve(IHttpClient);

  async fetchDataWithCancellation(): Promise<{ data: any; abort: () => void }> {
    const controller = new AbortController();
    
    const dataPromise = this.http.get('/api/large-dataset', {
      signal: controller.signal
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    });

    return {
      data: dataPromise,
      abort: () => controller.abort()
    };
  }

  // Usage example
  async loadDataWithTimeout() {
    const { data, abort } = await this.fetchDataWithCancellation();
    
    // Auto-cancel after 10 seconds
    const timeoutId = setTimeout(() => {
      abort();
      console.log('Request cancelled due to timeout');
    }, 10000);

    try {
      const result = await data;
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return null;
      }
      throw error;
    }
  }
}
```

### Component Integration

```typescript
export class SearchComponent {
  private http = resolve(IHttpClient);
  private currentSearchController: AbortController | null = null;

  async search(query: string): Promise<any[]> {
    // Cancel previous search if still running
    if (this.currentSearchController) {
      this.currentSearchController.abort();
    }

    // Create new controller for this search
    this.currentSearchController = new AbortController();

    try {
      const response = await this.http.get(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: this.currentSearchController.signal
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const results = await response.json();
      this.currentSearchController = null; // Clear completed request
      return results;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Search cancelled');
        return [];
      }
      this.currentSearchController = null;
      throw error;
    }
  }

  // Clean up on component destruction
  dispose() {
    if (this.currentSearchController) {
      this.currentSearchController.abort();
      this.currentSearchController = null;
    }
  }
}
```

## AbortController with Interceptors

### Interceptor Handling

Interceptors properly handle aborted requests through the error chain:

```typescript
export class AbortAwareInterceptorService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupAbortHandling();
  }

  private setupAbortHandling() {
    this.http.configure(config => config.withInterceptor({
      request(request) {
        console.log(`Starting request: ${request.method} ${request.url}`);
        
        // Check if request is already aborted
        if (request.signal?.aborted) {
          console.log('Request already aborted before sending');
          throw new DOMException('Request was aborted', 'AbortError');
        }
        
        return request;
      },

      response(response, request) {
        console.log(`Request completed: ${request?.url} -> ${response.status}`);
        return response;
      },

      responseError(error, request) {
        if (error.name === 'AbortError') {
          console.log(`Request cancelled: ${request?.url}`);
          
          // You can return a default response to recover from cancellation
          // return new Response('{"cancelled": true}', { status: 499 });
          
          // Or let the error propagate (recommended)
          throw error;
        }

        console.error(`Request failed: ${request?.url}`, error);
        throw error;
      }
    }));
  }
}
```

## Critical Issue: AbortController + Retry Bug

> **⚠️ Important Limitation**: There is a critical bug in the current retry mechanism when used with AbortController. When a request with an AbortSignal is retried, the retry attempts inherit the same (potentially aborted) signal, causing all retry attempts to immediately fail.

### The Problem

```typescript
// ❌ This is broken in the current implementation:
const controller = new AbortController();

http.configure(config => config.withRetry({ maxRetries: 3 }));

const promise = http.get('/api/data', { signal: controller.signal });

// If you abort here, all 3 retry attempts will immediately fail
// because they inherit the aborted signal
controller.abort();
```

### Workaround Solutions

#### Solution 1: Conditional Retry (Recommended)

```typescript
export class AbortSafeRetryService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupAbortSafeRetry();
  }

  private setupAbortSafeRetry() {
    this.http.configure(config => config.withRetry({
      maxRetries: 3,
      strategy: RetryStrategy.exponential,
      
      // Don't retry aborted requests
      doRetry: (response, request) => {
        // Check if the request was aborted
        if (request.signal?.aborted) {
          console.log('Skipping retry for aborted request');
          return false;
        }
        
        // Only retry server errors
        return response.status >= 500;
      }
    }));
  }
}
```

#### Solution 2: Manual Retry with Fresh AbortController

```typescript
export class ManualRetryService {
  private http = resolve(IHttpClient);

  async fetchWithRetry<T>(
    url: string, 
    options: RequestInit = {}, 
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Create fresh AbortController for each attempt
      const controller = new AbortController();
      
      try {
        const response = await this.http.get(url, {
          ...options,
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry aborted requests
        if (error.name === 'AbortError') {
          throw error;
        }
        
        // Don't retry client errors
        if (error.message.includes('HTTP 4')) {
          throw error;
        }

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Request failed after ${maxRetries} attempts: ${lastError!.message}`);
  }
}
```

## Advanced Cancellation Patterns

### Timeout with Custom Error Messages

```typescript
export class TimeoutService {
  private http = resolve(IHttpClient);

  async fetchWithTimeout<T>(
    url: string,
    timeoutMs: number,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await this.http.get(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
      }
      throw error;
    }
  }
}
```

### Race Conditions and Multiple Requests

```typescript
export class RaceConditionService {
  private http = resolve(IHttpClient);
  private activeControllers = new Map<string, AbortController>();

  async fetchExclusive(key: string, url: string): Promise<any> {
    // Cancel any existing request with this key
    const existingController = this.activeControllers.get(key);
    if (existingController) {
      existingController.abort();
    }

    // Create new controller for this request
    const controller = new AbortController();
    this.activeControllers.set(key, controller);

    try {
      const response = await this.http.get(url, {
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Clean up successful request
      this.activeControllers.delete(key);
      return data;

    } catch (error) {
      // Clean up failed/cancelled request
      this.activeControllers.delete(key);
      
      if (error.name === 'AbortError') {
        console.log(`Request cancelled for key: ${key}`);
        return null;
      }
      throw error;
    }
  }

  // Cancel all active requests
  cancelAll() {
    for (const [key, controller] of this.activeControllers.entries()) {
      controller.abort();
    }
    this.activeControllers.clear();
  }

  // Cancel specific request
  cancel(key: string) {
    const controller = this.activeControllers.get(key);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(key);
    }
  }
}
```

### File Upload Cancellation

```typescript
export class CancellableUploadService {
  private http = resolve(IHttpClient);

  async uploadFileWithCancellation(
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<{ result: Promise<any>; cancel: () => void }> {
    const controller = new AbortController();
    const formData = new FormData();
    formData.append('file', file);

    // For upload progress, we need to use XMLHttpRequest
    const uploadPromise = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Handle abort signal
      controller.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress(percentage);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new DOMException('Upload cancelled', 'AbortError'));
      });

      xhr.open('POST', '/api/files/upload');
      xhr.send(formData);
    });

    return {
      result: uploadPromise,
      cancel: () => controller.abort()
    };
  }

  // Usage example
  async uploadWithUserCancellation(file: File) {
    const { result, cancel } = await this.uploadFileWithCancellation(
      file,
      (percentage) => {
        console.log(`Upload progress: ${percentage}%`);
        
        // Show cancel button to user
        this.showCancelButton(() => {
          cancel();
          console.log('Upload cancelled by user');
        });
      }
    );

    try {
      const uploadResult = await result;
      this.hideCancelButton();
      return uploadResult;
    } catch (error) {
      this.hideCancelButton();
      if (error.name === 'AbortError') {
        console.log('Upload was cancelled');
        return null;
      }
      throw error;
    }
  }

  private showCancelButton(onCancel: () => void) {
    // Implementation depends on your UI framework
  }

  private hideCancelButton() {
    // Implementation depends on your UI framework
  }
}
```

## Best Practices

### Error Handling

Always check for AbortError specifically:

```typescript
try {
  const response = await http.get('/api/data', { signal: controller.signal });
  return await response.json();
} catch (error) {
  if (error.name === 'AbortError') {
    // Handle cancellation (usually not an error)
    console.log('Request was cancelled');
    return null; // or some default value
  }
  
  // Handle actual errors
  console.error('Request failed:', error);
  throw error;
}
```

### Resource Cleanup

Always clean up AbortControllers when components are destroyed:

```typescript
export class ComponentWithRequests {
  private activeControllers: AbortController[] = [];

  async makeRequest(url: string) {
    const controller = new AbortController();
    this.activeControllers.push(controller);

    try {
      const response = await this.http.get(url, { signal: controller.signal });
      return await response.json();
    } finally {
      // Remove from active list when done
      const index = this.activeControllers.indexOf(controller);
      if (index > -1) {
        this.activeControllers.splice(index, 1);
      }
    }
  }

  // Call this when component is destroyed
  dispose() {
    // Cancel all active requests
    this.activeControllers.forEach(controller => controller.abort());
    this.activeControllers.length = 0;
  }
}
```

### Avoid Common Pitfalls

1. **Don't reuse AbortControllers**: Create a new one for each request
2. **Handle AbortError gracefully**: It's usually not an actual error condition  
3. **Clean up timeouts**: Always clear timeout IDs when requests complete
4. **Be aware of the retry bug**: Use workarounds when combining AbortController with retries

## Integration with Aurelia Lifecycle

```typescript
import { IDisposable } from '@aurelia/kernel';

export class AutoCleanupService implements IDisposable {
  private http = resolve(IHttpClient);
  private activeRequests = new Set<AbortController>();

  async makeRequest(url: string): Promise<any> {
    const controller = new AbortController();
    this.activeRequests.add(controller);

    try {
      const response = await this.http.get(url, { signal: controller.signal });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Request failed:', error);
      }
      throw error;
    } finally {
      this.activeRequests.delete(controller);
    }
  }

  // Aurelia will call this automatically when the service is disposed
  dispose(): void {
    console.log(`Cancelling ${this.activeRequests.size} active requests`);
    
    for (const controller of this.activeRequests) {
      controller.abort();
    }
    
    this.activeRequests.clear();
  }
}
```

Understanding these patterns and limitations will help you build robust, cancellable HTTP operations in your Aurelia applications while avoiding the current retry mechanism bug.