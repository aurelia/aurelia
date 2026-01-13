# How to Mock, Stub, and Spy on DI Dependencies

Testing in Aurelia often involves testing components that have dependencies injected into them. Using dependency injection (DI) simplifies the process of replacing these dependencies with mocks, stubs, or spies during testing. This can be particularly useful when you need to isolate the component under test from external concerns like API calls or complex logic.

## Understanding Mocks, Stubs, and Spies

- **Mocks** are objects that replace real implementations with fake methods and properties that you define. They are useful for simulating complex behavior without relying on the actual implementation.
- **Stubs** are like mocks but typically focus on replacing specific methods or properties rather than entire objects. They are useful when you want to control the behavior of a dependency for a particular test case.
- **Spies** allow you to wrap existing methods so that you can record information about their calls, such as the number of times they were called or the arguments they received.

## Using Sinon for Mocking, Stubbing, and Spying

Sinon is a popular library for creating mocks, stubs, and spies in JavaScript tests. It provides a rich API for controlling your test environment and can significantly simplify the process of testing components with dependencies.

### Installing Sinon

To make use of Sinon in your Aurelia project, you need to install it along with its type definitions for TypeScript support:

```shell
npm install sinon @types/sinon -D
```

{% hint style="warning" %}
If you are not using TypeScript, you can omit the `@types/sinon`.
{% endhint %}

### Using Sinon in Your Tests

After installing Sinon, import it in your test files to access its functionality. Let's look at how to apply Sinon to mock, stub, and spy on dependencies in Aurelia components.

{% code title="my-component.ts" %}
```typescript
import { IRouter } from '@aurelia/router';
import { customElement, resolve } from 'aurelia';

@customElement('my-component')
export class MyComponent {
    constructor(private router: IRouter = resolve(IRouter)) {}

    navigate(path: string) {
        return this.router.load(path);
    }
}
```
{% endcode %}

In this example, the `MyComponent` class has a dependency on `IRouter` and a method `navigate` that delegates to the router's `load` method.

### Stubbing Individual Methods

To stub the `load` method of the router, use Sinon's `stub` method:

```typescript
import { createFixture } from '@aurelia/testing';
import { MyComponent } from './my-component';
import { IRouter } from '@aurelia/router';
import sinon from 'sinon';

describe('MyComponent', () => {
    it('should stub the load method of the router', async () => {
        const { startPromise, component, container, stop } = createFixture(
            `<my-component></my-component>`,
            class App {},
            [MyComponent]
        );

        await startPromise;

        // Get the router instance from the container
        const router = container.get(IRouter);
        const stub = sinon.stub(router, 'load').returnsArg(0);

        // Test the component method that uses the router
        expect(component.navigate('nowhere')).toBe('nowhere');

        // Always restore stubs and clean up
        stub.restore();
        await stop(true);
    });
});
```

### Mocking an Entire Dependency

When you need to replace the entire dependency, create a mock object and register it in place of the real one:

```typescript
import { createFixture } from '@aurelia/testing';
import { Registration } from '@aurelia/kernel';
import { MyComponent } from './my-component';
import { IRouter } from '@aurelia/router';

const mockRouter = {
    load(path: string) {
        return path;
    }
};

describe('MyComponent', () => {
    it('should use a mock router', async () => {
        const { startPromise, component, stop } = createFixture(
            `<my-component></my-component>`,
            class App {},
            [MyComponent],
            [Registration.instance(IRouter, mockRouter)]
        );

        await startPromise;

        expect(component.navigate('nowhere')).toBe('nowhere');

        await stop(true);
    });
});
```

By using `Registration.instance`, we can ensure that any part of the application being tested will receive our mock implementation when asking for the `IRouter` dependency.

### Spying on Methods

To observe and assert the behavior of methods, use Sinon's spies:

{% code title="magic-button.ts" %}
```typescript
import { customElement } from 'aurelia';

@customElement('magic-button')
export class MagicButton {
    callbackFunction(event: Event, id: number) {
        return this.save(event, id);
    }

    save(event: Event, id: number) {
        // Pretend to call an API or perform some action...
        return `${id}__special`;
    }
}
```
{% endcode %}

To test that the `save` method is called correctly, wrap it with a spy:

{% code title="magic-button.spec.ts" %}
```typescript
import { createFixture } from '@aurelia/testing';
import { MagicButton } from './magic-button';
import sinon from 'sinon';

describe('MagicButton', () => {
    it('calls save when callbackFunction is invoked', async () => {
        const { startPromise, component, stop } = createFixture(
            `<magic-button></magic-button>`,
            class App {},
            [MagicButton]
        );

        await startPromise;

        const spy = sinon.spy(component, 'save');
        const testEvent = new Event('click');
        component.callbackFunction(testEvent, 123);

        expect(spy.calledOnceWithExactly(testEvent, 123)).toBeTruthy();

        spy.restore();
        await stop(true);
    });
});
```
{% endcode %}

## Mocking Dependencies Directly in the Constructor

Unit tests may require you to instantiate classes manually rather than using Aurelia's `createFixture`. In such cases, you can mock dependencies directly in the constructor:

{% code title="my-component.spec.ts" %}
```typescript
import { MyComponent } from './my-component';
import { IRouter } from '@aurelia/router';

describe('MyComponent', () => {
    const mockRouter: IRouter = {
        load(path: string) {
            return path;
        }
        // ... other methods and properties
    };

    it('should navigate using the mock router', () => {
        const component = new MyComponent(mockRouter);

        expect(component.navigate('somewhere')).toBe('somewhere');
    });
});
```
{% endcode %}

In this test, we directly provide a mock router object when creating an instance of `MyComponent`. This technique is useful for more traditional unit testing where you want to test methods in isolation.

## Conclusion

Mocking, stubbing, and spying are powerful techniques that can help you write more effective and isolated tests for your Aurelia components. By leveraging tools like Sinon and Aurelia's dependency injection system, you can create test environments that are both flexible and easy to control. Whether you're writing unit tests or integration tests, these methods will enable you to test your components' behavior accurately and with confidence.

