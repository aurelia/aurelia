# GraphQL Integration

Integrate GraphQL into your Aurelia 2 application with modern tooling, type safety, and optimized performance. This guide covers multiple GraphQL clients and 2025 best practices.

## Prerequisites
- Aurelia 2 project
- GraphQL API endpoint
- TypeScript configured

## Client Options

Choose the right GraphQL client for your needs:

### Apollo Client (Full-featured)
```bash
npm install @apollo/client graphql
```
- **Bundle size:** ~30.7KB minified+gzipped
- **Best for:** Complex apps with caching, offline support, and state management

### URQL (Lightweight)
```bash
npm install @urql/core graphql
```
- **Bundle size:** ~12KB minified+gzipped  
- **Best for:** Performance-critical apps, mobile-first development

### graphql-request (Minimal)
```bash
npm install graphql-request graphql
```
- **Bundle size:** ~13.2KB minified+gzipped
- **Best for:** Simple scripts, minimal apps without caching needs

## Type Generation Setup

Install GraphQL Code Generator for type safety:

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-typed-document-node/core
```

Create `codegen.ts`:

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  documents: ['src/**/*.{ts,tsx,graphql}'],
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: []
    }
  }
};

export default config;
```

Add to `package.json`:

```json
{
  "scripts": {
    "codegen": "graphql-codegen",
    "codegen:watch": "graphql-codegen --watch"
  }
}
```

## Apollo Client Setup

### Environment Configuration

```typescript
// src/environment.ts
export const environment = {
  graphql: {
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};
```

### Apollo Client Service

```typescript
// src/services/graphql.ts
import { DI, Registration } from '@aurelia/kernel';
import { ApolloClient, InMemoryCache, HttpLink, from, ApolloError } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { environment } from '../environment';

export interface IGraphQLService {
  readonly client: ApolloClient<any>;
  query<T = any>(options: any): Promise<T>;
  mutate<T = any>(options: any): Promise<T>;
}

export class GraphQLService implements IGraphQLService {
  readonly client: ApolloClient<any>;

  constructor() {
    // Error handling link
    const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
      }

      if (networkError) {
        console.error(`Network error: ${networkError}`);
      }
    });

    // HTTP link
    const httpLink = new HttpLink({
      uri: environment.graphql.endpoint,
      headers: environment.graphql.headers
    });

    this.client = new ApolloClient({
      link: from([errorLink, httpLink]),
      cache: new InMemoryCache({
        typePolicies: {
          // Add type policies for better caching
        }
      }),
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all'
        },
        query: {
          errorPolicy: 'all'
        }
      }
    });
  }

  async query<T = any>(options: any): Promise<T> {
    try {
      const result = await this.client.query(options);
      return result.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async mutate<T = any>(options: any): Promise<T> {
    try {
      const result = await this.client.mutate(options);
      return result.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error instanceof ApolloError) {
      return new Error(error.message);
    }
    return error;
  }
}

export const IGraphQLService = DI.createInterface<IGraphQLService>('IGraphQLService', x => x.singleton(GraphQLService));
```

## Register Service

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import './services/graphql'; // Import to register the service
import { MyApp } from './my-app';

const au = new Aurelia();
au.register(StandardConfiguration);

au.app({ host: document.querySelector('my-app'), component: MyApp });
await au.start();
```

## Using with Type Generation

Create your GraphQL queries in `.graphql` files:

```graphql
# src/queries/getUsers.graphql
query GetUsers($limit: Int) {
  users(limit: $limit) {
    id
    name
    email
    avatar
  }
}

mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}
```

Run codegen to generate types:

```bash
npm run codegen
```

## Typed Component Example

```typescript
// src/components/user-list.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { IGraphQLService } from '../services/graphql';
import { graphql } from '../gql';

// Generated types from codegen
const GET_USERS = graphql(`
  query GetUsers($limit: Int) {
    users(limit: $limit) {
      id
      name
      email
      avatar
    }
  }
`);

const CREATE_USER = graphql(`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`);

