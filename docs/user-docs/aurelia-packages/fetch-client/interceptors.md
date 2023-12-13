# Interceptors

Interceptors in Aurelia's Fetch Client offer a powerful way to handle pre- and post-processing requests and responses. They are essential for tasks like logging, authentication, and error handling. Below are examples of commonly used interceptors.

## Logging Interceptor

This interceptor logs every request and response, which is invaluable for debugging and monitoring network activity.

```typescript
import { HttpClient } from '@aurelia/fetch-client';

const http = new HttpClient();
HTTP.configure(config => {
    config.withInterceptor({
        request(request) {
            console.log(`Requesting: ${request.method} ${request.url}`);
            return request;
        },
        response(response) {
            console.log(`Received: ${response.status} from ${response.url}`);
            return response;
        }
    });
});
```

## Token Authentication Interceptor

This interceptor appends an authentication token to each request's headers, centralizing the logic for secured endpoints.

```typescript
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

This interceptor uses request and response methods to log details of each outgoing request and incoming response.