## Comprehensive Dependency Injection Mocking

### Testing Components with `@inject` Decorator

Modern Aurelia 2 supports both constructor injection and the `resolve()` function. Here's how to test both patterns:

```typescript
import { inject, resolve } from 'aurelia';
import { ILogger, IHttpClient } from '@aurelia/fetch-client';

// Component using @inject decorator (traditional pattern)
@inject(ILogger, IHttpClient)
export class UserService {
  constructor(
    private logger: ILogger,
    private http: IHttpClient
  ) {}

  async getUser(id: number) {
    this.logger.info(`Fetching user ${id}`);
    return this.http.fetch(`/api/users/${id}`);
  }
}

// Component using resolve() function (modern pattern)
export class ProfileComponent {
  private userService = resolve(UserService);
  private logger = resolve(ILogger);

  async loadProfile(userId: number) {
    this.logger.debug('Loading profile');
    return this.userService.getUser(userId);
  }
}
```

**Testing the @inject pattern:**

```typescript
describe('UserService with @inject', () => {
  it('uses injected dependencies correctly', async () => {
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    };
    
    const mockHttpClient = {
      fetch: jest.fn().mockResolvedValue({ id: 1, name: 'John' })
    };

    const { component, startPromise, stop } = createFixture(
      '<user-display></user-display>',
      class App {},
      [UserService, UserDisplayComponent],
      [
        Registration.instance(ILogger, mockLogger),
        Registration.instance(IHttpClient, mockHttpClient)
      ]
    );

    await startPromise;
    
    const result = await component.userService.getUser(1);
    
    expect(mockLogger.info).toHaveBeenCalledWith('Fetching user 1');
    expect(mockHttpClient.fetch).toHaveBeenCalledWith('/api/users/1');
    expect(result).toEqual({ id: 1, name: 'John' });
    
    await stop(true);
  });
});
```

**Testing the resolve() pattern:**

```typescript
describe('ProfileComponent with resolve()', () => {
  it('resolves dependencies correctly', async () => {
    const mockUserService = {
      getUser: jest.fn().mockResolvedValue({ id: 1, name: 'John' })
    };
    
    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<profile-component></profile-component>',
      class App {},
      [ProfileComponent],
      [
        Registration.instance(UserService, mockUserService),
        Registration.instance(ILogger, mockLogger)
      ]
    );

    await startPromise;
    
    await component.loadProfile(1);
    
    expect(mockLogger.debug).toHaveBeenCalledWith('Loading profile');
    expect(mockUserService.getUser).toHaveBeenCalledWith(1);
    
    await stop(true);
  });
});
```

### Testing Interface-Based Dependency Injection

When using interface tokens (the recommended Aurelia 2 pattern):

```typescript
import { DI } from '@aurelia/kernel';

// Define interface and token
export interface IDataService {
  fetchData(id: string): Promise<any>;
  saveData(data: any): Promise<void>;
}

export const IDataService = DI.createInterface<IDataService>('IDataService', x => x.singleton(DataServiceImpl));

// Implementation
export class DataServiceImpl implements IDataService {
  async fetchData(id: string) {
    // real implementation
  }
  
  async saveData(data: any) {
    // real implementation
  }
}

// Component using the interface
export class DataComponent {
  private dataService = resolve(IDataService);

  async load(id: string) {
    return this.dataService.fetchData(id);
  }
}
```

**Testing interface-based injection:**

```typescript
describe('Interface-based DI testing', () => {
  it('mocks interface implementations', async () => {
    // Create a complete mock implementing the interface
    const mockDataService: IDataService = {
      fetchData: jest.fn().mockResolvedValue({ id: '1', data: 'test' }),
      saveData: jest.fn().mockResolvedValue(undefined)
    };

    const { component, startPromise, stop } = createFixture(
      '<data-component></data-component>',
      class App {},
      [DataComponent],
      [Registration.instance(IDataService, mockDataService)]
    );

    await startPromise;
    
    const result = await component.load('1');
    
    expect(mockDataService.fetchData).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', data: 'test' });
    
    await stop(true);
  });
});
```

### Testing Optional Dependencies

For services with optional dependencies:

```typescript
import { optional } from 'aurelia';

export class OptionalDependencyComponent {
  private cacheService = resolve(optional(ICacheService));
  private logger = resolve(ILogger);

  async loadData(key: string) {
    let data = null;
    
    // Use cache if available
    if (this.cacheService) {
      data = await this.cacheService.get(key);
      this.logger.info('Data loaded from cache');
    }
    
    if (!data) {
      data = await this.fetchFromApi(key);
      this.logger.info('Data loaded from API');
    }
    
    return data;
  }
}
```

**Testing with optional dependency present:**

```typescript
describe('Optional dependencies', () => {
  it('uses cache when available', async () => {
    const mockCacheService = {
      get: jest.fn().mockResolvedValue({ cached: true }),
      set: jest.fn()
    };
    
    const mockLogger = {
      info: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<optional-dependency-component></optional-dependency-component>',
      class App {},
      [OptionalDependencyComponent],
      [
        Registration.instance(ICacheService, mockCacheService),
        Registration.instance(ILogger, mockLogger)
      ]
    );

    await startPromise;
    
    const result = await component.loadData('test-key');
    
    expect(mockCacheService.get).toHaveBeenCalledWith('test-key');
    expect(mockLogger.info).toHaveBeenCalledWith('Data loaded from cache');
    expect(result).toEqual({ cached: true });
    
    await stop(true);
  });

  it('falls back when cache unavailable', async () => {
    const mockLogger = {
      info: jest.fn()
    };

    // Don't register ICacheService - it will be undefined
    const { component, startPromise, stop } = createFixture(
      '<optional-dependency-component></optional-dependency-component>',
      class App {},
      [OptionalDependencyComponent],
      [Registration.instance(ILogger, mockLogger)]
    );

    await startPromise;
    
    // Mock the fetchFromApi method
    jest.spyOn(component, 'fetchFromApi').mockResolvedValue({ fromApi: true });
    
    const result = await component.loadData('test-key');
    
    expect(component.fetchFromApi).toHaveBeenCalledWith('test-key');
    expect(mockLogger.info).toHaveBeenCalledWith('Data loaded from API');
    expect(result).toEqual({ fromApi: true });
    
    await stop(true);
  });
});
```

