---
description: Learn how to test routed components, navigation flows, and router functionality in Aurelia applications.
---

# Testing Router Components and Navigation

Testing routing functionality is crucial for maintaining robust applications. This guide covers testing patterns for routed components, navigation flows, router hooks, and integration scenarios using Aurelia's testing utilities.

## Testing Setup

### Basic Test Configuration

```typescript
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { RouterConfiguration, IRouter } from '@aurelia/router';
import { TestContext, TestConfiguration } from '@aurelia/testing';

// Test helper for router setup
export function createRouterTestContext() {
  return TestContext.create(
    StandardConfiguration,
    RouterConfiguration,
    TestConfiguration
  );
}

// Router test base class
export class RouterTestBase {
  protected ctx: TestContext;
  protected router: IRouter;
  protected au: Aurelia;

  async beforeEach() {
    this.ctx = createRouterTestContext();
    this.au = this.ctx.container.get(Aurelia);
    this.router = this.ctx.container.get(IRouter);
    
    // Start without initial navigation
    await this.au.start();
    this.router.start(false);
  }

  async afterEach() {
    await this.au.stop();
    this.ctx.dispose();
  }
}
```

## Testing Routed Components

### Testing Component Loading and Lifecycle

```typescript
import { route, IRouteViewModel, Params } from '@aurelia/router';
import { RouterTestBase } from './router-test-base';

// Component under test
@route('product/:id')
export class ProductDetailComponent implements IRouteViewModel {
  public product: Product | null = null;
  public loading = false;
  public error: string | null = null;

  constructor(private productService: ProductService) {}

  async canLoad(params: Params): Promise<boolean> {
    const id = parseInt(params.id);
    return !isNaN(id) && id > 0;
  }

  async loading(params: Params): Promise<void> {
    this.loading = true;
    try {
      this.product = await this.productService.getProduct(params.id);
    } catch (error) {
      this.error = 'Failed to load product';
    } finally {
      this.loading = false;
    }
  }
}

// Tests
describe('ProductDetailComponent', () => {
  let testBase: RouterTestBase;
  let mockProductService: MockProductService;
  let component: ProductDetailComponent;

  beforeEach(async () => {
    testBase = new RouterTestBase();
    mockProductService = new MockProductService();
    
    // Register mock service
    testBase.ctx.container.register(
      Registration.instance(ProductService, mockProductService)
    );

    await testBase.beforeEach();
  });

  afterEach(async () => {
    await testBase.afterEach();
  });

  describe('canLoad', () => {
    it('should allow loading with valid product ID', async () => {
      component = testBase.ctx.container.get(ProductDetailComponent);
      
      const result = await component.canLoad({ id: '123' });
      
      expect(result).toBe(true);
    });

    it('should reject loading with invalid product ID', async () => {
      component = testBase.ctx.container.get(ProductDetailComponent);
      
      const result = await component.canLoad({ id: 'invalid' });
      
      expect(result).toBe(false);
    });
  });

  describe('loading', () => {
    beforeEach(() => {
      component = testBase.ctx.container.get(ProductDetailComponent);
    });

    it('should load product data successfully', async () => {
      const mockProduct = { id: 123, name: 'Test Product' };
      mockProductService.getProduct.mockResolvedValue(mockProduct);

      await component.loading({ id: '123' });

      expect(component.product).toEqual(mockProduct);
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should handle loading errors', async () => {
      mockProductService.getProduct.mockRejectedValue(new Error('API Error'));

      await component.loading({ id: '123' });

      expect(component.product).toBeNull();
      expect(component.error).toBe('Failed to load product');
      expect(component.loading).toBe(false);
    });
  });
});
```

### Testing Component with Router Dependencies

