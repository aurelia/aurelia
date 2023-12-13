---
description: >-
  The Aurelia Fetch Client wraps the native browser Fetch API and provides
  helpers and configuration options to make working with it more "Aurelia
  friendly"
---

# Fetch Client

Aurelia provides a fetch client which wraps the native Fetch API. It allows you to work with Fetch in an Aurelia-style way and provides some helper methods and configuration options to make working with Fetch easier.

The Fetch API has become a cornerstone in modern web development, offering a powerful way to make network requests. It replaces older techniques like XMLHttpRequest, providing a more flexible and cleaner way to handle HTTP operations. The Aurelia Fetch Client builds on this foundation, enhancing the Fetch API with additional features and an Aurelia-friendly interface. This document will guide you through the advantages and practical usage of Aurelia's Fetch Client.

## Working with Forms

Handling forms with the Fetch Client involves preparing FormData objects and sending them via HTTP requests. This is essential for tasks like submitting form data or uploading files.

### Submitting Form Data

This example shows how to submit form data using `FormData`.

```typescript
async function submitForm(formData: FormData) {
    const response = await http.fetch('submit-form-url', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        // Handle errors
    }
    return await response.json();
}

// Usage
const formElement = document.querySelector('form');
const formData = new FormData(formElement);
submitForm(formData);
```

### Uploading a File

Here's how to upload a file using the Fetch Client, which is common in many web applications.

```typescript
async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.fetch('upload-url', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        // Handle errors
    }
    return await response.json();
}
```

## Handling Different Response Types

The Aurelia Fetch Client can handle various response types, including JSON, Blob, and text. Proper handling of these types is crucial for correctly processing server responses.

### Handling JSON Response

This example demonstrates how to fetch and process a JSON response.

```typescript
async function fetchJson(url: string) {
    const response = await http.fetch(URL);
    if (response.ok) {
        return await response.json();
    } else {
        // Handle errors
    }
}
```

### Handling Blob (Binary Data)

This snippet shows how to handle binary data (like images or files) received from the server.

```typescript
async function fetchBlob(URL: string) {
    const response = await http.fetch(URL);
    if (response.ok) {
        return await response.blob();
    } else {
        // Handle errors
    }
}
```

### Response Transformation and Mapping

This interceptor transforms JSON responses using a custom transformData function, allowing for consistent data shaping across the application.

```typescript
http.configure(config => {
    config.withInterceptor({
        async response(response) {
            if (response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
                const data = await response.json();
                return transformData(data); // Custom transformation function
            }
            return response;
        }
    });
});

function transformData(data) {
    // Transformation logic
    return modifiedData;
}
```

## Interceptors

Interceptors in Aurelia's Fetch Client offer a powerful way to handle pre- and post-processing requests and responses. They are essential for tasks like logging, authentication, and error handling. Below are examples of commonly used interceptors.

### Logging Interceptor

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

### Token Authentication Interceptor

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

## Advanced Configuration

Configuring the Fetch Client for specific needs like setting default headers, handling timeouts, or implementing retry logic can enhance application performance and reliability.

### Setting Default Headers for JSON and Token Authorization

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

### Response Caching

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

### Simple Retry Logic on Network Failure

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