### Testing Service Dependency Chains

When Service A depends on Service B which depends on Service C:

```typescript
// Service C (leaf dependency)
export class DatabaseService {
  async query(sql: string) {
    // database implementation
  }
}

// Service B (middle dependency)
export class RepositoryService {
  private db = resolve(DatabaseService);

  async findUser(id: number) {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// Service A (top-level dependency)
export class UserService {
  private repository = resolve(RepositoryService);
  private logger = resolve(ILogger);

  async getUser(id: number) {
    this.logger.info(`Getting user ${id}`);
    return this.repository.findUser(id);
  }
}

// Component using Service A
export class UserComponent {
  private userService = resolve(UserService);

  async loadUser(id: number) {
    return this.userService.getUser(id);
  }
}
```

**Testing the entire chain:**

```typescript
describe('Service dependency chains', () => {
  it('mocks the entire dependency chain', async () => {
    // Mock the leaf dependency
    const mockDatabaseService = {
      query: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }])
    };
    
    // Mock middle dependencies if needed, or let them use real implementations
    const mockLogger = {
      info: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<user-component></user-component>',
      class App {},
      [UserComponent, UserService, RepositoryService], // Let middle services be real
      [
        Registration.instance(DatabaseService, mockDatabaseService),
        Registration.instance(ILogger, mockLogger)
      ]
    );

    await startPromise;
    
    const result = await component.loadUser(1);
    
    expect(mockLogger.info).toHaveBeenCalledWith('Getting user 1');
    expect(mockDatabaseService.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = 1');
    expect(result).toEqual([{ id: 1, name: 'John' }]);
    
    await stop(true);
  });

  it('mocks individual layers for isolation', async () => {
    // Mock only the repository layer to test UserService in isolation
    const mockRepository = {
      findUser: jest.fn().mockResolvedValue({ id: 1, name: 'John' })
    };
    
    const mockLogger = {
      info: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<user-component></user-component>',
      class App {},
      [UserComponent, UserService], // Don't include RepositoryService
      [
        Registration.instance(RepositoryService, mockRepository),
        Registration.instance(ILogger, mockLogger)
      ]
    );

    await startPromise;
    
    const result = await component.loadUser(1);
    
    expect(mockLogger.info).toHaveBeenCalledWith('Getting user 1');
    expect(mockRepository.findUser).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, name: 'John' });
    
    await stop(true);
  });
});
```

### Testing Mixed DI Patterns

Components that use both `@inject` in constructor and `resolve()` for some dependencies:

```typescript
@inject(ILogger)
export class MixedDIComponent {
  private apiService = resolve(IApiService); // resolved dependency
  private cacheService = resolve(optional(ICacheService)); // optional resolved dependency

  constructor(
    private logger: ILogger // injected dependency
  ) {}

  async processData(data: any) {
    this.logger.info('Processing data');
    
    // Use cache if available
    if (this.cacheService) {
      await this.cacheService.set('data', data);
    }
    
    return this.apiService.process(data);
  }
}
```

**Testing mixed patterns:**

```typescript
describe('Mixed DI patterns', () => {
  it('handles both inject and resolve patterns', async () => {
    const mockLogger = {
      info: jest.fn()
    };
    
    const mockApiService = {
      process: jest.fn().mockResolvedValue({ processed: true })
    };
    
    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<mixed-di-component></mixed-di-component>',
      class App {},
      [MixedDIComponent],
      [
        Registration.instance(ILogger, mockLogger), // For @inject
        Registration.instance(IApiService, mockApiService), // For resolve()
        Registration.instance(ICacheService, mockCacheService) // For optional resolve()
      ]
    );

    await startPromise;
    
    const result = await component.processData({ test: 'data' });
    
    expect(mockLogger.info).toHaveBeenCalledWith('Processing data');
    expect(mockCacheService.set).toHaveBeenCalledWith('data', { test: 'data' });
    expect(mockApiService.process).toHaveBeenCalledWith({ test: 'data' });
    expect(result).toEqual({ processed: true });
    
    await stop(true);
  });
});
```

### Testing Factory and Transient Dependencies

When services are registered as transient (new instance each time) or factories:

```typescript
import { transient, singleton } from 'aurelia';

// Transient service - new instance each time
@transient
export class TransientService {
  private id = Math.random();
  
  getId() {
    return this.id;
  }
}

// Factory service
export interface INotificationFactory {
  createNotification(type: string): INotification;
}

export const INotificationFactory = DI.createInterface<INotificationFactory>('INotificationFactory', x => x.singleton(NotificationFactory));

export class NotificationFactory implements INotificationFactory {
  createNotification(type: string): INotification {
    switch (type) {
      case 'email': return new EmailNotification();
      case 'sms': return new SmsNotification();
      default: throw new Error('Unknown notification type');
    }
  }
}

// Component using factory
export class NotificationComponent {
  private notificationFactory = resolve(INotificationFactory);

  async sendNotification(type: string, message: string) {
    const notification = this.notificationFactory.createNotification(type);
    return notification.send(message);
  }
}
```

**Testing factory patterns:**