```typescript
import { ICurrentRoute, IRouter } from '@aurelia/router';

export class NavigationComponent {
  constructor(
    private router: IRouter,
    private currentRoute: ICurrentRoute
  ) {}

  async navigateToProduct(productId: string) {
    return this.router.load(`product/${productId}`);
  }

  get currentProductId(): string | null {
    const params = this.currentRoute.parameterInformation[0]?.params;
    return params?.id ?? null;
  }

  get isProductPage(): boolean {
    return this.currentRoute.path.startsWith('/product');
  }
}

// Test with mocked router
describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let mockRouter: jest.Mocked<IRouter>;
  let mockCurrentRoute: jest.Mocked<ICurrentRoute>;

  beforeEach(() => {
    mockRouter = {
      load: jest.fn(),
      isActive: jest.fn(),
      // ... other router methods
    } as any;

    mockCurrentRoute = {
      path: '/product/123',
      parameterInformation: [
        { params: { id: '123' }, config: null, viewport: null, children: [] }
      ],
      // ... other current route properties
    } as any;

    component = new NavigationComponent(mockRouter, mockCurrentRoute);
  });

  it('should navigate to product', async () => {
    mockRouter.load.mockResolvedValue(true);

    const result = await component.navigateToProduct('456');

    expect(mockRouter.load).toHaveBeenCalledWith('product/456');
    expect(result).toBe(true);
  });

  it('should get current product ID', () => {
    const productId = component.currentProductId;
    
    expect(productId).toBe('123');
  });

  it('should detect product page', () => {
    expect(component.isProductPage).toBe(true);
  });
});
```

## Testing Navigation Flows

### Testing Programmatic Navigation

```typescript
describe('Navigation Flows', () => {
  let testBase: RouterTestBase;

  beforeEach(async () => {
    testBase = new RouterTestBase();
    await testBase.beforeEach();
  });

  afterEach(async () => {
    await testBase.afterEach();
  });

  it('should navigate to route successfully', async () => {
    const success = await testBase.router.load('home');
    
    expect(success).toBe(true);
    
    // Verify current route
    const currentRoute = testBase.ctx.container.get(ICurrentRoute);
    expect(currentRoute.path).toBe('/home');
  });

  it('should handle navigation with parameters', async () => {
    const success = await testBase.router.load('product/123');
    
    expect(success).toBe(true);
    
    const currentRoute = testBase.ctx.container.get(ICurrentRoute);
    const params = currentRoute.parameterInformation[0]?.params;
    expect(params?.id).toBe('123');
  });

  it('should handle navigation with query parameters', async () => {
    const success = await testBase.router.load('search', {
      queryParams: { q: 'test', page: '2' }
    });
    
    expect(success).toBe(true);
    
    const currentRoute = testBase.ctx.container.get(ICurrentRoute);
    expect(currentRoute.query.get('q')).toBe('test');
    expect(currentRoute.query.get('page')).toBe('2');
  });

  it('should handle navigation failure', async () => {
    try {
      await testBase.router.load('non-existent-route');
      fail('Expected navigation to fail');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
```

### Testing Navigation Events

```typescript
import { IRouterEvents, NavigationStartEvent, NavigationEndEvent } from '@aurelia/router';

describe('Navigation Events', () => {
  let testBase: RouterTestBase;
  let routerEvents: IRouterEvents;
  let navigationStartSpy: jest.Mock;
  let navigationEndSpy: jest.Mock;

  beforeEach(async () => {
    testBase = new RouterTestBase();
    await testBase.beforeEach();
    
    routerEvents = testBase.ctx.container.get(IRouterEvents);
    navigationStartSpy = jest.fn();
    navigationEndSpy = jest.fn();

    routerEvents.subscribe('au:router:navigation-start', navigationStartSpy);
    routerEvents.subscribe('au:router:navigation-end', navigationEndSpy);
  });

  afterEach(async () => {
    await testBase.afterEach();
  });

  it('should emit navigation events', async () => {
    await testBase.router.load('home');

    expect(navigationStartSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'au:router:navigation-start',
        instructions: expect.any(Object)
      })
    );

    expect(navigationEndSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'au:router:navigation-end',
        instructions: expect.any(Object),
        finalInstructions: expect.any(Object)
      })
    );
  });
});
```

## Testing Router Hooks

### Testing Lifecycle Hooks

