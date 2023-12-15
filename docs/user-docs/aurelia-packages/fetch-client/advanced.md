# Advanced Configuration

Configuring the Fetch Client for specific needs like setting default headers, handling timeouts, or implementing retry logic can enhance application performance and reliability.

## Setting Default Headers for JSON and Token Authorization

Setting default headers ensures that every request sent via the Fetch Client includes these headers, maintaining consistency and reducing redundancy in your code.

```typescript
import { HttpClient } from '@aurelia/fetch-client';

const http = new HttpClient();
http.configure(config => {
    config.withDefaults({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer YOUR_TOKEN_HERE`
        }
    });
});
```

This configuration sets the default `Accept` and `Content-Type` headers to handle JSON data and adds an `Authorization` header with a bearer token.

## Response Caching

Response caching can improve performance by storing and reusing responses for identical requests.

```typescript
const responseCache = new Map();

function createCacheInterceptor() {
    return {
        request(request) {
            const key = request.url + JSON.stringify(request.params);
            if (responseCache.has(key)) {
                return responseCache.get(key);
            }
            return request;
        },
        response(response, request) {
            const key = request.url + JSON.stringify(request.params);
            responseCache.set(key, response.clone()); // Clone the response for caching
            return response;
        }
    };
}

http.configure(config => {
    config.withInterceptor(createCacheInterceptor());
});
```

This configuration adds a simple caching layer, storing responses in a map and retrieving them for identical subsequent requests. It ensures faster response times for repeated requests to the same endpoints with the same parameters.

## Simple Retry Logic on Network Failure

This example sets up a retry mechanism that retries the request up to three times with a one-second delay between attempts, but only for certain types of errors (like network errors).

```typescript
function createRetryInterceptor(retries: number, delay: number) {
    return {
        response(response, request) {
            return response;
        },
        responseError(error, request) {
            if (retries > 0 && shouldRetry(error)) {
                retries--;
                return new Promise(resolve => setTimeout(resolve, delay))
                    .then(() => http.fetch(request));
            }
            throw error;
        }
    };
}

function shouldRetry(error) {
    // Define logic to determine if the request should be retried
    // For example, retry on network errors but not on HTTP 4xx or 5xx errors
    return error instanceof TypeError; // Network errors are TypeErrors in fetch
}

http.configure(config => {
    config.withInterceptor(createRetryInterceptor(3, 1000)); // Retry 3 times, 1-second delay
});
```
