# Advanced DI Patterns & Recipes

Aurelia's dependency injection system is powerful yet lightweight. This guide explores advanced patterns verified against the framework's codebase, showing you how to leverage DI for sophisticated application architecture.

## Prerequisites

Before diving into advanced patterns, ensure you're familiar with:
- [Dependency Injection basics](../getting-to-know-aurelia/dependency-injection.md)
- [Creating services](../getting-to-know-aurelia/dependency-injection-di/creating-services.md)
- [Resolvers](../getting-to-know-aurelia/dependency-injection-di/resolvers.md)
- Using `resolve()` from `@aurelia/kernel`

## Table of Contents

1. [Interface-Based DI](#interface-based-di)
2. [Registration Patterns](#registration-patterns)
3. [Resolver Patterns](#resolver-patterns)
4. [Factory Patterns](#factory-patterns)
5. [Child Containers & Scoping](#child-containers--scoping)
6. [Transformers](#transformers)
7. [Real-World Recipes](#real-world-recipes)

## Interface-Based DI

### Creating Interfaces with DI.createInterface

Interfaces allow you to inject by contract rather than concrete implementation, enabling better testability and flexibility.

```typescript
import { DI } from '@aurelia/kernel';

// Define the contract
export interface ILogger {
  info(message: string): void;
  error(message: string, error?: Error): void;
}

// Create the injectable interface
export const ILogger = DI.createInterface<ILogger>('ILogger');
```

### Default Registration

Provide a default implementation directly in the interface:

```typescript
export class ConsoleLogger implements ILogger {
  info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }
}

// Interface with default singleton registration
export const ILogger = DI.createInterface<ILogger>(
  'ILogger',
  x => x.singleton(ConsoleLogger)
);
```

Now any component can inject `ILogger` without explicit registration:

```typescript
import { resolve } from '@aurelia/kernel';
import { ILogger } from './services/logger';

export class UserService {
  private logger = resolve(ILogger); // Automatically gets ConsoleLogger

  async createUser(name: string) {
    this.logger.info(`Creating user: ${name}`);
    // ...
  }
}
```

### Override Default Implementation

Replace the default when needed:

```typescript
import { Registration } from '@aurelia/kernel';

export class FileLogger implements ILogger {
  info(message: string): void {
    // Write to file...
  }

  error(message: string, error?: Error): void {
    // Write to file...
  }
}

// In main.ts
Aurelia
  .register(
    Registration.singleton(ILogger, FileLogger) // Override default
  )
  .app(component)
  .start();
```

### Real Example: Fetch Function Interface

From `@aurelia/fetch-client`:

```typescript
export const IFetchFn = DI.createInterface<typeof fetch>('fetch', x => {
  if (typeof fetch !== 'function') {
    throw new Error('fetch function not found');
  }
  return x.instance(fetch); // Register global fetch as default
});

// Usage in HttpClient
export class HttpClient {
  private readonly fetchFn = resolve(IFetchFn);

  async request(url: string, options?: RequestInit) {
    const response = await this.fetchFn(url, options);
    return response;
  }
}
```

### Aliasing Interfaces

```typescript
export const IHttpClient = DI.createInterface<IHttpClient>(
  'IHttpClient',
  x => x.aliasTo(HttpClient) // Resolve to HttpClient class
);
```

## Registration Patterns

Aurelia provides several registration helpers for different lifecycle needs.

### Registration.instance

Register a pre-created instance:

```typescript
import { Registration } from '@aurelia/kernel';

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};

// Register the exact instance
container.register(
  Registration.instance('AppConfig', config)
);

// Usage
export class ApiClient {
  private config = resolve('AppConfig');

  async fetch(endpoint: string) {
    const url = `${this.config.apiUrl}${endpoint}`;
    // ...
  }
}
```

### Registration.singleton

Create and cache one instance per container:

```typescript
export class DatabaseConnection {
  private connection: any;

  async connect() {
    this.connection = await openConnection();
  }
}

container.register(
  Registration.singleton(DatabaseConnection, DatabaseConnection)
);
```

### Registration.transient

Create a new instance on every resolution:

```typescript
export class RequestContext {
  readonly id = crypto.randomUUID();
  readonly timestamp = Date.now();
}

container.register(
  Registration.transient(RequestContext, RequestContext)
);

// Each resolution gets a new instance
const ctx1 = container.get(RequestContext); // New instance
const ctx2 = container.get(RequestContext); // Different instance
```

### Registration.callback

Execute a function each time the key is resolved:

```typescript
import { Registration } from '@aurelia/kernel';

// Random number generator
container.register(
  Registration.callback('random', () => Math.random())
);

// Dynamic service creation
container.register(
  Registration.callback('timestamp', () => Date.now())
);

// Access container in callback
container.register(
  Registration.callback('logger', (c: IContainer) => {
    const config = c.get('AppConfig');
    return config.debug ? new VerboseLogger() : new QuietLogger();
  })
);
```

### Registration.cachedCallback

Execute callback once, then cache the result:

```typescript
import { Registration } from '@aurelia/kernel';

let initCount = 0;

container.register(
  Registration.cachedCallback('expensive', () => {
    initCount++;
    return performExpensiveComputation();
  })
);

container.get('expensive'); // Runs computation, initCount = 1
container.get('expensive'); // Returns cached result, initCount still 1
container.get('expensive'); // Returns cached result, initCount still 1
```

**Real-world example from `@aurelia/router`:**

```typescript
export const IBaseHref = DI.createInterface<URL>('IBaseHref');

// In configuration
Registration.cachedCallback(IBaseHref, (handler) => {
  const baseElement = document.querySelector('base');
  const href = baseElement?.getAttribute('href') ?? '/';
  return new URL(href, window.location.origin);
})
```

### Registration.aliasTo

Create multiple keys that resolve to the same instance:

```typescript
export class UserRepository {
  // ...
}

container.register(
  Registration.singleton(UserRepository, UserRepository),
  Registration.aliasTo(UserRepository, 'IUserRepo'),
  Registration.aliasTo(UserRepository, 'UserStore')
);

// All resolve to the same singleton instance
const repo1 = container.get(UserRepository);
const repo2 = container.get('IUserRepo');
const repo3 = container.get('UserStore');
// repo1 === repo2 === repo3 → true
```

## Resolver Patterns

Resolvers modify how dependencies are injected, enabling advanced patterns.

### lazy: Deferred Resolution

Inject a function that resolves the dependency when called:

```typescript
import { lazy, resolve } from '@aurelia/kernel';

export class FeatureToggle {
  // Expensive service only created if feature is enabled
  private getAnalytics = resolve(lazy(IAnalyticsService));

  trackEvent(name: string) {
    if (this.isEnabled('analytics')) {
      const analytics = this.getAnalytics(); // Resolved now
      analytics.track(name);
    }
  }
}
```

**Type-safe usage:**

```typescript
import { ILazyResolver } from '@aurelia/kernel';

export class LazyExample {
  // Explicitly typed lazy resolver
  private getService = resolve<ILazyResolver<IMyService>>(lazy(IMyService));

  doSomething() {
    const service = this.getService(); // Returns IMyService
    service.execute();
  }
}
```

### optional: Graceful Fallbacks

Inject `undefined` if dependency not registered:

```typescript
import { optional, resolve } from '@aurelia/kernel';

export class OptionalFeatures {
  // May not be registered in all environments
  private metrics = resolve(optional(IMetricsService));

  recordMetric(name: string, value: number) {
    // Safe to check for undefined
    if (this.metrics) {
      this.metrics.record(name, value);
    }
  }
}
```

### all: Collect All Registrations

Resolve all registered instances of a key:

```typescript
import { all, resolve } from '@aurelia/kernel';

export interface IPlugin {
  initialize(): void;
}

export const IPlugin = DI.createInterface<IPlugin>('IPlugin');

// Register multiple plugins
container.register(
  Registration.singleton(IPlugin, AuthPlugin),
  Registration.singleton(IPlugin, LoggingPlugin),
  Registration.singleton(IPlugin, CachePlugin)
);

export class PluginManager {
  private plugins = resolve(all(IPlugin)); // Array of all plugins

  initializeAll() {
    this.plugins.forEach(plugin => plugin.initialize());
  }
}
```

**With searchAncestors:**

```typescript
// Search parent containers too
private allLoggers = resolve(all(ILogger, true));
```

### factory: Dynamic Instance Creation

Inject a factory function that creates new instances:

```typescript
import { factory, resolve } from '@aurelia/kernel';

export class CommandProcessor {
  // Factory for creating command instances
  private createCommand = resolve(factory(Command));

  execute(type: string, ...args: unknown[]) {
    // Create new instance with dynamic dependencies
    const command = this.createCommand(type, ...args);
    return command.run();
  }
}
```

**Type-safe factory:**

```typescript
import { IFactoryResolver } from '@aurelia/kernel';

export class TaskRunner {
  private createTask = resolve<IFactoryResolver<ITask>>(factory(ITask));

  runTask(data: TaskData) {
    // createTask returns ITask instances
    const task = this.createTask(data);
    return task.execute();
  }
}
```

**Real example from `@aurelia/fetch-client`:**

```typescript
export class HttpClient {
  private readonly createConfiguration = resolve(factory(HttpClientConfiguration));

  configure(configFn: (config: HttpClientConfiguration) => void) {
    // Create fresh configuration instance
    const config = this.createConfiguration();
    configFn(config);
    return this;
  }
}
```

### newInstanceOf: Always New Instance

Create a new instance every time, ignoring registration lifecycle:

```typescript
import { newInstanceOf, resolve } from '@aurelia/kernel';

export class RequestHandler {
  // Always get a fresh context, even if registered as singleton
  private context = resolve(newInstanceOf(RequestContext));

  handle(request: Request) {
    // Each resolution gets a new RequestContext
    console.log(this.context.id); // Unique each time
  }
}
```

### newInstanceForScope: Scoped Instances

Create one instance per requesting container and register it there:

```typescript
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationController } from '@aurelia/validation';

export class UserForm {
  // Each component gets its own validation controller
  // Registered in component's scope
  private validation = resolve(newInstanceForScope(IValidationController));

  async submit() {
    const result = await this.validation.validate();
    if (result.valid) {
      // ...
    }
  }
}
```

**Why use newInstanceForScope?**
- Validation controllers are scoped to components
- Each form gets its own controller
- Child components can inject the same controller
- Automatic cleanup when component is disposed

```typescript
// Real example from Aurelia's e2e tests
export class EditView {
  private validationController = resolve(newInstanceForScope(IValidationController));

  // Child components can also access this controller
}
```

### own: Container-Local Resolution

Only resolve if the dependency is registered in the requesting container (not ancestors):

```typescript
import { own, resolve } from '@aurelia/kernel';

export class ScopedService {
  // Only resolve if registered in this exact container
  private localConfig = resolve(own('LocalConfig'));

  // Returns undefined if not in this container
}
```

### resource & optionalResource: Smart Resolution

Resolve from requestor or root, skipping intermediate containers:

```typescript
import { resource, optionalResource, resolve } from '@aurelia/kernel';

export class ComponentBase {
  // Check requestor first, fallback to root, skip middle layers
  private theme = resolve(resource(ITheme));

  // Optional variant
  private customTheme = resolve(optionalResource(ICustomTheme));
}
```

## Factory Patterns

### Service Factory Pattern

Create services dynamically based on configuration:

```typescript
import { DI, IContainer, Registration } from '@aurelia/kernel';

export interface IDataService {
  fetchData(): Promise<any[]>;
}

export const IDataService = DI.createInterface<IDataService>('IDataService');

export class RestDataService implements IDataService {
  async fetchData() {
    // REST API implementation
  }
}

export class GraphQLDataService implements IDataService {
  async fetchData() {
    // GraphQL implementation
  }
}

// Factory function
export const createDataService = (type: 'rest' | 'graphql'): IDataService => {
  return type === 'rest' ? new RestDataService() : new GraphQLDataService();
};

// Register factory
container.register(
  Registration.callback(IDataService, (c: IContainer) => {
    const config = c.get('ApiConfig');
    return createDataService(config.type);
  })
);
```

### Plugin Factory Pattern

Dynamically register and create plugins:

```typescript
export interface IPluginFactory {
  create(name: string, options: unknown): IPlugin;
  register(name: string, pluginClass: Constructable<IPlugin>): void;
}

export const IPluginFactory = DI.createInterface<IPluginFactory>('IPluginFactory');

export class PluginFactory implements IPluginFactory {
  private registry = new Map<string, Constructable<IPlugin>>();
  private container = resolve(IContainer);

  register(name: string, pluginClass: Constructable<IPlugin>): void {
    this.registry.set(name, pluginClass);
  }

  create(name: string, options: unknown): IPlugin {
    const PluginClass = this.registry.get(name);
    if (!PluginClass) {
      throw new Error(`Plugin not found: ${name}`);
    }

    // Use container to construct with DI
    const plugin = this.container.invoke(PluginClass);
    if (typeof (plugin as any).configure === 'function') {
      (plugin as any).configure(options);
    }
    return plugin;
  }
}
```

## Child Containers & Scoping

Child containers enable hierarchical dependency scoping—perfect for features, routes, or components with isolated dependencies.

### Creating Child Containers

```typescript
import { DI } from '@aurelia/kernel';

const rootContainer = DI.createContainer();

// Register global services
rootContainer.register(
  Registration.singleton(ILogger, ConsoleLogger)
);

// Create child with isolated scope
const childContainer = rootContainer.createChild();

// Override in child
childContainer.register(
  Registration.singleton(ILogger, FileLogger)
);

// Child uses FileLogger, root still uses ConsoleLogger
const childLogger = childContainer.get(ILogger); // FileLogger
const rootLogger = rootContainer.get(ILogger);   // ConsoleLogger
```

### Inherit Parent Resources

```typescript
const childContainer = parentContainer.createChild({
  inheritParentResources: true
});
```

**Real example from `@aurelia/router`:**

```typescript
export class RouteContext {
  constructor(parentContainer: IContainer) {
    // Create isolated container for this route
    const container = this.container = parentContainer.createChild();

    // Register route-specific services
    container.register(
      Registration.instance(IRouteContext, this)
    );
  }
}
```

### Scoped Service Pattern

```typescript
export interface IRequestScope {
  requestId: string;
  user: User | null;
}

export const IRequestScope = DI.createInterface<IRequestScope>('IRequestScope');

export class RequestHandler {
  handleRequest(request: Request) {
    // Create request-scoped container
    const requestContainer = this.rootContainer.createChild();

    // Register request-specific data
    requestContainer.register(
      Registration.instance(IRequestScope, {
        requestId: crypto.randomUUID(),
        user: request.user
      })
    );

    // Process with scoped container
    const processor = requestContainer.get(RequestProcessor);
    return processor.process(request);
  }
}

export class RequestProcessor {
  private scope = resolve(IRequestScope); // Gets request-specific data

  process(request: Request) {
    console.log(`Processing request ${this.scope.requestId}`);
    // Access this.scope.user, etc.
  }
}
```

### Feature Module Pattern

```typescript
export class FeatureModule {
  static register(container: IContainer) {
    // Create feature-scoped container
    const featureContainer = container.createChild();

    // Register feature-specific services
    featureContainer.register(
      Registration.singleton(IFeatureService, FeatureService),
      Registration.singleton(IFeatureRepository, FeatureRepository)
    );

    return featureContainer;
  }
}

// Usage
const featureContainer = FeatureModule.register(rootContainer);
const service = featureContainer.get(IFeatureService);
```

## Transformers

Transformers modify instances after construction—useful for decoration, proxying, or post-processing.

### Registering Transformers

```typescript
import { DI, Registration } from '@aurelia/kernel';

export class UserService {
  getUser(id: string) {
    return { id, name: 'John' };
  }
}

const container = DI.createContainer();
container.register(Registration.singleton(UserService, UserService));

// Add transformer
container.registerTransformer(UserService, (instance) => {
  // Wrap in logging proxy
  return new Proxy(instance, {
    get(target, prop) {
      const value = target[prop];
      if (typeof value === 'function') {
        return function(...args: unknown[]) {
          console.log(`Calling ${String(prop)}`, args);
          const result = value.apply(target, args);
          console.log(`Result:`, result);
          return result;
        };
      }
      return value;
    }
  });
});

const service = container.get(UserService);
service.getUser('123'); // Logs: "Calling getUser", "Result: ..."
```

### Multiple Transformers

Transformers execute in registration order:

```typescript
container.registerTransformer(UserService, (instance) => {
  console.log('Transform 1');
  return instance;
});

container.registerTransformer(UserService, (instance) => {
  console.log('Transform 2');
  return instance;
});

container.get(UserService);
// Output:
// Transform 1
// Transform 2
```

### Real-World: Adding Lifecycle Hooks

```typescript
interface IDisposable {
  dispose(): void;
}

function addDisposable<T>(instance: T): T & IDisposable {
  const disposables: Array<() => void> = [];

  return Object.assign(instance, {
    onDispose(fn: () => void) {
      disposables.push(fn);
    },
    dispose() {
      disposables.forEach(fn => fn());
      disposables.length = 0;
    }
  });
}

container.registerTransformer(DatabaseConnection, addDisposable);

const db = container.get(DatabaseConnection);
db.onDispose(() => console.log('Closing connection'));
db.dispose(); // Logs: "Closing connection"
```

## Real-World Recipes

### Recipe 1: Multi-Tenant Application

```typescript
export interface ITenant {
  id: string;
  name: string;
  config: TenantConfig;
}

export const ITenant = DI.createInterface<ITenant>('ITenant');

export class TenantResolver {
  private rootContainer = resolve(IContainer);

  resolveForRequest(request: Request): IContainer {
    const tenantId = this.extractTenantId(request);
    const tenant = this.loadTenant(tenantId);

    // Create tenant-scoped container
    const tenantContainer = this.rootContainer.createChild();

    tenantContainer.register(
      Registration.instance(ITenant, tenant),
      Registration.singleton(ITenantDatabase, TenantDatabase),
      Registration.callback('DbConnection', () => {
        return createConnection(tenant.config.database);
      })
    );

    return tenantContainer;
  }

  private extractTenantId(request: Request): string {
    // From subdomain, header, etc.
    return request.headers.get('X-Tenant-ID') ?? 'default';
  }

  private loadTenant(id: string): ITenant {
    // Load from database
    return {
      id,
      name: `Tenant ${id}`,
      config: { database: `tenant_${id}_db` }
    };
  }
}
```

### Recipe 2: Environment-Based Configuration

```typescript
type Environment = 'development' | 'staging' | 'production';

export interface IApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export const IApiConfig = DI.createInterface<IApiConfig>('IApiConfig');

const configs: Record<Environment, IApiConfig> = {
  development: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
    retries: 1
  },
  staging: {
    baseUrl: 'https://staging-api.example.com',
    timeout: 5000,
    retries: 2
  },
  production: {
    baseUrl: 'https://api.example.com',
    timeout: 3000,
    retries: 3
  }
};

// Register based on environment
const env = (process.env.NODE_ENV as Environment) ?? 'development';
container.register(
  Registration.instance(IApiConfig, configs[env])
);
```

### Recipe 3: Plugin System with DI

```typescript
export interface IPlugin {
  name: string;
  initialize(container: IContainer): void;
  shutdown?(): void;
}

export const IPlugin = DI.createInterface<IPlugin>('IPlugin');

export class PluginManager {
  private plugins = resolve(all(IPlugin));
  private container = resolve(IContainer);
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    for (const plugin of this.plugins) {
      console.log(`Initializing plugin: ${plugin.name}`);
      plugin.initialize(this.container);
    }

    this.initialized = true;
  }

  async shutdown() {
    for (const plugin of this.plugins.reverse()) {
      if (plugin.shutdown) {
        console.log(`Shutting down plugin: ${plugin.name}`);
        await plugin.shutdown();
      }
    }
  }
}

// Example plugins
export class AuthPlugin implements IPlugin {
  name = 'auth';

  initialize(container: IContainer) {
    container.register(
      Registration.singleton(IAuthService, AuthService)
    );
  }
}

export class CachePlugin implements IPlugin {
  name = 'cache';
  private cache?: CacheService;

  initialize(container: IContainer) {
    this.cache = new CacheService();
    container.register(
      Registration.instance(ICacheService, this.cache)
    );
  }

  shutdown() {
    this.cache?.clear();
  }
}

// Register plugins
container.register(
  Registration.singleton(IPlugin, AuthPlugin),
  Registration.singleton(IPlugin, CachePlugin),
  Registration.singleton(PluginManager, PluginManager)
);

// Initialize
const pm = container.get(PluginManager);
await pm.initialize();
```

### Recipe 4: Decorator Pattern with Transformers

```typescript
export interface INotificationService {
  send(message: string): Promise<void>;
}

export class NotificationService implements INotificationService {
  async send(message: string) {
    console.log(`Sending: ${message}`);
    // Send notification
  }
}

// Add retry logic via transformer
container.register(Registration.singleton(INotificationService, NotificationService));

container.registerTransformer(INotificationService, (service) => {
  return new Proxy(service, {
    get(target, prop) {
      if (prop === 'send') {
        return async (message: string) => {
          let attempts = 0;
          const maxAttempts = 3;

          while (attempts < maxAttempts) {
            try {
              return await target.send(message);
            } catch (error) {
              attempts++;
              if (attempts >= maxAttempts) throw error;
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
          }
        };
      }
      return target[prop];
    }
  });
});
```

### Recipe 5: Context-Aware Services

```typescript
export interface IUserContext {
  userId: string;
  permissions: string[];
}

export const IUserContext = DI.createInterface<IUserContext>('IUserContext');

export class PermissionGuard {
  private userContext = resolve(optional(IUserContext));

  canAccess(resource: string): boolean {
    if (!this.userContext) {
      return false; // No context = no access
    }

    return this.userContext.permissions.includes(resource);
  }
}

// In route handler
export class SecureRoute {
  private rootContainer = resolve(IContainer);

  async handle(request: Request) {
    const user = await this.authenticate(request);

    // Create request-scoped container with user context
    const requestContainer = this.rootContainer.createChild();

    requestContainer.register(
      Registration.instance(IUserContext, {
        userId: user.id,
        permissions: user.permissions
      })
    );

    // Process with user context available
    const controller = requestContainer.get(Controller);
    return controller.execute();
  }
}
```

## Best Practices

1. **Prefer Interfaces**: Use `DI.createInterface` for public contracts
2. **Use Appropriate Lifecycles**: Singleton for stateless, transient for stateful
3. **Leverage Child Containers**: Isolate feature/route dependencies
4. **Type Your Resolvers**: Use `resolve<IFactoryResolver<T>>` for type safety
5. **Document Resolvers**: Explain why you're using lazy, optional, etc.
6. **Clean Up**: Dispose child containers when features unmount
7. **Test with Mocks**: Use `Registration.instance` to inject test doubles
8. **Avoid Service Locator**: Prefer constructor injection via `resolve()`

## Common Pitfalls

### Pitfall 1: Circular Dependencies

```typescript
// BAD: Circular dependency
export class ServiceA {
  private b = resolve(ServiceB);
}

export class ServiceB {
  private a = resolve(ServiceA); // Circular!
}

// GOOD: Use lazy resolver
export class ServiceB {
  private getA = resolve(lazy(ServiceA));

  doSomething() {
    const a = this.getA(); // Resolved on-demand
    // ...
  }
}
```

### Pitfall 2: Forgetting Child Container Disposal

```typescript
// BAD: Memory leak
const childContainer = parent.createChild();
const service = childContainer.get(ExpensiveService);
// Container never disposed, service held in memory

// GOOD: Dispose when done
const childContainer = parent.createChild();
try {
  const service = childContainer.get(ExpensiveService);
  // Use service
} finally {
  childContainer.dispose();
}
```

### Pitfall 3: Over-using Transformers

Transformers run on every resolution. Don't use them for expensive operations that should run once:

```typescript
// BAD: Expensive operation runs every time
container.registerTransformer(Service, (instance) => {
  performExpensiveSetup(instance); // Runs on every get()
  return instance;
});

// GOOD: Use cachedCallback or singleton setup
export class Service {
  private setupDone = false;

  async ensureSetup() {
    if (!this.setupDone) {
      await this.performSetup();
      this.setupDone = true;
    }
  }
}
```

## Conclusion

Aurelia's DI system provides powerful primitives for building scalable, maintainable applications. By mastering interfaces, registration patterns, resolvers, and child containers, you can architect sophisticated dependency graphs that remain testable and flexible.

Key takeaways:
- Use interfaces for flexibility and testing
- Choose the right registration lifecycle
- Leverage resolvers for advanced scenarios
- Scope dependencies with child containers
- Apply transformers judiciously

For more information:
- [DI Fundamentals](../getting-to-know-aurelia/dependency-injection.md)
- [Creating Services](../getting-to-know-aurelia/dependency-injection-di/creating-services.md)
- [Resolvers Reference](../getting-to-know-aurelia/dependency-injection-di/resolvers.md)
