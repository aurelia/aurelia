# Using the fetch client

The Fetch Client can be used in a couple of different ways. You can create a new instance using the `new` keyboard or use dependency injection to create an instance.

## Basic Usage

Here's a quick example of how to set up and make a GET request with the Aurelia Fetch Client in an Aurelia 2 application. The Fetch client ships with Aurelia and requires no additional installation. Import the `HttpClient` from the `@aurelia/fetch-client` package to use it.

```javascript
import { HttpClient } from '@aurelia/fetch-client';

const httpClient = new HttpClient();

httpClient.configure(config => {
  config
    .withDefaults({ mode: 'cors' })
    .withBaseUrl('https://api.example.com/');
});

httpClient.get('users')
  .then(response => response.json())
  .then(users => console.log(users))
  .catch(error => console.error(error));
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

For the example above, if you prefer `.get`/`.post`/etc.. style, you can also use corresponding method on the Fetch client

```typescript
  ...
  this.http.post('comments', { body: JSON(comment) })
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

## Retrying failed requests

The Fetch client comes with a retry implementation that can be configured like the following example

```typescript
http.configure(config => config.withRetry(retryOptions))
```

There are several options can be specified, per the following type:
```typescript
export interface IRetryConfiguration {
  maxRetries: number;
  interval?: number;
  strategy?: number | ((retryCount: number) => number);
  minRandomInterval?: number;
  maxRandomInterval?: number;
  counter?: number;
  requestClone?: Request;
  doRetry?(response: Response, request: Request): boolean | Promise<boolean>;
  beforeRetry?(request: Request, client: HttpClient): Request | Promise<Request>;
}
```

Note that for option `strategy`, there are 4 default strategies provided via the export `RetryStrategy` from the `@aurelia/fetch-client` package:

```typescript
export const RetryStrategy: {
  fixed: 0;
  incremental: 1;
  exponential: 2;
  random: 3;
}
```

Per the names suggest, the interval which a request will be attempted again will be calcuated accordingly for each strategy.
If you want to supply your own strategy, the `strategy` option can take a callback to be invoked with the number of the retry and the return value is treated as the time to wait until the next fetch attempt.
