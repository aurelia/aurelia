# Organizing Large-Scale Aurelia 2 Projects

Building large-scale applications with Aurelia 2 requires careful planning and organization. This guide provides best practices for structuring your projects, managing dependencies, and scaling your applications effectively.

## Core Principles

Before diving into specific patterns, it's important to understand the core principles that guide these recommendations:

1. **Separation of Concerns** - Keep different aspects of your application isolated from each other
2. **Scalability** - Structure that grows with your team and application complexity
3. **Maintainability** - Code that's easy to understand, modify, and debug
4. **Testability** - Architecture that facilitates comprehensive testing
5. **Performance** - Structure that enables optimization without major refactoring

## Project Structure Patterns

### Feature-Based Architecture (Recommended)

Feature-based organization is recommended over technical-layer organization for several reasons:

- **Improved Cohesion**: Related code stays together, making it easier to understand and modify features
- **Better Scalability**: Teams can work on features independently without stepping on each other
- **Easier Code Splitting**: Features naturally align with lazy-loading boundaries
- **Reduced Coupling**: Features can be developed, tested, and deployed more independently

Here's how to structure a feature-based application:

```
my-aurelia-app/
├── src/
│   ├── features/
│   │   ├── user/
│   │   │   ├── components/           # Feature-specific components
│   │   │   │   ├── user-list.ts
│   │   │   │   ├── user-list.html
│   │   │   │   ├── user-detail.ts
│   │   │   │   └── user-detail.html
│   │   │   ├── services/             # Feature-specific services
│   │   │   │   └── user-state.ts
│   │   │   ├── models/               # Domain models
│   │   │   │   └── user.ts
│   │   │   └── index.ts              # Feature module export
│   │   ├── products/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   └── orders/
│   │       ├── components/
│   │       ├── services/
│   │       └── index.ts
│   ├── shared/                       # Shared across features
│   │   ├── components/
│   │   │   ├── spinner.ts
│   │   │   ├── error-list.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   ├── resources/
│   │   │   ├── value-converters/
│   │   │   ├── binding-behaviors/
│   │   │   └── custom-attributes/
│   │   └── index.ts                  # Barrel export
│   ├── styles/
│   │   ├── global.css
│   │   └── themes/
│   ├── main.ts                       # Application entry point
│   └── app.ts                        # Root component
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
└── tsconfig.json
```

### Monorepo Structure

A monorepo structure is beneficial for large organizations because:

- **Code Sharing**: Easy to share components, utilities, and types across applications
- **Atomic Changes**: Can make coordinated changes across multiple packages in a single commit
- **Consistent Tooling**: Single set of build tools, linting rules, and dependencies
- **Better Refactoring**: IDE support for renaming and refactoring across all packages

#### Why Turbo?

