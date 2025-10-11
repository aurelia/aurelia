[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/metadata.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/metadata)

# @aurelia/addons

## Installing

For the latest stable version:

```bash
npm i @aurelia/addons
```

For our nightly builds:

```bash
npm i @aurelia/addons@dev
```

## Rest Resource add-on

The `RestResourceConfiguration` plugin provides a thin typed wrapper around `@aurelia/fetch-client`. It lets you decorate classes or provide plain configs that describe a RESTful resource, and produces a strongly typed client with built-in caching, JSON serialization, and cache invalidation helpers.

### Quick start

1. Register the plugin when bootstrapping Aurelia:

   ```ts
   import { RestResourceConfiguration } from '@aurelia/addons';

   Aurelia
     .register(RestResourceConfiguration)
     .app(MyRoot)
     .start();
   ```

2. Describe your resource with the `@restResource` decorator:

   ```ts
   import { restResource } from '@aurelia/addons';

   interface Todo {
     id: number;
     title: string;
     completed: boolean;
   }

   @restResource<Todo>({
     baseUrl: 'https://api.example.dev/v1',
     resource: 'todos',
     cache: { ttl: 30_000, operations: ['list', 'getOne'] },
   })
   export class TodoResource {}
   ```

3. Resolve the factory and start issuing requests:

   ```ts
   import { IRestResourceFactory } from '@aurelia/addons';
   import { inject } from '@aurelia/kernel';

   @inject(IRestResourceFactory)
   export class TodoService {
     private readonly todosClient = this.factory.create<Todo>(TodoResource);

     constructor(private readonly factory: IRestResourceFactory) {}

     public async all() {
       return this.todosClient.list();
     }

     public async find(id: number) {
       return this.todosClient.getOne(id);
 }
}
```

See `docs/user-docs/aurelia-packages/addons/rest-resource.md` in this repository for configuration options, request hooks, and serializer customization.

### Advanced usage

- Get status codes and headers by toggling `returnResponse` on any call:

  ```ts
  const result = await todosClient.list({ returnResponse: true });
  console.log(result.status, result.headers.get('etag'));
  ```

- Build ad-hoc requests with the fluent builder:

  ```ts
  const response = await todosClient
    .request('todos/:id')
    .param('id', 42)
    .query({ include: 'comments' })
    .send<Todo>();
  ```

- Manage async status with `toAsyncState` and orchestrate parallel calls via `batch([
  ...
])` to mirror the ergonomics of .NET `HttpClient` helpers.
- Layer reusable policies (`withPolicies`, builder `.policy`, or plugin-level `policies`) to add auth headers, telemetry, or custom error handling without rebuilding the client.
