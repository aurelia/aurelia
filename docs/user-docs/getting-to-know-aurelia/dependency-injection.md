---
description: Learn the fundamentals of Aurelia's dependency injection container and how to register, resolve, and organize services.
---

# Dependency Injection (DI)

Aurelia ships with a lightweight but powerful dependency injection (DI) container. It wires classes together so you can focus on behavior instead of manual service lookups.

> **Before you start:** Make sure your project is set up using [App configuration and startup](app-configuration-and-startup.md); DI registrations usually happen during boot or feature composition.

## Why DI matters

- **Loose coupling** – swap implementations without rewriting consumers.
- **Testability** – inject doubles or fakes and keep constructors clean.
- **Lifetime control** – opt into singleton, transient, and scoped registrations.
- **Discoverability** – centralise service configuration instead of scattering `new` statements across the app.

## Quick start

Declare the dependencies your class needs and let the container supply them. The `@inject` decorator keeps it explicit and type-safe:

```typescript
import { inject, ILogger } from 'aurelia';
import { ApiClient } from './services/api-client';

@inject(ApiClient, ILogger)
export class OrdersPage {
  constructor(private api: ApiClient, private logger: ILogger) {}

  async binding() {
    const orders = await this.api.load();
    this.logger.debug('Loaded orders', orders);
  }
}
```

Most Aurelia apps use the default root container created by the runtime, but you can always create your own for testing or specialised scenarios:

```typescript
import { DI, Registration } from 'aurelia';

const container = DI.createContainer();
container.register(
  Registration.singleton(ApiClient, ApiClient),
  Registration.instance('config', runtimeConfig)
);
```

Resolve services directly when you need to:

```typescript
const api = container.get(ApiClient);
const loggers = container.getAll(ILogger);
```

## Key concepts at a glance

| Concept | Summary | Dive deeper |
| --- | --- | --- |
| Containers & scopes | Create child containers to override or extend registrations per feature or component. | [Container overview](dependency-injection-di/overview.md) |
| Registration helpers | `Registration.singleton`, `.transient`, `.instance`, and more control lifetime and creation. | [Creating services](dependency-injection-di/creating-services.md) |
| Interfaces & tokens | Use symbols or `DI.createInterface()` to inject by contract instead of class. | [What is DI?](dependency-injection-di/what-is-dependency-injection.md) |
| Resolvers | Fine tune how dependencies are delivered (lazy, optional, all, new instance, etc.). | [Resolvers](dependency-injection-di/resolvers.md) |

## Usage tips

- Keep constructors small; if a class needs more than a few services, consider extracting collaborators.
- Register feature-specific services at the component or route boundary rather than globally when possible.
- Combine DI with [App tasks](app-tasks.md) to hook container configuration into the application lifecycle.
- When integrating with other frameworks, create a bridge service that the container can hand out instead of reaching through globals.

## Next steps

1. Walk through the [DI overview](dependency-injection-di/overview.md) for a conceptual refresher.
2. Review [creating services](dependency-injection-di/creating-services.md) to choose the right registration helper.
3. Learn how [resolvers](dependency-injection-di/resolvers.md) influence injection behavior for advanced scenarios.
4. Explore [What is dependency injection?](dependency-injection-di/what-is-dependency-injection.md) if you’re new to DI patterns in general.

Once these fundamentals feel natural, pair them with Aurelia features such as [App tasks](app-tasks.md) and the [task queue](task-queue.md) to orchestrate complex startup flows.
