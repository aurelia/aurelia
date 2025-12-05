# Dependency Injection

Aurelia's dependency injection (DI) system manages your application's services and their dependencies automatically, promoting clean architecture and testable code.

## Creating Services

Services are regular classes that encapsulate state and call out to other dependencies. Rather than assigning collaborators manually, grab them from the container via `resolve()`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

export class UserService {
  private readonly http = resolve(IHttpClient);
  private readonly cache: User[] = [];

  async getUsers(): Promise<User[]> {
    const response = await this.http.fetch('/api/users');
    const payload = await response.json();
    this.cache.splice(0, this.cache.length, ...payload);
    return this.cache;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.http.fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' },
    });
    const user = await response.json();
    this.cache.push(user);
    return user;
  }
}
```

## Service Registration

Register services using the interface pattern so components depend on tokens, not classes:

```typescript
import { DI } from '@aurelia/kernel';

export interface IUserService {
  getUsers(): Promise<User[]>;
  createUser(userData: CreateUserRequest): Promise<User>;
}

export const IUserService = DI.createInterface<IUserService>('IUserService', x => x.singleton(UserService));
```

When this module loads the container wires `IUserService` to a singleton `UserService` instance. Swapping implementations (e.g., a mock service in tests) only requires a different registration.

## Using Services in Components

Use the `resolve()` function to inject services into components:

```typescript
import { resolve } from '@aurelia/kernel';
import { IUserService } from './user-service';

export class UserList {
  private users: User[] = [];
  private userService = resolve(IUserService);

  async created() {
    this.users = await this.userService.getUsers();
  }

  async addUser(userData: CreateUserRequest) {
    const newUser = await this.userService.createUser(userData);
    this.users.push(newUser);
  }
}
```

**Why `resolve()`?**
- Clean, modern syntax
- No decorators needed
- Better TypeScript inference
- Easier to test

## Service Dependencies

Services can depend on other services using `resolve()`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';
import { ILogger } from '@aurelia/kernel';

export class UserService {
  private http = resolve(IHttpClient);
  private logger = resolve(ILogger);

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.http.fetch('/api/users');
      return await response.json();
    } catch (error) {
      this.logger.error('Failed to fetch users', error);
      throw error;
    }
  }
}
```

You can resolve multiple dependencies - Aurelia handles the wiring automatically.

## Service Lifetimes

Control how services are instantiated:

```typescript
// Singleton (default) - one instance per application
export const IUserService = DI.createInterface<IUserService>('IUserService', x => x.singleton(UserService));
export type IUserService = UserService;

// Transient - new instance every time
export const IEventLogger = DI.createInterface<IEventLogger>('IEventLogger', x => x.transient(EventLogger));
export type IEventLogger = EventLogger;
```

## Configuration Services

Create configuration objects for your services:

```typescript
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export const IApiConfig = DI.createInterface<ApiConfig>('IApiConfig');

// Register in main.ts
import Aurelia, { Registration } from 'aurelia';
import { IApiConfig } from './services/api-config';

Aurelia.register(
  Registration.instance(IApiConfig, {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
  })
);
```

```typescript
import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

export class ApiService {
  private readonly config = resolve(IApiConfig);
  private readonly http = resolve(IHttpClient);

  constructor() {
    this.http.configure((cfg) => {
      cfg.baseUrl = this.config.baseUrl;
      cfg.timeout = this.config.timeout;
    });
  }
}
```

## Resolver toolbox

The DI container ships a set of resolver helpers in `@aurelia/kernel`. Resolvers change *how* a dependency is located at runtime—perfect for optional services, per-scope instances, or discovering every implementation of an interface. Every resolver works both as a decorator (`@all(IMetricSink)`) and inside `resolve(...)`.

| Resolver | Example | What it does |
| --- | --- | --- |
| `all(key)` | `resolve(all(IMetricSink))` | Returns **all** registrations for a key (useful for plugin pipelines). |
| `last(key)` | `resolve(last(ISink))` | Grabs the most recently registered instance. |
| `lazy(key)` | `resolve(lazy(IHttpClient))` | Injects a function that resolves the dependency on demand. |
| `optional(key)` / `own(key)` | `resolve(optional(IMaybeService))` | Returns `undefined` (or the child container value) when nothing is registered. |
| `factory(key)` | `resolve(factory(MyModelClass))` | Gives you a function that constructs the service manually (passing constructor args if needed). |
| `newInstanceForScope(key)` | `resolve(newInstanceForScope(IValidationController))` | Creates and registers a brand-new instance in the current component scope, making it available to descendants via `resolve(IValidationController)`. |
| `newInstanceOf(Type)` | `resolve(newInstanceOf(Logger))` | Constructs a fresh instance of a concrete class or interface implementation without polluting the container. |
| `resource(key)` / `optionalResource(key)` / `allResources(key)` | `resolve(optionalResource(MyElement))` | Resolves using resource semantics (look in the current component first, then root) which is handy for templating resources. |
| `ignore` | `@ignore private unused?: Foo` | Tells the container to skip a constructor parameter completely. |

```typescript
import { all, resolve } from '@aurelia/kernel';

export class MetricsPanel {
  private sinks = resolve(all(IMetricSink));

  attached() {
    for (const sink of this.sinks) {
      sink.flush();
    }
  }
}
```

### Creating custom resolvers

If none of the built-ins fit, use `createResolver` to craft your own semantics. The helper wires up decorator + runtime support automatically:

```typescript
import { createResolver, resolve } from '@aurelia/kernel';

const newest = createResolver((key, handler, requestor) => {
  const instances = requestor.getAll(key);
  return instances[instances.length - 1];
});

export const newestLogger = newest(ILogger);

export class AuditTrail {
  private readonly logger = resolve(newestLogger);
}
```

Because resolvers are plain DI registrations, you can package them inside libraries or register them globally via `Aurelia.register(...)`, keeping consumption ergonomic in templates and services alike.

## Testing with DI

DI makes testing straightforward by allowing easy mocking:

```typescript
// Test setup
const mockUserService = {
  getUsers: () => Promise.resolve([{ id: 1, name: 'Test User' }]),
  createUser: (data) => Promise.resolve({ id: 2, ...data })
};

const container = DI.createContainer();
container.register(Registration.instance(IUserService, mockUserService));

// Test your component with mocked dependencies
const component = container.get(UserList);
```

## What's Next

- Learn more about [dependency injection concepts](../getting-to-know-aurelia/dependency-injection.md)
- Explore [service creation patterns](../getting-to-know-aurelia/dependency-injection-di/creating-services.md)
- Understand [DI resolvers](../getting-to-know-aurelia/dependency-injection-di/resolvers.md) for advanced scenarios