[Turbo](https://turbo.build/) is recommended for monorepo orchestration because:

- **Intelligent Caching**: Only rebuilds what changed, dramatically speeding up builds
- **Parallel Execution**: Runs tasks across packages in parallel when possible
- **Remote Caching**: Teams can share build artifacts, reducing CI/CD times
- **Pipeline Management**: Declaratively define task dependencies between packages

For enterprise applications with multiple teams or deployable units:

```
enterprise-app/
├── packages/
│   ├── core/                         # Core framework extensions
│   │   ├── src/
│   │   │   ├── services/
│   │   │   ├── interfaces/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── shared-ui/                    # Shared component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── styles/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── admin-app/                    # Admin application
│   │   ├── src/
│   │   │   ├── features/
│   │   │   └── main.ts
│   │   └── package.json
│   ├── customer-app/                 # Customer application
│   │   ├── src/
│   │   │   ├── features/
│   │   │   └── main.ts
│   │   └── package.json
│   └── api-client/                   # Shared API client
│       ├── src/
│       └── package.json
├── tools/                            # Build tools and scripts
├── docs/                             # Documentation
├── turbo.json                        # Turbo configuration
├── package.json
└── tsconfig.json
```

## Application Bootstrap Patterns

### Basic Bootstrap

```typescript
// src/main.ts
import { Aurelia, StandardConfiguration } from 'aurelia';
import { MyApp } from './app';

await new Aurelia()
  .register(StandardConfiguration)
  .app({
    host: document.querySelector('app-root'),
    component: MyApp
  })
  .start();
```

### Advanced Bootstrap with Configuration

```typescript
// src/main.ts
import { Aurelia, LoggerConfiguration, LogLevel } from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import * as GlobalResources from './shared';
import { registerFeatures } from './features';

const au = new Aurelia();

// Configure logging
au.register(LoggerConfiguration.create({
  level: LogLevel.debug,
  sinks: [ConsoleSink]
}));

// Configure router
au.register(RouterConfiguration.customize({
  useUrlFragmentHash: false,
  resolutionMode: 'static',
  navigationSyncStates: ['guardedUnload', 'swapped', 'completed']
}));

// Register global resources
au.register(GlobalResources);

// Register feature modules
au.register(registerFeatures);

// Start application
await au.app({
  host: document.querySelector('app-root'),
  component: () => import('./app')
}).start();
```

## State Management Architecture

### State Management Options in Aurelia 2

Aurelia 2 provides two main approaches to state management:

1. **DI-Based Services (Recommended for most cases)**
   - Simple, testable, and TypeScript-friendly
   - No additional libraries or patterns to learn
   - Perfect for component-level and feature-level state
   - Works great with Aurelia's reactive binding system

2. **@aurelia/state (For complex global state)**
   - Redux-like state management with reactive bindings
   - Provides `@fromState` decorator for component bindings
   - Memoized selectors for computed values
   - Action-based state updates with reducers

### When to Use Each Approach

#### DI-Based Services
Use when:
- State is scoped to a feature or component
- You need simple CRUD operations
- Testing is a priority
- Team prefers familiar OOP patterns
- You want minimal complexity

#### @aurelia/state
Use when:
- You need truly global application state
- Multiple unrelated components need the same state
- You want predictable state updates through actions
- Complex state relationships require memoized selectors
- You need to debug state changes systematically

### DI-Based State Management Pattern (Recommended)

Create dedicated state services using dependency injection:

```typescript
// src/features/user/services/user-state.ts
import { DI, resolve } from '@aurelia/kernel';
import { IApiClient } from '../../../shared/services/api';

export interface IUserState {
  readonly users: User[];
  readonly currentUser: User | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  loadUsers(): Promise<void>;
  loadUser(id: string): Promise<void>;
  createUser(user: Partial<User>): Promise<void>;
}

export const IUserState = DI.createInterface<IUserState>('IUserState', x =>
  x.singleton(UserState)
);

class UserState implements IUserState {
  private api = resolve(IApiClient);

  users: User[] = [];
  currentUser: User | null = null;
  isLoading = false;
  error: string | null = null;

  // Request deduplication prevents multiple identical API calls
  private pendingRequests = new Map<string, Promise<any>>();

  async loadUsers(): Promise<void> {
    const key = 'loadUsers';

    // Deduplicate concurrent requests
    // This prevents race conditions when multiple components
    // request the same data simultaneously
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = this.executeLoadUsers();
    this.pendingRequests.set(key, promise);

    try {
      await promise;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async executeLoadUsers(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      this.users = await this.api.get<User[]>('/users');
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async loadUser(id: string): Promise<void> {
    // Similar implementation with deduplication
  }

  async createUser(user: Partial<User>): Promise<void> {
    // Implementation
  }
}
```

### Using @aurelia/state for Complex Scenarios

`@aurelia/state` provides Redux-like state management with reactive bindings:

```typescript
// src/features/shopping/state/cart-state.ts
import { Store, fromState, createStateMemoizer } from '@aurelia/state';

// Define the state shape
interface CartState {
  items: CartItem[];
  taxRate: number;
}

// Initial state
const initialState: CartState = {
  items: [],
  taxRate: 0.08
};

// Action handlers
const cartReducer = (state: CartState, action: any): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existing = state.items.find(item => item.productId === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.product.id
              ? { ...item, quantity: item.quantity + action.quantity }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.product, quantity: action.quantity }]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.productId)
      };

    default:
      return state;
  }
};

// Memoized selectors for computed values
const selectSubtotal = createStateMemoizer(
  (state: CartState) => state.items,
  (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

const selectTax = createStateMemoizer(
  (state: CartState) => ({ items: state.items, taxRate: state.taxRate }),
  ({ items, taxRate }) => items.reduce((sum, item) => sum + item.price * item.quantity, 0) * taxRate
);

const selectTotal = createStateMemoizer(
  (state: CartState) => state,
  (state) => {
    const subtotal = selectSubtotal(state);
    const tax = selectTax(state);
    return subtotal + tax;
  }
);

// Configure in main.ts
import { StateDefaultConfiguration } from '@aurelia/state';
au.register(StateDefaultConfiguration.init(initialState, cartReducer));
```

### Using DI-Based State in Components

```typescript
// src/features/user/components/user-list.ts
import { IUserState } from '../services/user-state';
import { resolve } from '@aurelia/kernel';

export class UserList {
  // The resolve() helper is a cleaner alternative to constructor injection
  // It works because Aurelia creates components through DI
  private userState = resolve(IUserState);

  async attaching(): Promise<void> {
    // Load data during the attaching lifecycle
    // This blocks rendering until data is loaded
    await this.userState.loadUsers();
  }

  get users() {
    // Aurelia's binding system will automatically update
    // the view when userState.users changes
    return this.userState.users;
  }

  get isLoading() {
    return this.userState.isLoading;
  }
}
```

### Using @aurelia/state in Components

```typescript
// src/features/shopping/components/cart-summary.ts
import { fromState, Store, createStateMemoizer } from '@aurelia/state';
import { CartState } from '../state/cart-state';

export class CartSummary {
  // Use @fromState decorator to bind to state properties
  @fromState<CartState>(state => state.items)
  items: CartItem[];

  @fromState<CartState>(state => state.taxRate)
  taxRate: number;

  // Use selectors for computed values
  @fromState<CartState>(selectSubtotal)
  subtotal: number;

  @fromState<CartState>(selectTax)
  tax: number;

  @fromState<CartState>(selectTotal)
  total: number;

  constructor(private store: Store<CartState>) {}

  addItem(product: Product, quantity = 1) {
    this.store.dispatch({
      type: 'ADD_ITEM',
      product,
      quantity
    });
  }

  removeItem(productId: string) {
    this.store.dispatch({
      type: 'REMOVE_ITEM',
      productId
    });
  }
}
```

#### Template Usage with @aurelia/state

```html
<!-- src/features/shopping/components/cart-summary.html -->
<div class="cart-summary">
  <h3>Cart Summary</h3>

  <div class="items">
    <div repeat.for="item of items & state" class="cart-item">
      <span>${item.name}</span>
      <span>Qty: ${item.quantity}</span>
      <span>${item.price | currency}</span>
      <button click.dispatch="{ type: 'REMOVE_ITEM', productId: item.productId }">
        Remove
      </button>
    </div>
  </div>

  <div class="totals">
    <div>Subtotal: ${subtotal | currency}</div>
    <div>Tax: ${tax | currency}</div>
    <div>Total: ${total | currency}</div>
  </div>
</div>
```

### Comparison: When to Use Each

| Feature | DI Services | @aurelia/state |
|---------|-------------|----------------|
| Learning Curve | Low | Medium |
| Boilerplate | Minimal | Medium |
| Computed Values | Manual | Memoized Selectors |
| State Scope | Feature/Component | Global |
| Testing | Excellent | Good |
| Performance | Good | Excellent |
| Best For | Most Use Cases | Complex Global State |

## Routing Patterns

### Why Lazy Loading Routes?

Lazy loading routes is crucial for large applications because:

- **Faster Initial Load**: Users only download code for the pages they visit
- **Better Caching**: Browser can cache route bundles separately
- **Reduced Memory Usage**: Components are only instantiated when needed
- **Natural Code Splitting**: Each route becomes its own bundle

### Static Route Configuration

```typescript
// src/app.ts
import { route } from '@aurelia/router';
import { IUserState } from './features/user/services/user-state';

@route({
  routes: [
    {
      id: 'home',
      path: '',
      component: () => import('./features/home/home'),
      title: 'Home'
    },
    {
      path: 'users',
      component: () => import('./features/user/user-layout'),
      children: [
        {
          path: '',
          component: () => import('./features/user/components/user-list'),
          title: 'Users'
        },
        {
          path: ':id',
          component: () => import('./features/user/components/user-detail'),
          title: 'User Detail'
        }
      ]
    },
    {
      path: 'admin',
      component: () => import('./features/admin/admin-layout'),
      data: { requiresAuth: true, roles: ['admin'] }
    }
  ]
})
export class App {
  // Root component logic
}
```

### Navigation Guards

```typescript
// src/shared/auth/auth-hook.ts
import { lifecycleHooks, ILifecycleHooks, IRouteViewModel } from '@aurelia/router';
import { IAuthService } from '../services/auth';
import { resolve } from '@aurelia/kernel';

@lifecycleHooks()
export class AuthHook implements ILifecycleHooks<IRouteViewModel, 'canLoad'> {
  private auth = resolve(IAuthService);

  canLoad(vm: IRouteViewModel, params: Params, next: RouteNode): boolean | NavigationInstruction {
    const requiresAuth = next.data?.requiresAuth;
    const requiredRoles = next.data?.roles || [];

    if (requiresAuth && !this.auth.isAuthenticated) {
      return this.auth.returnUrl = next.computeAbsolutePath(), 'login';
    }

    if (requiredRoles.length && !this.auth.hasRoles(requiredRoles)) {
      return 'unauthorized';
    }

    return true;
  }
}

// Register globally
au.register(AuthHook);
```

## Resource Management

### Understanding Aurelia Resources

Resources in Aurelia 2 include:
- **Custom Elements**: Reusable components
- **Custom Attributes**: Behaviors attached to elements
- **Value Converters**: Transform values in bindings
- **Binding Behaviors**: Modify binding behavior

These need to be registered so Aurelia's template compiler can find them. You have two options:

1. **Global Registration**: Available everywhere in your app
2. **Local Registration**: Available only within a specific component or feature

### Global Resource Registration

Use global registration for resources that are used frequently across your application:

```typescript
// src/shared/index.ts
export * from './components/spinner';
export * from './components/error-list';
export * from './components/confirm-dialog';
export * from './resources/value-converters/format-date';
export * from './resources/value-converters/format-currency';
export * from './resources/binding-behaviors/debounce';
export * from './resources/custom-attributes/tooltip';

// src/main.ts
import * as GlobalResources from './shared';

au.register(GlobalResources);
```

### Feature Module Pattern

Feature modules encapsulate all code for a specific domain. This pattern provides:

- **Clear Boundaries**: Each feature is self-contained
- **Easy Testing**: Can test features in isolation
- **Team Ownership**: Teams can own entire features
- **Gradual Migration**: Can migrate features incrementally

```typescript
// src/features/user/index.ts
import { IContainer } from '@aurelia/kernel';
import { IUserState, UserState } from './services/user-state';
import { UserPermissionService } from './services/user-permission';

export function configureUserFeature(container: IContainer): void {
  container.register(
    // Services
    IUserState,
    UserPermissionService,

    // Feature-specific resources
    // These are registered locally to the feature
  );
}

// src/features/index.ts
import { IContainer } from '@aurelia/kernel';
import { configureUserFeature } from './user';
import { configureProductFeature } from './products';
import { configureOrderFeature } from './orders';

export function registerFeatures(container: IContainer): void {
  configureUserFeature(container);
  configureProductFeature(container);
  configureOrderFeature(container);
}
```

## Build Configuration

### Why Vite?

Vite is the recommended build tool for Aurelia 2 applications because:

- **Lightning Fast HMR**: Near-instant hot module replacement during development
- **ESM-First**: Native ES modules in development, optimized bundles for production
- **Zero Config**: Works out of the box with sensible defaults
- **Built-in Optimizations**: Automatic code splitting, tree shaking, and minification
- **First-Class TypeScript Support**: No additional configuration needed

### Modern Build with Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  plugins: [aurelia()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'aurelia': ['aurelia', '@aurelia/router'],
          'vendor': ['date-fns', 'axios']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
      '@features': '/src/features'
    }
  }
});
```

### Environment Configuration

#### Why Environment-Specific Configuration?

Different environments require different settings:
- **Development**: Verbose logging, local API endpoints, disabled analytics
- **Staging**: Production-like but with test data and endpoints
- **Production**: Optimized settings, real endpoints, enabled analytics

Using DI for environment configuration provides:
- Type safety for configuration values
- Easy mocking in tests
- Single source of truth
- Runtime configuration validation

```typescript
// src/config/environment.ts
interface IEnvironment {
  production: boolean;
  apiUrl: string;
  features: {
    analytics: boolean;
    debugLogging: boolean;
  };
}