```typescript
import { lifecycleHooks, IRouteViewModel, Params, RouteNode } from '@aurelia/router';

@lifecycleHooks()
export class AuthenticationHook {
  constructor(private authService: AuthService) {}

  async canLoad(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    viewModel: IRouteViewModel
  ): Promise<boolean> {
    const requiresAuth = next.data?.requiresAuth ?? false;
    
    if (!requiresAuth) return true;
    
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (!isAuthenticated) {
      // Redirect to login
      next.router.load('login', {
        queryParams: { returnUrl: next.path }
      });
      return false;
    }
    
    return true;
  }
}

// Test the hook
describe('AuthenticationHook', () => {
  let hook: AuthenticationHook;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRouteNode: jest.Mocked<RouteNode>;
  let mockRouter: jest.Mocked<IRouter>;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: jest.fn()
    } as any;

    mockRouter = {
      load: jest.fn()
    } as any;

    mockRouteNode = {
      data: {},
      path: '/protected',
      router: mockRouter
    } as any;

    hook = new AuthenticationHook(mockAuthService);
  });

  it('should allow access to public routes', async () => {
    mockRouteNode.data = { requiresAuth: false };

    const result = await hook.canLoad({}, mockRouteNode, null, {} as any);

    expect(result).toBe(true);
    expect(mockAuthService.isAuthenticated).not.toHaveBeenCalled();
  });

  it('should allow access for authenticated users', async () => {
    mockRouteNode.data = { requiresAuth: true };
    mockAuthService.isAuthenticated.mockResolvedValue(true);

    const result = await hook.canLoad({}, mockRouteNode, null, {} as any);

    expect(result).toBe(true);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
  });

  it('should redirect unauthenticated users to login', async () => {
    mockRouteNode.data = { requiresAuth: true };
    mockAuthService.isAuthenticated.mockResolvedValue(false);

    const result = await hook.canLoad({}, mockRouteNode, null, {} as any);

    expect(result).toBe(false);
    expect(mockRouter.load).toHaveBeenCalledWith('login', {
      queryParams: { returnUrl: '/protected' }
    });
  });
});
```

## Testing Custom Attributes

### Testing `load` Custom Attribute

```typescript
import { LoadCustomAttribute } from '@aurelia/router';

describe('LoadCustomAttribute', () => {
  let testBase: RouterTestBase;
  let loadAttribute: LoadCustomAttribute;
  let mockElement: HTMLAnchorElement;

  beforeEach(async () => {
    testBase = new RouterTestBase();
    await testBase.beforeEach();

    mockElement = document.createElement('a');
    
    // Create load attribute with mocked element
    loadAttribute = testBase.ctx.container.get(LoadCustomAttribute);
    (loadAttribute as any)._el = mockElement;
  });

  afterEach(async () => {
    await testBase.afterEach();
  });

  it('should generate correct href for route', async () => {
    loadAttribute.route = 'product';
    loadAttribute.params = { id: '123' };
    
    loadAttribute.valueChanged();
    
    expect(mockElement.getAttribute('href')).toBe('/product/123');
  });

  it('should handle click events', async () => {
    const routerLoadSpy = jest.spyOn(testBase.router, 'load');
    loadAttribute.route = 'home';
    
    loadAttribute.valueChanged();
    
    // Simulate click
    const clickEvent = new MouseEvent('click', { bubbles: true });
    mockElement.dispatchEvent(clickEvent);
    
    expect(routerLoadSpy).toHaveBeenCalledWith('home');
  });
});
```

## Integration Testing

### Testing Full Application Flows