@customElement('user-list')
export class UserList {
  users: any[] = [];
  loading = false;
  error: string | null = null;

  private readonly graphql: IGraphQLService = resolve(IGraphQLService);

  async attached() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.loading = true;
      this.error = null;
      
      const data = await this.graphql.query({
        query: GET_USERS,
        variables: { limit: 10 }
      });
      
      this.users = data.users;
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async createUser(name: string, email: string) {
    try {
      const data = await this.graphql.mutate({
        mutation: CREATE_USER,
        variables: {
          input: { name, email }
        },
        // Update cache after mutation
        update: (cache, { data }) => {
          if (data?.createUser) {
            // Update local cache
            const existingUsers = cache.readQuery({ query: GET_USERS });
            cache.writeQuery({
              query: GET_USERS,
              data: {
                users: [data.createUser, ...(existingUsers?.users || [])]
              }
            });
          }
        }
      });

      console.log('User created:', data.createUser);
    } catch (error: any) {
      this.error = error.message;
    }
  }
}
```

```html
<!-- src/components/user-list.html -->
<div class="user-list">
  <div if.bind="loading" class="loading">Loading users...</div>
  
  <div if.bind="error" class="error">
    Error: ${error}
    <button click.trigger="loadUsers()">Retry</button>
  </div>
  
  <div if.bind="!loading && users.length">
    <ul class="users">
      <li repeat.for="user of users" class="user-item">
        <img src.bind="user.avatar" alt="">
        <div>
          <h3>${user.name}</h3>
          <p>${user.email}</p>
        </div>
      </li>
    </ul>
  </div>
  
  <div if.bind="!loading && !users.length && !error">
    No users found.
  </div>
</div>
```

## Alternative Client Examples

### URQL (Lightweight Alternative)

```typescript
// src/services/urql-client.ts
import { DI, Registration } from '@aurelia/kernel';
import { createClient, Client, cacheExchange, fetchExchange } from '@urql/core';
import { environment } from '../environment';

export interface IURQLService {
  readonly client: Client;
}

export class URQLService implements IURQLService {
  readonly client: Client;

  constructor() {
    this.client = createClient({
      url: environment.graphql.endpoint,
      exchanges: [cacheExchange, fetchExchange]
    });
  }
}

export const IURQLService = DI.createInterface<IURQLService>('IURQLService', x => x.singleton(URQLService));
```

### graphql-request (Minimal)

```typescript
// src/services/graphql-request.ts
import { DI, Registration } from '@aurelia/kernel';
import { GraphQLClient, request } from 'graphql-request';
import { environment } from '../environment';

export interface IGraphQLRequest {
  query<T = any>(query: string, variables?: any): Promise<T>;
}

export class GraphQLRequestService implements IGraphQLRequest {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(environment.graphql.endpoint);
  }

  async query<T = any>(query: string, variables?: any): Promise<T> {
    return this.client.request<T>(query, variables);
  }
}

export const IGraphQLRequest = DI.createInterface<IGraphQLRequest>('IGraphQLRequest', x => x.singleton(GraphQLRequestService));
```

## Best Practices

### Performance
- **Bundle size matters** - Choose URQL (~12KB) or graphql-request (~13KB) for performance-critical apps
- **Caching strategy** - Use Apollo Client's normalized cache for complex data relationships
- **Query optimization** - Use fragments to avoid data over-fetching

### Type Safety
- **Always use codegen** - Generate types from your actual operations, not schema
- **Strict typing** - Avoid `any` types, use generated interfaces
- **Operation-based types** - Types should match exactly what you query

### Error Handling
- **Network errors** - Handle offline scenarios gracefully
- **GraphQL errors** - Display user-friendly error messages  
- **Loading states** - Provide clear feedback during data fetching

### Development Workflow
```bash
# Start codegen in watch mode during development
npm run codegen:watch

# Build with type checking
npm run build
```

This setup provides a complete, type-safe GraphQL integration with Aurelia 2, following 2025 best practices for performance, developer experience, and maintainability.