const environments: Record<string, IEnvironment> = {
  development: {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    features: {
      analytics: false,
      debugLogging: true
    }
  },
  staging: {
    production: false,
    apiUrl: 'https://staging-api.example.com',
    features: {
      analytics: true,
      debugLogging: false
    }
  },
  production: {
    production: true,
    apiUrl: 'https://api.example.com',
    features: {
      analytics: true,
      debugLogging: false
    }
  }
};

export const environment = environments[import.meta.env.MODE] || environments.development;

// Register as singleton
export const IEnvironment = DI.createInterface<IEnvironment>('IEnvironment', x =>
  x.instance(environment)
);
```

## Testing Strategies

### Why @aurelia/testing?

Aurelia provides its own testing utilities because:

- **Lifecycle Management**: Properly handles component lifecycle during tests
- **Fixture Creation**: Easy setup of components with dependencies
- **DOM Assertions**: Built-in helpers for testing rendered output
- **DI Integration**: Seamlessly mock services through DI
- **Async Handling**: Proper handling of Aurelia's async operations

### Component Testing

```typescript
// tests/unit/features/user/user-list.spec.ts
import { createFixture } from '@aurelia/testing';
import { UserList } from '../../../../src/features/user/components/user-list';
import { IUserState } from '../../../../src/features/user/services/user-state';