```typescript
import { tasksSettled } from '@aurelia/runtime';
import { CustomElement } from '@aurelia/runtime-html';

// App component with routing
@route({
  routes: [
    { path: '', redirectTo: 'home' },
    { path: 'home', component: HomeComponent },
    { path: 'product/:id', component: ProductDetailComponent },
    { path: 'login', component: LoginComponent }
  ]
})
@customElement({
  name: 'app',
  template: '<au-viewport></au-viewport>'
})
export class App {}

describe('App Integration', () => {
  let ctx: TestContext;
  let au: Aurelia;
  let router: IRouter;
  let host: HTMLElement;

  beforeEach(async () => {
    ctx = createRouterTestContext();
    au = ctx.container.get(Aurelia);
    router = ctx.container.get(IRouter);
    
    host = ctx.createElement('<app></app>');
    au.app({ host, component: App });
    
    await au.start();
    router.start(false);
  });

  afterEach(async () => {
    await au.stop();
    ctx.dispose();
  });

  it('should redirect to home on initial load', async () => {
    await router.load('');
    
    // Wait for navigation to complete
    await tasksSettled();
    
    expect(host.textContent).toContain('Home Component');
  });

  it('should navigate to product detail', async () => {
    await router.load('product/123');
    await tasksSettled();
    
    expect(host.textContent).toContain('Product 123');
  });

  it('should handle navigation with browser back/forward', async () => {
    // Navigate forward
    await router.load('product/123');
    await tasksSettled();
    
    await router.load('home');
    await tasksSettled();
    
    // Simulate browser back
    history.back();
    await tasksSettled();
    
    expect(host.textContent).toContain('Product 123');
  });
});
```

## Test Utilities and Helpers

### Router Test Utilities

```typescript
export class RouterTestUtils {
  static async waitForNavigation(router: IRouter): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!router.isNavigating) {
        resolve();
        return;
      }
      
      const events = router.container.get(IRouterEvents);
      const subscription = events.subscribe('au:router:navigation-end', () => {
        subscription.dispose();
        resolve();
      });
    });
  }

  static createMockRouteNode(overrides: Partial<RouteNode> = {}): RouteNode {
    return {
      path: '',
      finalPath: '',
      title: null,
      data: {},
      params: {},
      queryParams: new URLSearchParams(),
      fragment: '',
      children: [],
      ...overrides
    } as RouteNode;
  }

  static createMockCurrentRoute(overrides: Partial<ICurrentRoute> = {}): ICurrentRoute {
    return {
      path: '',
      url: '',
      title: '',
      query: new URLSearchParams(),
      parameterInformation: [],
      ...overrides
    } as ICurrentRoute;
  }
}
```

### Mock Services

```typescript
export class MockRouter implements Partial<IRouter> {
  public isNavigating = false;
  public routeTree: any = {};
  public currentTr: any = {};

  load = jest.fn().mockResolvedValue(true);
  isActive = jest.fn().mockReturnValue(false);
  generatePath = jest.fn().mockResolvedValue('');
  start = jest.fn();
  stop = jest.fn();
}

export class MockRouterEvents implements Partial<IRouterEvents> {
  private subscriptions = new Map<string, Function[]>();

  subscribe = jest.fn((event: string, callback: Function) => {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }
    this.subscriptions.get(event)!.push(callback);
    
    return {
      dispose: () => {
        const callbacks = this.subscriptions.get(event);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) callbacks.splice(index, 1);
        }
      }
    };
  });

  publish(event: any) {
    const callbacks = this.subscriptions.get(event.name) || [];
    callbacks.forEach(callback => callback(event));
  }
}
```

## Best Practices

### 1. Test Isolation
```typescript
// ✅ Good - Each test gets fresh router instance
beforeEach(async () => {
  testContext = createRouterTestContext();
  await testContext.beforeEach();
});

// ❌ Avoid - Shared router state between tests
const sharedRouter = new Router(); // Don't do this
```

### 2. Mock External Dependencies
```typescript
// ✅ Good - Mock services that router components depend on
beforeEach(() => {
  container.register(
    Registration.instance(ApiService, mockApiService)
  );
});

// ❌ Avoid - Using real services in unit tests
// This makes tests slow and brittle
```

### 3. Test Route Configuration
```typescript
// ✅ Good - Test route configuration separately
it('should configure routes correctly', () => {
  const config = MyApp.routes;
  
  expect(config).toContainEqual(
    expect.objectContaining({
      path: 'product/:id',
      component: ProductComponent
    })
  );
});
```

This comprehensive testing guide provides developers with the tools and patterns needed to thoroughly test routing functionality, addressing a critical gap in the router documentation.