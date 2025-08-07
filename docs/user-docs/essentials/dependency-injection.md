# Dependency Injection

Aurelia's dependency injection (DI) system manages your application's services and their dependencies automatically, promoting clean architecture and testable code.

## Creating Services

Services are regular classes that provide functionality to your application:

```typescript
export class UserService {
  private users: User[] = [];

  async getUsers(): Promise<User[]> {
    // Fetch users from API
    return this.users;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Create new user
    const user = await this.api.post('/users', userData);
    this.users.push(user);
    return user;
  }
}
```

## Service Registration

Register services using the DI interface pattern:

```typescript
import { DI } from 'aurelia';

export const IUserService = DI.createInterface<IUserService>('IUserService', x => x.singleton(UserService));

export type IUserService = UserService;
```

This automatically registers the service as a singleton when the module is imported.

## Using Services in Components

Inject services into components through constructor parameters:

```typescript
import { inject } from 'aurelia';
import { IUserService } from './user-service';

@inject(IUserService)
export class UserList {
  private users: User[] = [];

  constructor(private userService: IUserService) {}

  async created() {
    this.users = await this.userService.getUsers();
  }

  async addUser(userData: CreateUserRequest) {
    const newUser = await this.userService.createUser(userData);
    this.users.push(newUser);
  }
}
```

Or use the `resolve` function for a more modern approach:

```typescript
import { resolve } from 'aurelia';
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

## Service Dependencies

Services can depend on other services:

```typescript
import { inject } from 'aurelia';
import { IHttpClient } from '@aurelia/fetch-client';
import { ILogger } from '@aurelia/kernel';

@inject(IHttpClient, ILogger)
export class UserService {
  constructor(
    private http: IHttpClient,
    private logger: ILogger
  ) {}

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

Or using `resolve`:

```typescript
import { resolve } from 'aurelia';
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
import { ApiConfig, IApiConfig } from './services/api-config';

Aurelia.register(
  Registration.instance(IApiConfig, { 
    baseUrl: 'https://api.example.com', 
    timeout: 5000, 
    retries: 3 
  })
);
```

Use configuration in services:

```typescript
import { inject } from 'aurelia';

@inject(IApiConfig, IHttpClient)
export class ApiService {
  constructor(
    private config: ApiConfig,
    private http: IHttpClient
  ) {
    this.http.configure(config => {
      config.baseUrl = this.config.baseUrl;
      config.timeout = this.config.timeout;
    });
  }
}
```

Or with `resolve`:

```typescript
import { resolve } from 'aurelia';

export class ApiService {
  private config = resolve(IApiConfig);
  private http = resolve(IHttpClient);

  constructor() {
    this.http.configure(config => {
      config.baseUrl = this.config.baseUrl;
      config.timeout = this.config.timeout;
    });
  }
}
```

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