```typescript
describe('Factory and transient testing', () => {
  it('mocks factory methods', async () => {
    const mockEmailNotification = {
      send: jest.fn().mockResolvedValue({ sent: true, via: 'email' })
    };
    
    const mockSmsNotification = {
      send: jest.fn().mockResolvedValue({ sent: true, via: 'sms' })
    };
    
    const mockNotificationFactory = {
      createNotification: jest.fn().mockImplementation((type: string) => {
        return type === 'email' ? mockEmailNotification : mockSmsNotification;
      })
    };

    const { component, startPromise, stop } = createFixture(
      '<notification-component></notification-component>',
      class App {},
      [NotificationComponent],
      [Registration.instance(INotificationFactory, mockNotificationFactory)]
    );

    await startPromise;
    
    const result = await component.sendNotification('email', 'Test message');
    
    expect(mockNotificationFactory.createNotification).toHaveBeenCalledWith('email');
    expect(mockEmailNotification.send).toHaveBeenCalledWith('Test message');
    expect(result).toEqual({ sent: true, via: 'email' });
    
    await stop(true);
  });

  it('handles transient services', async () => {
    // For transient services, you might want to mock the class itself
    const mockTransientService = jest.fn().mockImplementation(() => ({
      getId: jest.fn().mockReturnValue('mocked-id')
    }));

    const { component, startPromise, stop } = createFixture(
      '<transient-using-component></transient-using-component>',
      class App {},
      [TransientUsingComponent],
      [Registration.singleton(TransientService, mockTransientService)]
    );

    await startPromise;
    
    // Test that each resolve creates a new mocked instance
    const service1 = component.getService();
    const service2 = component.getService();
    
    expect(mockTransientService).toHaveBeenCalledTimes(2);
    expect(service1.getId()).toBe('mocked-id');
    expect(service2.getId()).toBe('mocked-id');
    
    await stop(true);
  });
});
```

### Testing Circular Dependencies and Complex DI Scenarios

When you have complex DI scenarios with potential circular dependencies:

```typescript
// Service A depends on Service B
export class ServiceA {
  private serviceB = resolve(lazy(() => ServiceB)); // Lazy resolve to handle circularity

  processA(data: any) {
    return this.serviceB.processB(`A:${data}`);
  }
}

// Service B depends on Service A
export class ServiceB {
  private serviceA = resolve(lazy(() => ServiceA)); // Lazy resolve

  processB(data: any) {
    if (data.includes('recursive')) {
      return this.serviceA.processA('recursive-handled');
    }
    return `B:${data}`;
  }
}

// Component using both services
export class CircularDependencyComponent {
  private serviceA = resolve(ServiceA);

  process(data: any) {
    return this.serviceA.processA(data);
  }
}
```

**Testing circular dependencies:**

```typescript
describe('Circular dependency testing', () => {
  it('mocks circular dependencies', async () => {
    // Create mocks that can reference each other
    const mockServiceA = {
      processA: jest.fn()
    };
    
    const mockServiceB = {
      processB: jest.fn().mockImplementation((data: string) => {
        if (data.includes('recursive')) {
          return mockServiceA.processA('recursive-handled');
        }
        return `B:${data}`;
      })
    };
    
    // Set up the circular reference in the mock
    mockServiceA.processA.mockImplementation((data: any) => {
      return mockServiceB.processB(`A:${data}`);
    });

    const { component, startPromise, stop } = createFixture(
      '<circular-dependency-component></circular-dependency-component>',
      class App {},
      [CircularDependencyComponent],
      [
        Registration.instance(ServiceA, mockServiceA),
        Registration.instance(ServiceB, mockServiceB)
      ]
    );

    await startPromise;
    
    const result = component.process('test');
    
    expect(mockServiceA.processA).toHaveBeenCalledWith('test');
    expect(mockServiceB.processB).toHaveBeenCalledWith('A:test');
    expect(result).toBe('B:A:test');
    
    await stop(true);
  });
});
```

### Testing Scoped/Hierarchical DI

When you have child containers or scoped dependencies:

```typescript
// Parent service
export class ParentService {
  getParentData() {
    return 'parent-data';
  }
}

// Child service that might override parent
export class ChildService extends ParentService {
  getParentData() {
    return 'child-override-data';
  }
  
  getChildData() {
    return 'child-specific-data';
  }
}

// Component that creates child scopes
export class ScopedComponent {
  private parentService = resolve(ParentService);

  createChildScope() {
    // This would typically create a child container
    // For testing, we'll simulate the behavior
    return {
      parentData: this.parentService.getParentData(),
      childService: resolve(ChildService)
    };
  }
}
```

**Testing hierarchical DI:**

```typescript
describe('Hierarchical DI testing', () => {
  it('handles parent-child service relationships', async () => {
    const mockParentService = {
      getParentData: jest.fn().mockReturnValue('mocked-parent')
    };
    
    const mockChildService = {
      getParentData: jest.fn().mockReturnValue('mocked-child-override'),
      getChildData: jest.fn().mockReturnValue('mocked-child-specific')
    };

    const { component, startPromise, stop } = createFixture(
      '<scoped-component></scoped-component>',
      class App {},
      [ScopedComponent],
      [
        Registration.instance(ParentService, mockParentService),
        Registration.instance(ChildService, mockChildService)
      ]
    );

    await startPromise;
    
    const scope = component.createChildScope();
    
    expect(mockParentService.getParentData).toHaveBeenCalled();
    expect(scope.parentData).toBe('mocked-parent');
    expect(scope.childService.getChildData()).toBe('mocked-child-specific');
    
    await stop(true);
  });
});
```

### Testing Conditional DI and Dynamic Registration

When services are conditionally registered or resolved based on runtime conditions:

```typescript
// Configuration-based service resolution
export class ConfigurableComponent {
  private config = resolve(IAppConfig);
  private dataService: IDataService;

  constructor() {
    // Conditional resolution based on configuration
    if (this.config.useCache) {
      this.dataService = resolve(ICachedDataService);
    } else {
      this.dataService = resolve(IDirectDataService);
    }
  }

  async loadData(id: string) {
    return this.dataService.getData(id);
  }
}
```

**Testing conditional DI:**

