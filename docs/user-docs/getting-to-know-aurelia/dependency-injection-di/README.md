# Dependency Injection Quick Reference

Your task-focused guide to Aurelia 2's dependency injection system.

## Table of Contents
- [Getting Started](#getting-started)
- [Injecting Dependencies](#injecting-dependencies)
- [Creating Services](#creating-services)
- [Service Lifetimes](#service-lifetimes)
- [Advanced Injection](#advanced-injection)
- [Container Management](#container-management)
- [Testing](#testing)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### How do I inject a service into my component?

**Property injection with `resolve()`:**
```typescript
import { resolve } from '@aurelia/kernel';
import { IUserService } from './user-service';

export class UserList {
  private userService = resolve(IUserService);

  async attached() {
    const users = await this.userService.getUsers();
  }
}
```

**Constructor injection with `@inject`:**
```typescript
import { inject } from '@aurelia/kernel';
import { IUserService } from './user-service';

@inject(IUserService)
export class UserList {
  constructor(private userService: IUserService) {}
}
```

[Injection patterns →](./overview.md#constructor-injection--declaring-injectable-dependencies)

### When should I use `resolve()` vs `@inject`?

| Method | Use When | Benefits |
|--------|----------|----------|
| `resolve()` | Prefer property/field injection or want to avoid decorators | Cleaner syntax, works with inheritance, no metadata required |
| `@inject` | Prefer explicit constructor injection and immutable dependencies | Constructor clearly documents required services; great for unit tests |
| `static inject` | Avoiding decorators entirely | No decorator metadata required |

**Choosing your style:**

- Use `resolve()` when you want lightweight property injection, when inheriting from framework base classes, or when decorators/`emitDecoratorMetadata` are unavailable.
- Use `@inject` when you want constructor parameters to stay read-only, when your team prefers explicit signatures, or when you need to support tooling that analyzes constructor arguments.
- `static inject` remains available for teams that disable decorators entirely.

**Property injection example:**
```typescript
export class MyComponent {
  private api = resolve(IApiClient);
  private logger = resolve(ILogger);
}
```

[Understanding resolve() →](./overview.md#property-injection)

### How do I create a service?

```typescript
import { DI } from '@aurelia/kernel';

// 1. Create the service class
export class UserService {
  async getUsers(): Promise<User[]> {
    // implementation
  }
}

// 2. Create the interface token
export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService)  // Auto-register as singleton
);

// 3. Export the type for consumers
export type IUserService = UserService;
```

> **Heads up:** default implementations registered inside `DI.createInterface` are only consulted when the container has registered the token itself. Resolvers such as `optional(IUserService)` or `resolve(all(IUserService))` will return `undefined` until you run `container.register(IUserService)`. This matches the runtime behavior in packages/kernel/src/di.ts (`container.register(MyStr);` comment) and avoids surprising allocations when optional dependencies are missing.

[Creating services →](./creating-services.md)

---

## Injecting Dependencies

### How do I inject multiple services?

**Using `resolve()`:**
```typescript
import { resolve } from '@aurelia/kernel';

export class CheckoutComponent {
  private cart = resolve(ICartService);
  private payment = resolve(IPaymentService);
  private logger = resolve(ILogger);
}
```

You can also resolve multiple keys in one call and destructure the tuple result:

```typescript
const [router, logger] = resolve(IRouter, ILogger);
```
This uses the runtime helper defined in packages/kernel/src/di.container.ts to pull each token from the currently active container, which keeps the code concise when a class needs several collaborators.

**Constructor injection with `@inject`:**
```typescript
import { inject } from '@aurelia/kernel';

@inject(ICartService, IPaymentService, ILogger)
export class CheckoutComponent {
  constructor(
    private cart: ICartService,
    private payment: IPaymentService,
    private logger: ILogger
  ) {}
}
```

**Using `static inject`:**
```typescript
export class CheckoutComponent {
  static inject = [ICartService, IPaymentService, ILogger];

  constructor(
    private cart: ICartService,
    private payment: IPaymentService,
    private logger: ILogger
  ) {}
}
```

### How do I make a dependency optional?

```typescript
import { resolve, optional } from '@aurelia/kernel';

export class AnalyticsComponent {
  // Service might not be registered - won't throw error
  private analytics = resolve(optional(IAnalyticsService));

  trackEvent(name: string) {
    if (this.analytics) {
      this.analytics.track(name);
    }
  }
}
```

Constructor injection with `@inject`:
```typescript
import { inject, optional } from '@aurelia/kernel';

@inject(optional(IAnalyticsService))
export class AnalyticsComponent {
  constructor(private analytics?: IAnalyticsService) {}
}
```

[Optional dependencies →](./resolvers.md#optional-resolver)

### How do I inject all implementations of a service?

```typescript
import { resolve, all } from '@aurelia/kernel';

export class PluginManager {
  // Get array of all registered plugins
  private plugins = resolve(all(IPlugin));

  initializePlugins() {
    this.plugins.forEach(plugin => plugin.initialize());
  }
}
```

[All resolver →](./resolvers.md#all-resolver)

### How do I lazy-load a service?

```typescript
import { resolve, lazy } from '@aurelia/kernel';

export class ReportGenerator {
  // Service won't be created until called
  private getHeavyService = resolve(lazy(IHeavyProcessingService));

  async generateReport() {
    const service = this.getHeavyService();  // Created here
    return await service.process();
  }
}
```

[Lazy resolver →](./resolvers.md#lazy-resolver)

---

## Creating Services

### Which registration helper should I use?

`Registration` exposes more than singleton vs transient (see packages/kernel/src/di.registration.ts). Pick the helper that matches your lifetime and creation strategy:

| Helper | What it does | Typical use |
| --- | --- | --- |
| `Registration.instance(key, value)` | Always returns the provided object. | App configuration, external SDK singletons. |
| `Registration.singleton(key, Type)` | Lazily creates one instance per container. | Services with shared state (API clients, stores). |
| `Registration.transient(key, Type)` | Creates a new instance every time. | Utilities or disposable types. |
| `Registration.callback(key, fn)` | Runs the callback on every resolution. | Values that depend on runtime arguments or container state. |
| `Registration.cachedCallback(key, fn)` | Runs the callback once per container then caches the result. | Expensive factories that still need manual control of construction. |
| `Registration.aliasTo(original, alias)` | Exposes an existing registration under another key. | Provide the same implementation for multiple tokens (mock vs real). |
| `Registration.defer(extension, data)` | Defers resource registration until a dedicated registry handles it. | Template preprocessors and conventions (used by the HTML preprocessor for CSS modules). |

Combine these helpers with `Aurelia.register(...)` or container-local `register(...)` calls wherever you wire up services.

### How do I create a simple service?

```typescript
import { DI } from '@aurelia/kernel';

export class ApiClient {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json();
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
}

// Create interface token with auto-registration
export const IApiClient = DI.createInterface<IApiClient>(
  'IApiClient',
  x => x.singleton(ApiClient)
);

export type IApiClient = ApiClient;
```

[Service creation →](./creating-services.md)

### How do I inject dependencies into my service?

**Using `resolve()` (recommended):**
```typescript
import { resolve } from '@aurelia/kernel';
import { DI } from '@aurelia/kernel';

export class UserService {
  private http = resolve(IHttpClient);
  private logger = resolve(ILogger);
  private config = resolve(IAppConfig);

  async getUsers(): Promise<User[]> {
    this.logger.debug('Fetching users...');
    return this.http.get(`${this.config.apiUrl}/users`);
  }
}

export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService)
);

export type IUserService = UserService;
```

**Constructor injection with `@inject`:**
```typescript
import { inject, DI } from '@aurelia/kernel';

@inject(IHttpClient, ILogger, IAppConfig)
export class UserService {
  constructor(
    private http: IHttpClient,
    private logger: ILogger,
    private config: IAppConfig
  ) {}

  async getUsers(): Promise<User[]> {
    this.logger.debug('Fetching users...');
    return this.http.get(`${this.config.apiUrl}/users`);
  }
}

export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService)
);

export type IUserService = UserService;
```

### How do I create a service without auto-registration?

```typescript
import { DI } from '@aurelia/kernel';

export class PaymentService {
  // Implementation
}

// Create token WITHOUT default registration
export const IPaymentService = DI.createInterface<IPaymentService>('IPaymentService');
export type IPaymentService = PaymentService;
```

Then register manually:
```typescript
import { Registration } from '@aurelia/kernel';

// In main.ts or feature registration
Aurelia.register(
  Registration.singleton(IPaymentService, PaymentService)
);
```

[Manual registration →](./overview.md#registering-services)

### How do I use a class directly without an interface?

```typescript
// No interface needed - use class directly
export class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

// Inject using the class
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  private logger = resolve(LoggerService);
}
```

**Note**: For better testability and decoupling, prefer using `DI.createInterface()`.

---

## Service Lifetimes

### What are the different service lifetimes?

| Lifetime | Description | Use For |
|----------|-------------|---------|
| **Singleton** | One instance per container | Services with shared state, API clients, configuration |
| **Transient** | New instance every injection | Stateless utilities, factories, disposable objects |

### How do I create a singleton service?

```typescript
import { DI } from '@aurelia/kernel';

export class AuthService {
  private currentUser: User | null = null;

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

// Singleton (default)
export const IAuthService = DI.createInterface<IAuthService>(
  'IAuthService',
  x => x.singleton(AuthService)
);

export type IAuthService = AuthService;
```

**Why singleton?** Auth state should be shared across the entire application.

[Singleton registration →](./creating-services.md#creating-an-interface-token-with-a-default-implementation)

### How do I create a transient service?

```typescript
import { DI } from '@aurelia/kernel';

export class EventLogger {
  private readonly timestamp = new Date();

  log(event: string) {
    console.log(`[${this.timestamp.toISOString()}] ${event}`);
  }
}

// Transient - new instance each time
export const IEventLogger = DI.createInterface<IEventLogger>(
  'IEventLogger',
  x => x.transient(EventLogger)
);

export type IEventLogger = EventLogger;
```

**Why transient?** Each logger should have its own timestamp.

### How do I force a new instance regardless of registration?

```typescript
import { resolve, newInstanceOf } from '@aurelia/kernel';

export class ReportGenerator {
  // Always creates a fresh instance
  private processor = resolve(newInstanceOf(DataProcessor));
}
```

Or with constructor:
```typescript
import { inject, newInstanceOf } from '@aurelia/kernel';

@inject(newInstanceOf(DataProcessor))
export class ReportGenerator {
  constructor(private processor: DataProcessor) {}
}
```

[newInstanceOf resolver →](./resolvers.md#newinstanceof-resolver)

---

## Advanced Injection

### How do I inject into properties (not constructor)?

```typescript
import { resolve } from '@aurelia/kernel';

export class BaseController {
  // Property injection - useful with inheritance
  protected logger = resolve(ILogger);
  protected config = resolve(IAppConfig);
}

export class UserController extends BaseController {
  private userService = resolve(IUserService);

  async loadUsers() {
    this.logger.debug('Loading users...');
    return this.userService.getAll();
  }
}
```

**Why property injection?**
- Works with inheritance (constructor calls can be tricky)
- Cleaner when extending framework classes
- Modern with `resolve()`

[Property injection →](./overview.md#property-injection)

### How do I create a factory for my service?

```typescript
import { resolve, factory } from '@aurelia/kernel';

export class DocumentProcessor {
  // Get a factory function instead of instance
  private createParser = resolve(factory(IDocumentParser));

  processDocuments(documents: Document[]) {
    return documents.map(doc => {
      // Create new parser for each document
      const parser = this.createParser();
      return parser.parse(doc);
    });
  }
}
```

[Factory resolver →](./resolvers.md#factory-resolver)

### How do I publish my own scoped context?

Use `InstanceProvider` when you need to expose a value that should be resolved exactly as-is by descendants. Aurelia uses the same primitive to wire controllers, hydration contexts, and router state into child scopes (see packages/runtime-html/src/templating/controller.ts and packages/router/src/route-context.ts).

```typescript
import { DI, IContainer, InstanceProvider } from '@aurelia/kernel';

export interface FeatureContext {
  featureId: string;
}

export const IFeatureContext = DI.createInterface<FeatureContext>('IFeatureContext');

export function createFeatureScope(parent: IContainer, featureId: string) {
  const child = parent.createChild();
  const provider = new InstanceProvider<FeatureContext>('IFeatureContext');
  child.registerResolver(IFeatureContext, provider, true);
  provider.prepare({ featureId });
  return child;
}
```

- Call `registerResolver` with the provider so `resolve(IFeatureContext)` returns the prepared value.
- The optional third argument (`true`) tells the container to dispose the provider automatically when the scope goes away.
- You can replace the value later via `provider.prepare(newValue)` to update the scoped instance.

### How do I scope a service to a component?

```typescript
import { resolve, newInstanceForScope } from '@aurelia/kernel';

export class FormComponent {
  // Each form component gets its own validation service
  private validator = resolve(newInstanceForScope(IValidationService));
}
```

[Scoped instances →](./resolvers.md#newinstanceforscope-resolver)

### How do I inject the last registered instance?

```typescript
import { resolve, last } from '@aurelia/kernel';

export class ConfigLoader {
  // Get the most recently registered config
  private config = resolve(last(IAppConfig));
}
```

Useful when you have multiple registrations and want the override:
```typescript
container.register(Registration.instance(IAppConfig, defaultConfig));
container.register(Registration.instance(IAppConfig, customConfig));  // This one wins with last()
```

[Last resolver →](./resolvers.md#last-resolver)

### How do I plug in custom factories or transformers?

When the built-in lifetime helpers are not enough, register your own factory for a key. This is how Aurelia supports interface tokens whose concrete type needs extra inputs (see packages/__tests__/src/1-kernel/di.get.spec.ts for working examples).

```typescript
import { Constructable, DI, IContainer, Registration, resolve } from '@aurelia/kernel';

export interface ReportService {
  run(reportId: string): Promise<Response>;
}

export const IReportService = DI.createInterface<ReportService>('IReportService');
export interface ReportConfig { endpoint: string; }
export const IReportConfig = DI.createInterface<ReportConfig>('IReportConfig');

class ReportServiceImpl implements ReportService {
  constructor(private readonly api = resolve(IApiClient)) {}
  run(reportId: string) {
    return this.api.get(`/reports/${reportId}`);
  }
}

const reportFactory = {
  Type: ReportServiceImpl,
  transformers: [] as ((instance: ReportServiceImpl) => ReportServiceImpl)[],
  construct(container: IContainer) {
    const instance = container.getFactory(ReportServiceImpl).construct(container);
    const config = container.get(IReportConfig);
    instance.setBaseUrl(config.endpoint);
    return this.transformers.reduce((inst, transform) => transform(inst), instance);
  },
  registerTransformer(transformer: (instance: ReportServiceImpl) => ReportServiceImpl) {
    this.transformers.push(transformer);
  }
};

const container = DI.createContainer();
container.registerFactory(IReportService as unknown as Constructable, reportFactory);
container.register(
  Registration.instance(IReportConfig, { endpoint: '/api/reporting' })
);

// Later you can decorate every resolved instance
container.registerTransformer(
  IReportService as unknown as Constructable,
  report => new CachedReportService(report) // Your decorator implementation
);
```

- `container.registerFactory(key, factory)` ties a token to a custom factory. For interface tokens you can cast the interface to `Constructable` exactly like the runtime tests do. Inside `construct` you can call `container.getFactory(SomeClass).construct(...)` to reuse Aurelia's dependency calculation.
- `container.registerTransformer(key, transformer)` lets you wrap or mutate instances after construction—perfect for logging proxies, caching, or feature flags. The container implementation keeps the transformer list per key (packages/kernel/src/di.container.ts:305-330, 664-668).

`CachedReportService` in the example is any decorator you want to apply—it simply receives the just-created `ReportService` and returns the wrapped instance you want the container to hand out.

If you simply need one-off construction hooks, prefer `Registration.callback`/`Registration.cachedCallback`. Reach for `registerFactory` only when you need full control over how and when instances are created.

---

## Container Management

### How do I configure a container?

`DI.createContainer()` accepts an optional configuration object that maps directly to the runtime `IContainerConfiguration` (packages/kernel/src/di.container.ts). Use it to change inheritance and default registration strategy:

```typescript
import { DI, DefaultResolver } from '@aurelia/kernel';

const container = DI.createContainer({
  inheritParentResources: true,
  defaultResolver: DefaultResolver.transient
});
```

- **inheritParentResources** copies the parent container’s resource registrations (custom elements, attributes, value converters, etc.) into the child. Shadow DOM features or micro-frontends can opt in so they see exactly what the parent registered without falling back to the app root.
- **defaultResolver** controls how plain classes are auto-registered when you first resolve them. `DefaultResolver.singleton` (the default) caches one instance per container; switching to `DefaultResolver.transient` ensures every `resolve(SomeClass)` call returns a fresh instance. If you want to *force* explicit registrations, use `DefaultResolver.none` so the container throws whenever you resolve an unknown class (great for large teams that prefer auditability).

Child containers can also pass `{ inheritParentResources: true }` to `createChild(...)` for one-off scopes that need the same behavior.

### How do I create a custom container?

```typescript
import { DI, Registration } from '@aurelia/kernel';

const container = DI.createContainer();
container.register(
  Registration.singleton(IApiClient, ApiClient),
  Registration.instance(IAppConfig, myConfig)
);

// Resolve services
const api = container.get(IApiClient);
```

[Container creation →](./overview.md#creating-containers)

### How do I create a child container?

```typescript
import { DI } from '@aurelia/kernel';

const rootContainer = DI.createContainer();

// Child inherits from parent but can override
const childContainer = rootContainer.createChild();

childContainer.register(
  Registration.instance(ILogger, childLogger)  // Overrides parent
);
```

**Use cases:**
- Feature modules with their own services
- Testing with mocked dependencies
- Multi-tenant applications

[Container hierarchy →](./DIAGRAMS.md#1-container-hierarchy-and-resolution)

### How do I register multiple implementations?

```typescript
import { DI, Registration } from '@aurelia/kernel';

// Register multiple implementations
container.register(
  Registration.instance(IPlugin, new LoggingPlugin()),
  Registration.instance(IPlugin, new AnalyticsPlugin()),
  Registration.instance(IPlugin, new CachePlugin())
);

// Get all implementations
import { resolve, all } from '@aurelia/kernel';

export class PluginHost {
  private plugins = resolve(all(IPlugin));

  initialize() {
    this.plugins.forEach(p => p.init());
  }
}
```

### How do I register instances directly?

```typescript
import { DI, Registration } from '@aurelia/kernel';

const appConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

container.register(
  Registration.instance(IAppConfig, appConfig)
);
```

**Use cases:**
- Configuration objects
- External libraries
- Pre-initialized objects

[Registration types →](./overview.md#registration-types)

### How do I check or override an existing registration?

The container exposes inspection APIs so you can detect whether something is registered and optionally swap it out at runtime (see `IContainer.has`/`getResolver` in packages/kernel/src/di.ts).

```typescript
import { DI, InstanceProvider } from '@aurelia/kernel';
import { ICacheService } from './cache-service';

const container = DI.createContainer();

if (!container.has(ICacheService, true)) {
  console.warn('Cache service missing, falling back to noop implementation.');
}

const resolver = container.getResolver(ICacheService, false);
if (resolver) {
  // Override the resolver for the current container (useful in tests)
  container.registerResolver(
    ICacheService,
    new InstanceProvider('ICacheService', new FakeCacheService()),
    true
  );
}
```

- `container.has(key, searchAncestors)` lets you check whether a key exists locally or anywhere up the parent chain.
- `container.getResolver(key, /*autoRegister*/ false)` gives you the current resolver without triggering auto-registration, so you can inspect or replace it.
- `registerResolver` accepts any `IResolver` (including `InstanceProvider`) and an optional `isDisposable` flag to clean up automatically.

### How do I deregister a service?

```typescript
import { DI } from '@aurelia/kernel';

const container = DI.createContainer();

// Register
container.register(Registration.singleton(IService, Service));

// Later, deregister
container.deregister(IService);
```

**Warning**: Use sparingly - can cause issues if other services depend on it.

[Deregistering →](./overview.md#deregister-services)

---

## Testing

### How do I mock services for testing?

```typescript
import { DI, Registration } from '@aurelia/kernel';

// Create mock
const mockUserService = {
  getUsers: jasmine.createSpy('getUsers').and.returnValue(
    Promise.resolve([{ id: 1, name: 'Test User' }])
  ),
  createUser: jasmine.createSpy('createUser').and.returnValue(
    Promise.resolve({ id: 2, name: 'New User' })
  )
};

// Register mock in test container
const container = DI.createContainer();
container.register(
  Registration.instance(IUserService, mockUserService)
);

// Create component with mocked dependencies
const component = container.get(UserList);

// Verify interactions
await component.loadUsers();
expect(mockUserService.getUsers).toHaveBeenCalled();
```

### How do I test a service with dependencies?

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockHttp: jasmine.SpyObj<IHttpClient>;
  let mockLogger: jasmine.SpyObj<ILogger>;

  beforeEach(() => {
    // Create mocks
    mockHttp = jasmine.createSpyObj('IHttpClient', ['get', 'post']);
    mockLogger = jasmine.createSpyObj('ILogger', ['debug', 'error']);

    // Register mocks
    const container = DI.createContainer();
    container.register(
      Registration.instance(IHttpClient, mockHttp),
      Registration.instance(ILogger, mockLogger)
    );

    // Create service with mocked dependencies
    service = container.get(UserService);
  });

  it('should fetch users', async () => {
    mockHttp.get.and.returnValue(Promise.resolve([
      { id: 1, name: 'User 1' }
    ]));

    const users = await service.getUsers();

    expect(users.length).toBe(1);
    expect(mockHttp.get).toHaveBeenCalledWith('/api/users');
  });
});
```

[Testing patterns →](../../essentials/dependency-injection.md#testing-with-di)

---

## Common Patterns

### How do I create a configuration service?

```typescript
import { DI } from '@aurelia/kernel';

export interface AppConfig {
  apiUrl: string;
  environment: 'dev' | 'staging' | 'prod';
  features: {
    analytics: boolean;
    darkMode: boolean;
  };
}

export const IAppConfig = DI.createInterface<AppConfig>('IAppConfig');

// Register in main.ts
import { Registration } from '@aurelia/kernel';

Aurelia.register(
  Registration.instance(IAppConfig, {
    apiUrl: process.env.API_URL,
    environment: process.env.NODE_ENV,
    features: {
      analytics: true,
      darkMode: false
    }
  })
);
```

Use in services:
```typescript
import { resolve } from '@aurelia/kernel';

export class ApiClient {
  private config = resolve(IAppConfig);

  async get(path: string) {
    const url = `${this.config.apiUrl}${path}`;
    return fetch(url);
  }
}
```

### How do I create a service with initialization logic?

```typescript
import { DI, IContainer, resolve } from '@aurelia/kernel';

export class DatabaseService {
  private config = resolve(IAppConfig);
  private connection: Connection | null = null;

  async initialize() {
    this.connection = await createConnection({
      host: this.config.dbHost,
      database: this.config.dbName
    });
  }

  async query(sql: string) {
    if (!this.connection) {
      throw new Error('Database not initialized');
    }
    return this.connection.execute(sql);
  }
}

export const IDatabaseService = DI.createInterface<IDatabaseService>(
  'IDatabaseService',
  x => x.singleton(DatabaseService)
);

export type IDatabaseService = DatabaseService;
```

Initialize on app start:
```typescript
// In main.ts
const db = container.get(IDatabaseService);
await db.initialize();

Aurelia.app(MyApp).start();
```

### How do I implement the Service Locator pattern?

```typescript
import { DI, IContainer, resolve } from '@aurelia/kernel';

export class ServiceLocator {
  private container = resolve(IContainer);

  get<T>(key: any): T {
    return this.container.get(key);
  }

  getAll<T>(key: any): T[] {
    return this.container.getAll(key);
  }
}

export const IServiceLocator = DI.createInterface<IServiceLocator>(
  'IServiceLocator',
  x => x.singleton(ServiceLocator)
);

export type IServiceLocator = ServiceLocator;
```

**Note**: Prefer constructor/property injection over service locator for better testability.

### How do I create a plugin system?

```typescript
import { DI } from '@aurelia/kernel';

export interface IPlugin {
  name: string;
  initialize(): void | Promise<void>;
  shutdown(): void | Promise<void>;
}

export const IPlugin = DI.createInterface<IPlugin>('IPlugin');

// Create plugins
export class LoggingPlugin implements IPlugin {
  name = 'Logging';

  initialize() {
    console.log('Logging plugin initialized');
  }

  shutdown() {
    console.log('Logging plugin shutdown');
  }
}

export class AnalyticsPlugin implements IPlugin {
  name = 'Analytics';

  async initialize() {
    // Initialize analytics SDK
  }

  async shutdown() {
    // Flush analytics
  }
}

// Register all plugins
container.register(
  Registration.instance(IPlugin, new LoggingPlugin()),
  Registration.instance(IPlugin, new AnalyticsPlugin())
);

// Plugin manager
import { resolve, all } from '@aurelia/kernel';

export class PluginManager {
  private plugins = resolve(all(IPlugin));

  async initializeAll() {
    for (const plugin of this.plugins) {
      console.log(`Initializing ${plugin.name}...`);
      await plugin.initialize();
    }
  }

  async shutdownAll() {
    for (const plugin of this.plugins) {
      await plugin.shutdown();
    }
  }
}
```

---

## Troubleshooting

### Error: "Cannot resolve key"

**Problem**: DI container can't find a registration for your service.

**Solutions**:

1. **Forgot to create interface token**:
```typescript
// ✗ BAD: Using class directly without registration
export class UserService { }

// ✓ GOOD: Create interface token with auto-registration
export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService)
);
export type IUserService = UserService;
```

2. **Interface not imported/registered**:
```typescript
// Make sure the service module is imported somewhere
import './services/user-service';  // Triggers auto-registration
```

3. **Manual registration missing**:
```typescript
// In main.ts
import { UserService, IUserService } from './services/user-service';

Aurelia.register(
  Registration.singleton(IUserService, UserService)
);
```

### Error: "Cyclic dependency"

**Problem**: Service A depends on Service B, which depends on Service A.

**Solution 1 - Use lazy injection**:
```typescript
import { resolve, lazy } from '@aurelia/kernel';

export class ServiceA {
  private getServiceB = resolve(lazy(IServiceB));

  doSomething() {
    const serviceB = this.getServiceB();  // Breaks cycle
    serviceB.method();
  }
}
```

**Solution 2 - Refactor to break cycle**:
```typescript
// Extract shared logic to third service
export class SharedService {
  sharedMethod() { }
}

export class ServiceA {
  private shared = resolve(ISharedService);
}

export class ServiceB {
  private shared = resolve(ISharedService);
}
```

### resolve() returns undefined

**Problem**: Using `resolve()` outside of DI context.

**Solutions**:

1. **In components**: `resolve()` works anywhere
2. **In plain classes**: Must be injected or instantiated by DI
3. **In static methods**: Can't use `resolve()` - use injection

```typescript
// ✗ BAD: Static method can't resolve
export class Utils {
  static helper() {
    const service = resolve(IService);  // Won't work!
  }
}

// ✓ GOOD: Instance method
export class Utils {
  private service = resolve(IService);

  helper() {
    this.service.doSomething();
  }
}
```

### TypeScript errors with `resolve()`

**Problem**: Type inference not working with `resolve()`.

**Solution**: Explicitly specify type:
```typescript
// If inference fails
private service: IUserService = resolve(IUserService);

// Or use type assertion
private service = resolve<IUserService>(IUserService);
```

### Service isn't a singleton (getting different instances)

**Problem**: Service registered as transient or created with `new`.

**Solutions**:

1. **Check registration**:
```typescript
// ✓ Singleton
export const IService = DI.createInterface<IService>(
  'IService',
  x => x.singleton(Service)
);

// ✗ Transient (creates new instance each time)
export const IService = DI.createInterface<IService>(
  'IService',
  x => x.transient(Service)
);
```

2. **Don't create with `new`**:
```typescript
// ✗ BAD: Bypasses DI
const service = new Service();

// ✓ GOOD: Get from container
const service = resolve(IService);
```

### Constructor injection order mismatch

**Problem**: Parameters don't match `@inject` decorator order.

```typescript
// ✗ BAD: Order mismatch
@inject(IServiceB, IServiceA)
export class MyClass {
  constructor(
    private serviceA: IServiceA,  // Wrong! Gets ServiceB
    private serviceB: IServiceB   // Wrong! Gets ServiceA
  ) {}
}

// ✓ GOOD: Order matches
@inject(IServiceA, IServiceB)
export class MyClass {
  constructor(
    private serviceA: IServiceA,
    private serviceB: IServiceB
  ) {}
}

// ✓ BETTER: Use resolve() to avoid this issue
export class MyClass {
  private serviceA = resolve(IServiceA);
  private serviceB = resolve(IServiceB);
}
```

---

## Complete Documentation

- [DI Overview](./overview.md) - Comprehensive concepts guide
- [Creating Services](./creating-services.md) - Service creation patterns
- [Resolvers](./resolvers.md) - Advanced injection control
- [What is DI?](./what-is-dependency-injection.md) - DI fundamentals
- [DI Diagrams](./DIAGRAMS.md) - Visual architecture guide
- [Essentials Guide](../../essentials/dependency-injection.md) - Quick start guide