describe('UserList', () => {
  it('should display users', async () => {
    const mockUserState: Partial<IUserState> = {
      users: [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' }
      ],
      isLoading: false,
      loadUsers: async () => {}
    };

    const { assertText } = await createFixture(
      '<user-list></user-list>',
      { id: 'app' },
      [
        UserList,
        { register: IUserState, useValue: mockUserState }
      ]
    ).started;

    assertText('John Doe');
    assertText('Jane Smith');
  });
});
```

### Service Testing

```typescript
// tests/unit/features/user/user-state.spec.ts
import { DI } from '@aurelia/kernel';
import { UserState } from '../../../../src/features/user/services/user-state';
import { IApiClient } from '../../../../src/shared/services/api';

describe('UserState', () => {
  it('should deduplicate concurrent requests', async () => {
    const container = DI.createContainer();
    const mockApi = {
      get: jest.fn().mockResolvedValue([{ id: '1', name: 'Test User' }])
    };

    container.register({ register: IApiClient, useValue: mockApi });
    const userState = container.get(UserState);

    // Make concurrent requests
    const [result1, result2] = await Promise.all([
      userState.loadUsers(),
      userState.loadUsers()
    ]);

    // Should only make one API call
    expect(mockApi.get).toHaveBeenCalledTimes(1);
    expect(userState.users).toHaveLength(1);
  });
});
```

## Performance Optimization

### Why Focus on Performance?

Large applications must consider performance from the start:

- **User Experience**: Faster apps have better engagement and conversion
- **SEO Impact**: Page speed affects search rankings
- **Mobile Users**: Many users on slower connections or devices
- **Scalability**: Performance problems compound as apps grow

### Code Splitting with Dynamic Imports

Code splitting breaks your application into smaller chunks that load on demand:

```typescript
// src/features/admin/index.ts
export async function configureAdminFeature(container: IContainer): Promise<void> {
  // Lazy load admin dependencies
  const [
    { AdminService },
    { AdminAnalytics },
    { AdminResources }
  ] = await Promise.all([
    import('./services/admin-service'),
    import('./services/admin-analytics'),
    import('./resources')
  ]);

  container.register(
    AdminService,
    AdminAnalytics,
    ...AdminResources
  );
}
```

### Bundle Analysis

```json
// package.json
{
  "scripts": {
    "analyze": "vite build --mode analyze",
    "analyze:stats": "vite-bundle-visualizer"
  }
}
```

## Micro-Frontend Architecture

### When to Use Micro-Frontends?

Consider micro-frontends when:

- **Multiple Teams**: Different teams own different parts of the application
- **Independent Deployment**: Need to deploy features independently
- **Technology Diversity**: Teams want to use different frameworks/versions
- **Massive Scale**: Application is too large for a single codebase

### Trade-offs

**Pros:**
- Team autonomy
- Independent deployments
- Fault isolation
- Technology flexibility

**Cons:**
- Increased complexity
- Potential duplication
- Cross-module communication challenges
- Larger overall bundle size

### Shell Application

```typescript
// shell/src/main.ts
import { Aurelia } from 'aurelia';
import { ModuleFederationPlugin } from '@module-federation/enhanced';