```typescript
describe('Conditional DI testing', () => {
  it('resolves cached service when cache is enabled', async () => {
    const mockConfig = {
      useCache: true,
      apiEndpoint: 'http://test.api'
    };
    
    const mockCachedDataService = {
      getData: jest.fn().mockResolvedValue({ cached: true, data: 'test' })
    };

    const { component, startPromise, stop } = createFixture(
      '<configurable-component></configurable-component>',
      class App {},
      [ConfigurableComponent],
      [
        Registration.instance(IAppConfig, mockConfig),
        Registration.instance(ICachedDataService, mockCachedDataService)
      ]
    );

    await startPromise;
    
    const result = await component.loadData('test-id');
    
    expect(mockCachedDataService.getData).toHaveBeenCalledWith('test-id');
    expect(result).toEqual({ cached: true, data: 'test' });
    
    await stop(true);
  });

  it('resolves direct service when cache is disabled', async () => {
    const mockConfig = {
      useCache: false,
      apiEndpoint: 'http://test.api'
    };
    
    const mockDirectDataService = {
      getData: jest.fn().mockResolvedValue({ direct: true, data: 'test' })
    };

    const { component, startPromise, stop } = createFixture(
      '<configurable-component></configurable-component>',
      class App {},
      [ConfigurableComponent],
      [
        Registration.instance(IAppConfig, mockConfig),
        Registration.instance(IDirectDataService, mockDirectDataService)
      ]
    );

    await startPromise;
    
    const result = await component.loadData('test-id');
    
    expect(mockDirectDataService.getData).toHaveBeenCalledWith('test-id');
    expect(result).toEqual({ direct: true, data: 'test' });
    
    await stop(true);
  });
});
```

## Advanced Mocking Patterns

### Testing with Aurelia's Built-in Testing Utilities

Aurelia provides built-in testing utilities for common scenarios:

```typescript
import { createSpy } from '@aurelia/testing';
import { Registration } from '@aurelia/kernel';

describe('Component with built-in spy', () => {
  it('tracks method calls', async () => {
    const spy = createSpy();
    const mockService = {
      process: spy
    };

    const { component, startPromise, stop } = createFixture(
      '<my-component></my-component>',
      class App {},
      [MyComponent],
      [Registration.instance(ProcessingService, mockService)]
    );

    await startPromise;
    
    component.processData('test');
    
    expect(spy.calls.length).toBe(1);
    expect(spy.calls[0]).toEqual(['test']);
    
    await stop(true);
  });
});
```

### Mocking Complex Dependencies

For services with multiple methods and properties:

```typescript
import { Registration } from '@aurelia/kernel';

describe('Complex service mocking', () => {
  it('mocks a complex service', async () => {
    const mockApiService = {
      baseUrl: 'http://test-api.com',
      get: jest.fn().mockResolvedValue({ data: 'test' }),
      post: jest.fn().mockResolvedValue({ success: true }),
      isAuthenticated: jest.fn().mockReturnValue(true),
      currentUser: { id: 1, name: 'Test User' }
    };

    const { component, startPromise, stop } = createFixture(
      '<api-component></api-component>',
      class App {},
      [ApiComponent],
      [Registration.instance(ApiService, mockApiService)]
    );

    await startPromise;
    
    await component.loadUserData();
    
    expect(mockApiService.get).toHaveBeenCalledWith('/user/1');
    expect(component.userData).toEqual({ data: 'test' });
    
    await stop(true);
  });
});
```

### Mocking Multiple Related Services

```typescript
describe('Multiple service mocking', () => {
  it('mocks multiple interdependent services', async () => {
    const mockAuthService = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      getCurrentUser: jest.fn().mockReturnValue({ id: 1, role: 'admin' })
    };
    
    const mockPermissionService = {
      hasPermission: jest.fn().mockReturnValue(true),
      getUserPermissions: jest.fn().mockReturnValue(['read', 'write'])
    };
    
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<admin-panel></admin-panel>',
      class App {},
      [AdminPanel],
      [
        Registration.instance(AuthService, mockAuthService),
        Registration.instance(PermissionService, mockPermissionService),
        Registration.instance(ILogger, mockLogger)
      ]
    );

    await startPromise;
    
    component.performAdminAction();
    
    expect(mockAuthService.isLoggedIn).toHaveBeenCalled();
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith('admin');
    expect(mockLogger.info).toHaveBeenCalledWith('Admin action performed');
    
    await stop(true);
  });
});
```

### Testing Error Scenarios

```typescript
describe('Error handling', () => {
  it('handles service errors gracefully', async () => {
    const mockService = {
      fetchData: jest.fn().mockRejectedValue(new Error('Network error'))
    };

    const { component, appHost, startPromise, stop } = createFixture(
      '<error-handling-component></error-handling-component>',
      class App {},
      [ErrorHandlingComponent],
      [Registration.instance(DataService, mockService)]
    );

    await startPromise;
    
    // Trigger the error scenario
    await component.loadData();
    
    // Verify error handling
    expect(component.errorMessage).toBe('Failed to load data');
    expect(appHost.querySelector('.error-display')).toBeTruthy();
    expect(mockService.fetchData).toHaveBeenCalled();
    
    await stop(true);
  });
});
```

### Spy Verification Patterns

```typescript
describe('Spy verification patterns', () => {
  it('verifies method calls with complex arguments', async () => {
    const mockService = {
      updateUser: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<user-editor></user-editor>',
      class App {},
      [UserEditor],
      [Registration.instance(UserService, mockService)]
    );

    await startPromise;
    
    component.saveUser({ id: 1, name: 'John', email: 'john@example.com' });
    
    // Verify call with exact object
    expect(mockService.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        name: 'John',
        email: 'john@example.com'
      })
    );
    
    // Verify call count
    expect(mockService.updateUser).toHaveBeenCalledTimes(1);
    
    // Verify call order (if multiple calls)
    expect(mockService.updateUser).toHaveBeenNthCalledWith(1, expect.any(Object));
    
    await stop(true);
  });
});
```

## Testing with Official Aurelia Packages

When your application uses official Aurelia packages, you'll need specific testing strategies for each package. Here's comprehensive guidance for testing with the most commonly used Aurelia packages.

### Testing with @aurelia/validation

The validation package provides form validation capabilities. Here's how to test components that use validation:

