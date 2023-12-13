---
description: >-
  The Aurelia Fetch Client wraps the native browser Fetch API and provides
  helpers and configuration options to make working with it more "Aurelia
  friendly"
---

# Fetch Client

Aurelia provides a fetch client which wraps the native Fetch API. It allows you to work with Fetch in an Aurelia-style way and provides some helper methods and configuration options to make working with Fetch easier.

The Fetch API has become a cornerstone in modern web development, offering a powerful way to make network requests. It replaces older techniques like XMLHttpRequest, providing a more flexible and cleaner way to handle HTTP operations. The Aurelia Fetch Client builds on this foundation, enhancing the Fetch API with additional features and an Aurelia-friendly interface. This document will guide you through the advantages and practical usage of Aurelia's Fetch Client.

## Aurelia Fetch Client vs Native Fetch

Compared to the native Fetch API, Aurelia's Fetch Client offers several advantages. It provides a more straightforward configuration process, better default settings for common scenarios, and helper methods that simplify common tasks. For instance, setting default headers or handling JSON data becomes more intuitive with Aurelia's approach

## Using the Fetch Client

The Fetch client ships with Aurelia and requires no additional installation. Import the `HttpClient` from the `@aurelia/fetch-client` package to use it.

```typescript
import { HttpClient } from '@aurelia/fetch-client';
```

In most cases, you want to inject a new instance of the Fetch client into your application. You can achieve this in a couple of different ways.

The first approach you can take is creating a new instance of the `HttpClient` and referencing it like the native Fetch API.

```typescript
import { HttpClient } from '@aurelia/fetch-client';

const http = new HttpClient();
```

You can inject a new instance into your component or service class by injecting the Fetch client with the `newInstanceOf` decorator. This will ensure our component gets a new instance of the Fetch client.

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { newInstanceOf } from '@aurelia/kernel';
import { ICustomElementViewModel } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {    
    constructor(@newInstanceOf(IHttpClient) readonly http: IHttpClient) {

    }
 }   
```

{% hint style="info" %}
You should avoid creating new instances of the Fetch client. Instead, you should create a service class or wrapper functionality that encapsulates your HTTP calls.
{% endhint %}

Taking a service-based approach to encapsulating your HTTP calls, you might create something like this:

{% tabs %}
{% tab title="Typescript" %}
```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { newInstanceOf } from '@aurelia/kernel';

export class ApiService {    
    constructor(@newInstanceOf(IHttpClient) readonly http: IHttpClient) {

    }
    
    getProducts() {
        const request = await this.http.fetch(`/products);
        const response = await request.json();
        
        return response;
    }
    
    getProduct(id) {
        const request = await this.http.fetch(`/products/${id}`);
        const response = await request.json();
        
        return response;
    }
 }   
```
{% endtab %}

{% tab title="Vanilla JS" %}
```javascript
import { resolve, newInstanceOf } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

export class ApiServiceervice {
    http = resolve(newInstanceOf(IHttpClient));
  
    async getProducts() {
        const request = await this.http.fetch(`/products`);
        const response = await request.json();
        
        return response;
      }
    
    async getProduct(id) {
        const request = await this.http.fetch(`/products/${id}`);
        const response = await request.json();
        
        return response;
    }
}
```
{% endtab %}
{% endtabs %}

## Configuring the fetch client

Many configuration options available to the native Fetch API are also available in the Aurelia Fetch Client. You can set default headers, create interceptors (more on that further down) and more.

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { newInstanceOf } from '@aurelia/kernel';
import { ICustomElementViewModel } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {    
    constructor(@newInstanceOf(IHttpClient) readonly http: IHttpClient) {
      http.configure(config =>
        config
        .withBaseUrl('api/')
        .withDefaults({
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'Fetch'
          }
        })
        .withInterceptor({
          request(request) {
            console.log(`Requesting ${request.method} ${request.url}`);
            return request;
          },
          response(response) {
            console.log(`Received ${response.status} ${response.url}`);
            return response;
          }
        })
      );
    }
 }   
```

In the example above, `withBaseUrl()` is used to specify a base URL that all fetches will be relative to. The `withDefaults()` method allows passing an object that can include any properties described in the optional `init` parameter to the [Request constructor](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request) and will be merged into the new [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) before it is passed to the first request interceptor.

`withInterceptor()` enables passing an object which can provide any of these four optional methods: `request`, `requestError`, `response`, and `responseError`. Here's an explanation of how each of these methods works:`request` takes the [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) that will be passed to `window.fetch()` after interceptors run. It should return the same Request or create a new one. It can also return a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) to short-circuit the call to `fetch()` and complete the request immediately. Interceptors will handle errors thrown in request interceptors.

* `requestError` acts as a Promise rejection handler during Request creation and request interceptor execution. It will receive the rejection reason and can either re-throw or recover by returning a valid Request.
* `response` will be run after `fetch()` completes, and will receive the resulting [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) . As with `request`, it can either pass the Response along, return a modified response, or throw.
* `responseError` is similar to `requestError` and acts as a Promise rejection handler for response rejections.

These methods on the interceptor object can also return a `Promise`for their respective return values.

### Fetch helpers

There are some caveats with the default Fetch implementation around error handling that Aurelia conveniently provides helper methods to work with.

* `config.rejectErrorResponses()` will add a response interceptor that causes responses with unsuccessful status codes to result in a rejected Promise.
* `config.useStandardConfiguration()` will apply `rejectErrorResponses()`, and also configure `credentials: 'same-origin'` as a default on all requests.
* The Fetch API has no convenient way of sending JSON in the body of a request. Objects must be manually serialized to JSON, and the `Content-Type` header must be set appropriately. the Fetch package includes a helper called `json` for this.

#### Posting JSON

```typescript
import { IHttpClient, json } from '@aurelia/fetch-client';
import { newInstanceOf } from '@aurelia/kernel';
import { ICustomElementViewModel } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {    
    constructor(@newInstanceOf(IHttpClient) readonly http: IHttpClient) {

    }
    
    createComment() {
        let comment = {
          title: 'Awesome!',
          content: 'This Fetch client is pretty rad.'
        };
  
        this.http.fetch('comments', {
            method: 'post',
            body: JSON(comment)
         });
    }
 }   
```
## Error Handling and Recovery

Robust error handling is crucial for any application making HTTP requests. It involves not only catching and responding to errors but also implementing strategies for error recovery and user notification.

```typescript
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
    // Centralized error handling logic
    console.error('Fetch Error:', error);
    // Additional logic like logging, user notification, etc.
}
```

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

The Aurelia Fetch Client can handle various response types, including JSON, Blob, and text. Proper handling of these types is crucial for the correct processing of server responses.

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