const au = new Aurelia();

// Register remote modules
au.register({
  register(container: IContainer) {
    container.register(
      Registration.singleton(IRemoteModuleLoader, RemoteModuleLoader)
    );
  }
});

// Configure module federation
au.register(ModuleFederationPlugin.configure({
  name: 'shell',
  remotes: {
    userModule: 'userModule@http://localhost:3001/remoteEntry.js',
    productModule: 'productModule@http://localhost:3002/remoteEntry.js'
  }
}));
```

### Remote Module

```typescript
// user-module/src/bootstrap.ts
import { Aurelia } from 'aurelia';
import { IUserFeature } from './user-feature';

export async function mount(container: IContainer, config: RemoteConfig): Promise<void> {
  const childContainer = container.createChild();

  childContainer.register(
    IUserFeature,
    UserRoutes,
    UserResources
  );

  await childContainer.get(IUserFeature).activate(config);
}
```

## Decision Guide: Which Architecture to Choose?

### Single Repository
Choose when:
- Small to medium team (< 20 developers)
- Single deployable application
- Rapid prototyping needed
- Simpler deployment pipeline preferred

### Monorepo
Choose when:
- Multiple related applications
- Significant code sharing needed
- Large team with good tooling
- Consistent standards important

### Micro-Frontends
Choose when:
- Very large organization (100+ developers)
- Teams need full autonomy
- Independent deployment critical
- Different tech stacks required

## Best Practices Summary

1. **Architecture Principles**
   - Organize by features/domains, not technical layers
   - Use dependency injection for all services
   - Keep components focused on presentation
   - Implement proper separation of concerns

2. **State Management**
   - Use singleton services for application state
   - Implement request deduplication for concurrent calls
   - Handle loading and error states consistently
   - Keep state close to where it's used

3. **Performance**
   - Implement code splitting at route boundaries
   - Use dynamic imports for heavy dependencies
   - Monitor bundle sizes with analysis tools
   - Lazy load features when possible

4. **Type Safety**
   - Use TypeScript interfaces for all services
   - Avoid `any` type - create specific types
   - Leverage DI interfaces for better abstraction
   - Use strict TypeScript configuration

5. **Testing**
   - Test components with @aurelia/testing fixtures
   - Mock services through DI registration
   - Test state management logic separately
   - Focus on testing critical business logic and user workflows

6. **Code Organization**
   - Use barrel exports for feature modules
   - Keep consistent file naming conventions
   - Group related functionality together
   - Maintain clear module boundaries

7. **Build & Deployment**
   - Use modern build tools (Vite preferred)
   - Configure environment-specific settings
   - Implement proper code splitting
   - Monitor and optimize bundle sizes

By following these patterns and practices, you can build scalable, maintainable Aurelia 2 applications that grow with your team and business requirements. The key is to start with a solid foundation and evolve the architecture as needed while maintaining consistency across the codebase.