```typescript
import { IValidationController, ValidationController, ValidationRules } from '@aurelia/validation';
import { inject, resolve, newInstanceForScope } from 'aurelia';
import { Registration } from '@aurelia/kernel';

// Component using validation with @inject decorator and newInstanceForScope
@inject(newInstanceForScope(IValidationController))
export class UserForm {
  firstName = '';
  lastName = '';
  email = '';

  constructor(private validationController: IValidationController) {
    ValidationRules
      .ensure('firstName').required()
      .ensure('lastName').required()
      .ensure('email').required().email()
      .on(this);
  }

  async submit() {
    const result = await this.validationController.validate();
    if (result.valid) {
      // Submit form
      return { success: true };
    }
    return { success: false, errors: result.results };
  }
}

// Alternative using resolve() function with newInstanceForScope (modern Aurelia 2 pattern)
export class UserFormModern {
  firstName = '';
  lastName = '';
  email = '';
  
  private validationController = resolve(newInstanceForScope(IValidationController));

  constructor() {
    ValidationRules
      .ensure('firstName').required()
      .ensure('lastName').required()
      .ensure('email').required().email()
      .on(this);
  }

  async submit() {
    const result = await this.validationController.validate();
    if (result.valid) {
      return { success: true };
    }
    return { success: false, errors: result.results };
  }
}
```

**Testing validation behavior:**

```typescript
describe('UserForm with validation', () => {
  it('validates required fields', async () => {
    const mockValidationController = {
      validate: jest.fn().mockResolvedValue({
        valid: false,
        results: [
          { valid: false, propertyName: 'firstName', message: 'First name is required' },
          { valid: false, propertyName: 'email', message: 'Email is required' }
        ]
      }),
      addObject: jest.fn(),
      removeObject: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<user-form></user-form>',
      class App {},
      [UserForm],
      [Registration.instance(IValidationController, mockValidationController)]
    );

    await startPromise;

    const result = await component.submit();

    expect(mockValidationController.validate).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(2);

    await stop(true);
  });

  it('submits when validation passes', async () => {
    const mockValidationController = {
      validate: jest.fn().mockResolvedValue({ valid: true, results: [] }),
      addObject: jest.fn(),
      removeObject: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<user-form></user-form>',
      class App {},
      [UserForm],
      [Registration.instance(IValidationController, mockValidationController)]
    );

    await startPromise;

    component.firstName = 'John';
    component.lastName = 'Doe';
    component.email = 'john@example.com';

    const result = await component.submit();

    expect(result.success).toBe(true);
    expect(mockValidationController.validate).toHaveBeenCalled();

    await stop(true);
  });
});
```

### Testing with @aurelia/router

The router package handles navigation and routing. Here's how to test router-dependent components:

```typescript
import { IRouter, load } from '@aurelia/router';
import { inject, resolve } from 'aurelia';

// Component using router with @inject decorator
@inject(IRouter)
export class NavigationComponent {
  hasUnsavedChanges = false;

  constructor(private router: IRouter) {}

  async navigateToUser(userId: number) {
    return this.router.load(`/users/${userId}`);
  }

  async navigateWithState(path: string, state: any) {
    return this.router.load(path, { state });
  }

  canNavigateAway(): boolean {
    // Navigation guard logic
    return this.hasUnsavedChanges === false;
  }
}

// Alternative using resolve() function
export class NavigationComponentModern {
  hasUnsavedChanges = false;
  private router = resolve(IRouter);

  async navigateToUser(userId: number) {
    return this.router.load(`/users/${userId}`);
  }

  async navigateWithState(path: string, state: any) {
    return this.router.load(path, { state });
  }

  canNavigateAway(): boolean {
    return this.hasUnsavedChanges === false;
  }
}
```

**Testing router interactions:**

```typescript
describe('NavigationComponent with router', () => {
  it('navigates to user page', async () => {
    const mockRouter = {
      load: jest.fn().mockResolvedValue({ success: true }),
      canLoad: jest.fn().mockReturnValue(true),
      isActive: jest.fn().mockReturnValue(false)
    };

    const { component, startPromise, stop } = createFixture(
      '<navigation-component></navigation-component>',
      class App {},
      [NavigationComponent],
      [Registration.instance(IRouter, mockRouter)]
    );

    await startPromise;

    await component.navigateToUser(123);

    expect(mockRouter.load).toHaveBeenCalledWith('/users/123');

    await stop(true);
  });

  it('navigates with state', async () => {
    const mockRouter = {
      load: jest.fn().mockResolvedValue({ success: true }),
      canLoad: jest.fn(),
      isActive: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<navigation-component></navigation-component>',
      class App {},
      [NavigationComponent],
      [Registration.instance(IRouter, mockRouter)]
    );

    await startPromise;

    const testState = { previousPage: 'dashboard' };
    await component.navigateWithState('/profile', testState);

    expect(mockRouter.load).toHaveBeenCalledWith('/profile', { state: testState });

    await stop(true);
  });

  it('implements navigation guards', async () => {
    const { component, startPromise, stop } = createFixture(
      '<navigation-component></navigation-component>',
      class App {},
      [NavigationComponent]
    );

    await startPromise;

    // Test guard when changes exist
    component.hasUnsavedChanges = true;
    expect(component.canNavigateAway()).toBe(false);

    // Test guard when no changes
    component.hasUnsavedChanges = false;
    expect(component.canNavigateAway()).toBe(true);

    await stop(true);
  });
});
```

**Testing route parameters:**

```typescript
import { IRouteContext } from '@aurelia/router';
import { inject, resolve } from 'aurelia';

// Using @inject decorator
@inject(IRouteContext)
export class UserDetailComponent {
  userId: string;
  user: any;

  constructor(private routeContext: IRouteContext) {}

  loading() {
    this.userId = this.routeContext.params.id;
    return this.loadUser();
  }

  async loadUser() {
    // Load user logic
    this.user = { id: this.userId, name: 'Test User' };
  }
}

// Alternative using resolve() function
export class UserDetailComponentModern {
  userId: string;
  user: any;
  private routeContext = resolve(IRouteContext);

  loading() {
    this.userId = this.routeContext.params.id;
    return this.loadUser();
  }

  async loadUser() {
    this.user = { id: this.userId, name: 'Test User' };
  }
}
```

