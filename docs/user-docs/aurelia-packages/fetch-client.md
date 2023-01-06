# Fetch Client

Aurelia provides a fetch client which wraps the native Fetch API. It allows you to work with Fetch in an Aurelia-style way, as well as provides some helper methods and configuration options to make working with Fetch easier.

## Using the Fetch Client

The Fetch client ships with Aurelia and requires no additional installation. To use it, simply import the `HttpClient` from the `@aurelia/fetch-client` package.

```typescript
import { HttpClient } from '@aurelia/fetch-client';
```

In most cases, you want to inject a new instance of the Fetch client into your application. You can achieve this in a couple of different ways.

The first approach you can take is creating a new instance of the `HttpClient` and referencing it like you would the native Fetch API.

```typescript
import { HttpClient } from '@aurelia/fetch-client';

const http = new HttpClient();
```

You can also inject a new instance into your component or service class using the following approach of injecting the Fetch client using the `newInstanceOf` decorator. This will ensure our component gets a new instance of the Fetch client.

```typescript
import { HttpClient } from '@aurelia/fetch-client';
import { newInstanceOf } from '@aurelia/kernel';
import { ICustomElementViewModel } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {    
    constructor(@newInstanceOf(IHttpClient) readonly http: IHttpClient) {

    }
 }   
```

{% hint style="info" %}
Where possible, you will want to avoid creating new instances of the Fetch client. Instead, it is advisable that you create a service class or wrapper functionality of some kind that encapsulates your HTTP calls.
{% endhint %}

Taking a service-based approach to encapsulating your HTTP calls, you might create something like this:

```typescript
import { HttpClient } from '@aurelia/fetch-client';
import { newInstanceOf } from '@aurelia/kernel';

export class ApiService {    
    constructor(@newInstanceOf(IHttpClient) readonly http: IHttpClient) {

    }
    
    getProducts() {
        const request = await this.http.fetch(`/products`);
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

## Configuring the fetch client

Many of the configuration options available to the native Fetch API are available in the Aurelia Fetch Client too. You can set default headers, create interceptors (more on that further down) and more.

```typescript
import { HttpClient } from '@aurelia/fetch-client';
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

The example above `withBaseUrl()` is used to specify a base URL that all fetches will be relative to. The `withDefaults()` method allows passing an object that can include any properties described in the optional `init` parameter to the [Request constructor](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request), and will be merged into the new [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) before it is passed to the first request interceptor.

`withInterceptor()` enables passing an object which can provide any of these four optional methods: `request`, `requestError`, `response`, and `responseError`. Here's an explanation of how each of these methods work:

* `request` takes the [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) that will be passed to `window.fetch()` after interceptors run. It should return the same Request or create a new one. It can also return a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) to short-circuit the call to `fetch()` and complete the request immediately. Errors thrown in request interceptors will be handled by `requestError` interceptors.
* `requestError` acts as a Promise rejection handler during Request creation and request interceptor execution. It will receive the rejection reason, and can either re-throw, or recover by returning a valid Request.
* `response` will be run after `fetch()` completes, and will receive the resulting [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) . As with `request`, it can either pass the Response along, return a modified response, or throw.
* `responseError` is similar to `requestError`, and acts as a Promise rejection handler for response rejections.

These methods on the interceptor object can also return `Promise`s for their respective return values.

### Fetch helpers

There are some caveats with the default Fetch implementation around error handling that Aurelia provides helper methods to conveniently work with.

* `config.rejectErrorResponses()` will add a response interceptor that causes responses with unsuccessful status codes to result in a rejected Promise.
* `config.useStandardConfiguration()` will apply `rejectErrorResponses()`, and also configure `credentials: 'same-origin'` as a default on all requests.
* The Fetch API has no convenient way of sending JSON in the body of a request. Objects must be manually serialized to JSON, and the `Content-Type` header set appropriately. aurelia-fetch-client includes a helper called `json` for this.

#### Posting JSON

```typescript
import { HttpClient, json } from '@aurelia/fetch-client';
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
            body: json(comment)
         });
    }
 }   
```

## Working with authentication bearer tokens

A common scenario in applications using authentication is to use bearer tokens sent in the headers of each request.

To achieve this, we can use a request interceptor to add the token to the headers of each request. The following example assumes you are getting the bearer token from somewhere (session or local storage, etc).

```typescript
import { HttpClient } from '@aurelia/fetch-client';
import { newInstanceOf } from '@aurelia/kernel';
import { ICustomElementViewModel } from 'aurelia';

export class MyComponent implements ICustomElementViewModel {    
    constructor(@newInstanceOf(IHttpClient) readonly http: IHttpClient) {
      http.configure(config =>
        config
          .withInterceptor({
            request(request) {
              request.headers.append('Authorization', 'Bearer ' + YOUR_BEARER_TOKEN);
              return request;
            }
          })
      );
    }
 }   
```
