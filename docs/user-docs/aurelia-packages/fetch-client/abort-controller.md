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

## AbortController and Retries

The retry interceptor does not retry aborted requests. When a request fails because its signal was aborted or fetch threw an `AbortError`, the call rejects with that error and no retry is attempted, even when `doRetry` is configured. The rejection is the signal's abort reason, so it is an `AbortError` only when `abort()` was called without a reason: `controller.abort(myReason)` rejects with `myReason`, and an `AbortSignal.timeout()` signal rejects with a `TimeoutError`.

Retries reuse the original request's signal. Aborting while a retry is waiting for its delay, while `beforeRetry` is running, or while a retry attempt is in flight settles the call straight away and ends the retry sequence; `beforeRetry` is not called once the call has been aborted. If `beforeRetry` returns a new `Request`, it is rebuilt on the original signal, so aborting still cancels it. Create a new AbortController for each logical call rather than reusing one; a controller that has already fired would prevent the retries from running.

If you need each attempt to have its own timeout budget, wrap the calls yourself instead of relying on `withRetry` — a fresh controller per attempt is the key detail:

```typescript
export class TimeoutRetryService {
  private http = resolve(IHttpClient);

  async fetchWithTimeoutPerAttempt<T>(url: string, timeoutMs: number, maxRetries = 3): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await this.http.get(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        lastError = error as Error;
        // An AbortError here means this attempt's timeout fired, so the loop tries again
        // with a fresh controller. Rethrow errors you don't want to retry, such as 4xx responses.
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError!;
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
4. **Aborts cancel the whole retry sequence**: An aborted request is not retried, and retry attempts share the original signal, so aborting once cancels every pending retry

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
