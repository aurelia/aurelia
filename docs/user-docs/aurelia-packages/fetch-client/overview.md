# Fetch Client

The `@aurelia/fetch-client` is a modern HTTP client for making network requests, designed to integrate seamlessly with Aurelia 2 applications. It is built on top of the Fetch API, providing an easy-to-use and promise-based interface to communicate with RESTful APIs.

## Features

The Aurelia Fetch Client comes with a host of features that make it a powerful tool for developers:

- **Fetch API Compliance**: Utilizes the native Fetch API, ensuring a standards-compliant requesting mechanism.
- **Fluent and Chainable API**: Offers a fluent interface to build requests in a readable and chainable manner.
- **Flexible Interceptors**: Interceptors allow for request and response manipulation, enabling tasks such as adding headers, logging, or handling authentication globally.
- **Configurable**: Easy to configure with sensible defaults that can be overridden as needed for different request scenarios.
- **Promise-based Workflow**: Built around Promises, it provides a streamlined way to handle asynchronous HTTP operations.

## Installation

To start using the Aurelia Fetch Client in your Aurelia 2 project, you need to install the package:

```bash
npm install @aurelia/fetch-client
```

## Basic Usage

Here's a quick example of how to set up and make a GET request with the Aurelia Fetch Client in an Aurelia 2 application:

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

## Configuration Options

The Aurelia Fetch Client supports a variety of configuration options to tailor its behavior to your application's needs. These include setting default headers, base URLs, timeout settings, and more.

## Interceptors

Enhance the capabilities of your HTTP requests and responses by using interceptors. This feature allows you to handle various cross-cutting concerns such as logging, authentication, or adding common headers.

## Error Handling

Efficient error handling is crucial for a robust application. The Aurelia Fetch Client provides mechanisms for catching and managing errors that may occur during the request lifecycle.

## Advanced Usage

For more complex scenarios, the Aurelia Fetch Client supports advanced configurations and use cases, such as creating custom interceptors, managing request retries, and working with various content types.

## Conclusion

The `@aurelia/fetch-client` is a versatile HTTP client that simplifies network communication in Aurelia 2 applications. By leveraging the Fetch API and providing additional features for customization and extensibility, it equips developers with the tools required for efficient and effective API interactions.

For in-depth information on configuration, usage examples, interceptor implementation, and more, please explore the other sections of this documentation.