```typescript
describe('UserDetailComponent route params', () => {
  it('loads user from route parameters', async () => {
    const mockRouteContext = {
      params: { id: '456' },
      query: {},
      path: '/users/456'
    };

    const { component, startPromise, stop } = createFixture(
      '<user-detail-component></user-detail-component>',
      class App {},
      [UserDetailComponent],
      [Registration.instance(IRouteContext, mockRouteContext)]
    );

    await startPromise;

    await component.loading();

    expect(component.userId).toBe('456');
    expect(component.user).toEqual({ id: '456', name: 'Test User' });

    await stop(true);
  });
});
```

### Testing with @aurelia/state

The state package provides state management capabilities. Here's how to test state-connected components:

```typescript
import { Store, connectTo, dispatchify } from '@aurelia/state';
import { inject, resolve } from 'aurelia';

// Actions
export const updateUser = (user: any) => ({ type: 'UPDATE_USER', user });

// Component connected to state using @inject
@connectTo()
@inject(Store)
export class UserProfileComponent {
  user: any;

  constructor(private store: Store<any>) {}

  stateChanged(state: any) {
    this.user = state.user;
  }

  updateProfile(userData: any) {
    this.store.dispatch(updateUser(userData));
  }
}

// Alternative using resolve() function
@connectTo()
export class UserProfileComponentModern {
  user: any;
  private store = resolve(Store);

  stateChanged(state: any) {
    this.user = state.user;
  }

  updateProfile(userData: any) {
    this.store.dispatch(updateUser(userData));
  }
}
```

**Testing state connections:**

```typescript
describe('UserProfileComponent with state', () => {
  it('updates when state changes', async () => {
    const mockStore = {
      state: { user: { id: 1, name: 'John' } },
      subscribe: jest.fn(),
      dispatch: jest.fn(),
      connectTo: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<user-profile-component></user-profile-component>',
      class App {},
      [UserProfileComponent],
      [Registration.instance(Store, mockStore)]
    );

    await startPromise;

    // Simulate state change
    component.stateChanged({ user: { id: 1, name: 'Jane' } });

    expect(component.user).toEqual({ id: 1, name: 'Jane' });

    await stop(true);
  });

  it('dispatches actions correctly', async () => {
    const mockStore = {
      state: { user: null },
      subscribe: jest.fn(),
      dispatch: jest.fn(),
      connectTo: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<user-profile-component></user-profile-component>',
      class App {},
      [UserProfileComponent],
      [Registration.instance(Store, mockStore)]
    );

    await startPromise;

    const newUserData = { id: 2, name: 'Bob' };
    component.updateProfile(newUserData);

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_USER',
      user: newUserData
    });

    await stop(true);
  });
});
```

### Testing with @aurelia/dialog

The dialog package provides modal dialog functionality:

```typescript
import { IDialogService, IDialogController } from '@aurelia/dialog';
import { inject, resolve } from 'aurelia';

// Component that opens dialogs using @inject
@inject(IDialogService)
export class DialogOpenerComponent {
  constructor(private dialogService: IDialogService) {}

  async openConfirmDialog(message: string) {
    const result = await this.dialogService.open({
      component: () => ConfirmDialog,
      model: { message }
    });
    return result.wasCancelled;
  }
}

// Alternative using resolve() function
export class DialogOpenerComponentModern {
  private dialogService = resolve(IDialogService);

  async openConfirmDialog(message: string) {
    const result = await this.dialogService.open({
      component: () => ConfirmDialog,
      model: { message }
    });
    return result.wasCancelled;
  }
}

// Dialog component using @inject
@inject(IDialogController)  
export class ConfirmDialog {
  message: string;

  constructor(private dialogController: IDialogController) {}

  activate(model: any) {
    this.message = model.message;
  }

  confirm() {
    this.dialogController.ok('confirmed');
  }

  cancel() {
    this.dialogController.cancel('cancelled');
  }
}

// Alternative dialog using resolve()
export class ConfirmDialogModern {
  message: string;
  private dialogController = resolve(IDialogController);

  activate(model: any) {
    this.message = model.message;
  }

  confirm() {
    this.dialogController.ok('confirmed');
  }

  cancel() {
    this.dialogController.cancel('cancelled');
  }
}
```

**Testing dialog interactions:**

```typescript
describe('DialogOpenerComponent', () => {
  it('opens confirmation dialog', async () => {
    const mockDialogResult = {
      wasCancelled: false,
      output: 'confirmed'
    };

    const mockDialogService = {
      open: jest.fn().mockResolvedValue(mockDialogResult)
    };

    const { component, startPromise, stop } = createFixture(
      '<dialog-opener-component></dialog-opener-component>',
      class App {},
      [DialogOpenerComponent],
      [Registration.instance(IDialogService, mockDialogService)]
    );

    await startPromise;

    const wasCancelled = await component.openConfirmDialog('Are you sure?');

    expect(mockDialogService.open).toHaveBeenCalledWith({
      component: expect.any(Function),
      model: { message: 'Are you sure?' }
    });
    expect(wasCancelled).toBe(false);

    await stop(true);
  });

  it('handles dialog cancellation', async () => {
    const mockDialogResult = {
      wasCancelled: true,
      output: 'cancelled'
    };

    const mockDialogService = {
      open: jest.fn().mockResolvedValue(mockDialogResult)
    };

    const { component, startPromise, stop } = createFixture(
      '<dialog-opener-component></dialog-opener-component>',
      class App {},
      [DialogOpenerComponent],
      [Registration.instance(IDialogService, mockDialogService)]
    );

    await startPromise;

    const wasCancelled = await component.openConfirmDialog('Delete item?');

    expect(wasCancelled).toBe(true);

    await stop(true);
  });
});

describe('ConfirmDialog component', () => {
  it('activates with model data', async () => {
    const mockDialogController = {
      ok: jest.fn(),
      cancel: jest.fn(),
      error: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<confirm-dialog></confirm-dialog>',
      class App {},
      [ConfirmDialog],
      [Registration.instance(IDialogController, mockDialogController)]
    );

    await startPromise;

    component.activate({ message: 'Test message' });

    expect(component.message).toBe('Test message');

    await stop(true);
  });

  it('confirms dialog', async () => {
    const mockDialogController = {
      ok: jest.fn(),
      cancel: jest.fn()
    };

    const { component, startPromise, stop } = createFixture(
      '<confirm-dialog></confirm-dialog>',
      class App {},
      [ConfirmDialog],
      [Registration.instance(IDialogController, mockDialogController)]
    );

    await startPromise;

    component.confirm();

    expect(mockDialogController.ok).toHaveBeenCalledWith('confirmed');

    await stop(true);
  });
});
```

