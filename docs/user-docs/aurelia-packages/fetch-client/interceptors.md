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

## Best Practices for Using Interceptors

- **Single Responsibility**: Each interceptor should have a single responsibility, whether it's logging, adding headers, or error handling.
- **Order Matters**: The order in which interceptors are added can affect their behavior, as they are executed in a pipeline.
- **Error Recovery**: Consider implementing strategies within `requestError` and `responseError` interceptors for error recovery, such as retrying failed requests.
- **Avoid Side Effects**: While interceptors can perform side effects, it's best to avoid them unless necessary for functionality like logging.
- **Short-Circuiting**: Interceptors can short-circuit the fetch process by returning a `Response` object in the `request` interceptor.

## Considerations for Interceptors

When implementing interceptors, it is important to be aware of their full potential and how to avoid common pitfalls:

- **Interceptor Lifecycle**: Interceptors are executed in the order they are registered. Understanding this order is crucial when you have dependencies between interceptors' operations.
- **Asynchronous Interceptors**: Interceptors can return `Promise`s, allowing for asynchronous operations. Ensure that any asynchronous code is handled properly to avoid unexpected behavior.
- **Pitfalls to Avoid**: Be cautious when changing shared request configurations within an interceptor, as this might affect other application parts. Always treat the `Request` and `Response` objects as immutable.
- **Performance Impacts**: Remember that complex logic within interceptors can impact the performance of your HTTP requests. Monitor the performance to ensure that interceptors do not introduce significant delays.
- **Debugging Interceptors**: Use logging within interceptors to help identify the flow of requests and responses. This can be invaluable when debugging unexpected behavior.
- **Organizing Interceptors**: For better maintainability, organize interceptors in a logical structure, such as grouping related interceptors together or keeping them close to the feature modules they relate to.
- **Advanced Use Cases**: For more complex scenarios, consider using interceptors for response caching, request retries with backoff strategies, or implementing custom prioritization of outgoing requests.
