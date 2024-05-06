# Integrating GraphQL with Apollo Client in Aurelia 2

GraphQL is a powerful data query language allowing you to request the data you need from your APIs. Integrating GraphQL with Aurelia 2 can be streamlined using Apollo Client, a comprehensive state management library for JavaScript that enables you to manage both local and remote data with GraphQL. In this recipe, we will set up Apollo Client within an Aurelia 2 application and demonstrate how to fetch data using GraphQL queries.

## Prerequisites
Before integrating Apollo Client, ensure you have the following installed:
- Node.js and npm
- An Aurelia 2 project setup
- A GraphQL backend service to connect to

## Installation
First, install `@apollo/client` and `graphql`:

```bash
npm install @apollo/client graphql
```

## Setting Up Apollo Client
Create a service to initialize Apollo Client. We will use Aurelia's dependency injection (DI) to make the client available throughout our application.

1. Create a new file named `graphql-client.ts` in your `src` directory.

2. Define the `IGraphQLClient` interface using `DI.createInterface`. This will allow us to inject the Apollo Client instance wherever we need it.

3. Initialize the Apollo Client with your GraphQL server's URI.

```typescript
// src/graphql-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { DI } from 'aurelia';

export const IGraphQLClient = DI.createInterface<IGraphQLClient>('IGraphQLClient', x => x.singleton(GraphQLClient));

export class GraphQLClient {
  private client: ApolloClient<any>;

  constructor() {
    this.client = new ApolloClient({
      link: new HttpLink({ uri: 'YOUR_GRAPHQL_API_URI' }), // Replace with your GraphQL API URI
      cache: new InMemoryCache(),
    });
  }

  get clientInstance() {
    return this.client;
  }
}
```

## Using Apollo Client in Components
With the Apollo Client service set up, you can inject it into any Aurelia component and use it to perform GraphQL queries, mutations, or subscriptions.

1. In your component, import the `IGraphQLClient` interface and use Aurelia's `resolve` method to inject the Apollo Client instance.

2. Use the `clientInstance` to send a query to your GraphQL server.

Here's an example component that fetches a list of items from a GraphQL API:

```typescript
// src/my-component.ts
import { customElement, ICustomElementViewModel, resolve } from 'aurelia';
import { gql } from '@apollo/client/core';
import { IGraphQLClient } from './graphql-client';

@customElement({ name: 'my-component', template: `<template><ul><li repeat.for="item of items">${item.name}</li></ul></template>` })
export class MyComponent implements ICustomElementViewModel {
  public items: any[] = [];

  private readonly graphQLClient: IGraphQLClient = resolve(IGraphQLClient);

  public async binding(): Promise<void> {
    const { data } = await this.graphQLClient.clientInstance.query({
      query: gql`
        query GetItems {
          items {
            id
            name
          }
        }
      `,
    });

    if (data) {
      this.items = data.items;
    }
  }
}
```

## Conclusion
Following the steps outlined above, you successfully integrated Apollo Client into your Aurelia 2 application using the framework's dependency injection system. You can now easily perform GraphQL queries, mutations, and subscriptions throughout your application.

Remember to replace `'YOUR_GRAPHQL_API_URI'` with the actual URI of your GraphQL server. You can expand on this basic setup by adding error handling, loading states, and utilizing Apollo Client's advanced features like cache management and optimistic UI updates.

## Additional Tips
- For complex applications, consider creating a separate module or feature to encapsulate all GraphQL-related logic.
- Explore Apollo Client's reactive variables and local state management capabilities for a more comprehensive solution.
- Use fragments in your GraphQL queries to reduce duplication and enhance maintainability.
- Ensure you handle loading and error states in your components for a better user experience.