### Testing with @aurelia/fetch-client

The fetch client provides HTTP request capabilities:

```typescript
import { HttpClient } from '@aurelia/fetch-client';
import { inject, resolve } from 'aurelia';

// Using @inject decorator
@inject(HttpClient)
export class ApiService {
  constructor(private http: HttpClient) {}

  async getUsers() {
    const response = await this.http.fetch('/api/users');
    return response.json();
  }

  async createUser(userData: any) {
    const response = await this.http.fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
}

// Alternative using resolve() function
export class ApiServiceModern {
  private http = resolve(HttpClient);

  async getUsers() {
    const response = await this.http.fetch('/api/users');
    return response.json();
  }

  async createUser(userData: any) {
    const response = await this.http.fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
}
```

**Testing HTTP operations:**

```typescript
describe('ApiService', () => {
  it('fetches users from API', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue([{ id: 1, name: 'John' }])
    };

    const mockHttpClient = {
      fetch: jest.fn().mockResolvedValue(mockResponse)
    };

    const { component, startPromise, stop } = createFixture(
      '<api-component></api-component>',
      class App {},
      [ApiService, ApiComponent],
      [Registration.instance(HttpClient, mockHttpClient)]
    );

    await startPromise;

    const users = await component.apiService.getUsers();

    expect(mockHttpClient.fetch).toHaveBeenCalledWith('/api/users');
    expect(users).toEqual([{ id: 1, name: 'John' }]);

    await stop(true);
  });

  it('creates user via API', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ id: 2, name: 'Jane' })
    };

    const mockHttpClient = {
      fetch: jest.fn().mockResolvedValue(mockResponse)
    };

    const service = new ApiService(mockHttpClient);
    const userData = { name: 'Jane', email: 'jane@example.com' };

    const result = await service.createUser(userData);

    expect(mockHttpClient.fetch).toHaveBeenCalledWith('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' }
    });
    expect(result).toEqual({ id: 2, name: 'Jane' });
  });
});
```

### Testing with @aurelia/i18n

The internationalization package provides translation capabilities:

```typescript
import { I18N } from '@aurelia/i18n';
import { inject, resolve } from 'aurelia';

// Using @inject decorator
@inject(I18N)
export class LocalizedComponent {
  userName: string;

  constructor(private i18n: I18N) {}

  get welcomeMessage() {
    return this.i18n.tr('welcome.message', { name: this.userName });
  }

  changeLanguage(locale: string) {
    return this.i18n.setLocale(locale);
  }
}

// Alternative using resolve() function
export class LocalizedComponentModern {
  userName: string;
  private i18n = resolve(I18N);

  get welcomeMessage() {
    return this.i18n.tr('welcome.message', { name: this.userName });
  }

  changeLanguage(locale: string) {
    return this.i18n.setLocale(locale);
  }
}
```

**Testing i18n functionality:**

```typescript
describe('LocalizedComponent', () => {
  it('translates messages correctly', async () => {
    const mockI18N = {
      tr: jest.fn().mockReturnValue('Welcome, John!'),
      setLocale: jest.fn().mockResolvedValue(true)
    };

    const { component, startPromise, stop } = createFixture(
      '<localized-component></localized-component>',
      class App {},
      [LocalizedComponent],
      [Registration.instance(I18N, mockI18N)]
    );

    await startPromise;

    component.userName = 'John';
    const message = component.welcomeMessage;

    expect(mockI18N.tr).toHaveBeenCalledWith('welcome.message', { name: 'John' });
    expect(message).toBe('Welcome, John!');

    await stop(true);
  });

  it('changes locale correctly', async () => {
    const mockI18N = {
      tr: jest.fn(),
      setLocale: jest.fn().mockResolvedValue(true)
    };

    const { component, startPromise, stop } = createFixture(
      '<localized-component></localized-component>',
      class App {},
      [LocalizedComponent],
      [Registration.instance(I18N, mockI18N)]
    );

    await startPromise;

    await component.changeLanguage('es');

    expect(mockI18N.setLocale).toHaveBeenCalledWith('es');

    await stop(true);
  });
});
```

### Testing Package Integration Best Practices

1. **Mock Package Services**: Always mock the main service interfaces from each package
2. **Test Package-Specific Behavior**: Focus on how your components interact with package APIs
3. **Verify Method Calls**: Use spies to ensure package methods are called with correct parameters
4. **Test Error Scenarios**: Mock package errors to test error handling
5. **Integration Testing**: Test the full flow of package interactions when needed

### Common Package Testing Patterns

```typescript
// Pattern for testing package initialization
describe('Package integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('initializes package correctly', async () => {
    const packageMock = createPackageMock();
    
    const { startPromise, stop } = createFixture(
      '<my-component></my-component>',
      class App {},
      [MyComponent],
      [Registration.instance(IPackageService, packageMock)]
    );

    await startPromise;
    
    // Verify package was initialized
    expect(packageMock.initialize).toHaveBeenCalled();
    
    await stop(true);
  });
});

function createPackageMock() {
  return {
    initialize: jest.fn(),
    process: jest.fn(),
    cleanup: jest.fn()
  };
}
```
