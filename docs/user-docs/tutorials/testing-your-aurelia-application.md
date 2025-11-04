# Testing Your Aurelia Application

Testing is a critical part of building reliable applications. This tutorial will guide you through testing Aurelia 2 applications, covering unit tests, component tests, and end-to-end tests.

## Table of Contents

1. [Setting Up Your Test Environment](#setting-up-your-test-environment)
2. [Unit Testing](#unit-testing)
3. [Component Testing](#component-testing)
4. [Testing with Dependency Injection](#testing-with-dependency-injection)
5. [Testing Router Integration](#testing-router-integration)
6. [End-to-End Testing](#end-to-end-testing)
7. [Best Practices](#best-practices)

## Setting Up Your Test Environment

Aurelia 2 applications typically use Jasmine or Mocha for unit and component tests. The `@aurelia/testing` package provides helpful utilities for testing Aurelia components.

### Installing Testing Dependencies

```bash
npm install --save-dev @aurelia/testing jasmine @types/jasmine karma karma-jasmine karma-chrome-launcher
```

For E2E testing with Playwright:

```bash
npm install --save-dev playwright @playwright/test
```

### Configuring Karma

Create a `karma.conf.js` file in your project root:

```javascript
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      { pattern: 'test/**/*.spec.js', type: 'module' }
    ],
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
};
```

## Unit Testing

Unit tests focus on testing individual functions and classes in isolation. Let's start with a simple service.

### Testing a Service

```typescript
// src/services/calculator.ts
import { DI } from '@aurelia/kernel';

export const ICalculator = DI.createInterface<ICalculator>(
  'ICalculator',
  x => x.singleton(Calculator)
);

export interface ICalculator extends Calculator {}

export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  multiply(a: number, b: number): number {
    return a * b;
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  }
}
```

```typescript
// src/services/calculator.spec.ts
import { Calculator } from './calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(calculator.add(-5, 3)).toBe(-2);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(calculator.multiply(4, 5)).toBe(20);
    });

    it('should return zero when multiplying by zero', () => {
      expect(calculator.multiply(5, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });
});
```

## Component Testing

Component testing verifies that your Aurelia components render correctly and respond to user interactions. The `@aurelia/testing` package provides the `TestContext` utility for this purpose.

### Testing a Simple Component

```typescript
// src/components/greeting.ts
import { customElement } from '@aurelia/runtime-html';

@customElement('greeting-component')
export class GreetingComponent {
  name = '';

  get greeting(): string {
    return this.name ? `Hello, ${this.name}!` : 'Hello, stranger!';
  }
}
```

```html
<!-- src/components/greeting.html -->
<div class="greeting">
  <input type="text" value.bind="name" placeholder="Enter your name">
  <p class="message">${greeting}</p>
</div>
```

```typescript
// src/components/greeting.spec.ts
import { TestContext } from '@aurelia/testing';
import { Aurelia } from '@aurelia/runtime-html';
import { GreetingComponent } from './greeting';

describe('GreetingComponent', () => {
  it('should display default greeting for empty name', async () => {
    const ctx = TestContext.create();
    const { container } = ctx;

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({
      component: GreetingComponent,
      host
    }).start();

    const message = host.querySelector('.message');
    expect(message?.textContent).toBe('Hello, stranger!');

    await au.stop(true);
  });

  it('should update greeting when name is entered', async () => {
    const ctx = TestContext.create();
    const { container, platform } = ctx;

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({
      component: GreetingComponent,
      host
    }).start();

    const component = au.root.controller.viewModel as GreetingComponent;
    const input = host.querySelector('input') as HTMLInputElement;
    const message = host.querySelector('.message');

    // Simulate user input
    component.name = 'Alice';
    platform.domQueue.flush();

    expect(message?.textContent).toBe('Hello, Alice!');

    await au.stop(true);
  });
});
```

### Creating a Test Fixture Helper

For complex components, create a reusable fixture helper:

```typescript
// src/test-helpers/create-fixture.ts
import { Constructable } from '@aurelia/kernel';
import { TestContext } from '@aurelia/testing';
import { Aurelia, IPlatform } from '@aurelia/runtime-html';

export async function createFixture<T extends Constructable>(
  Component: T,
  registrations: any[] = []
) {
  const ctx = TestContext.create();
  const { container, platform } = ctx;

  container.register(...registrations);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');

  await au.app({ component: Component, host }).start();

  return {
    ctx,
    au,
    host,
    component: au.root.controller.viewModel as InstanceType<T>,
    platform,
    container,
    async tearDown() {
      await au.stop(true);
    }
  };
}
```

Now you can simplify your tests:

```typescript
// src/components/greeting.spec.ts
import { createFixture } from '../test-helpers/create-fixture';
import { GreetingComponent } from './greeting';

describe('GreetingComponent', () => {
  it('should display default greeting', async () => {
    const { host, component, tearDown } = await createFixture(GreetingComponent);

    const message = host.querySelector('.message');
    expect(message?.textContent).toBe('Hello, stranger!');

    await tearDown();
  });

  it('should update greeting when name changes', async () => {
    const { host, component, platform, tearDown } = await createFixture(GreetingComponent);

    component.name = 'Bob';
    platform.domQueue.flush();

    const message = host.querySelector('.message');
    expect(message?.textContent).toBe('Hello, Bob!');

    await tearDown();
  });
});
```

## Testing with Dependency Injection

When testing components that use dependency injection, you can provide mock implementations.

### Component with Dependencies

```typescript
// src/services/user-service.ts
import { DI } from '@aurelia/kernel';

export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService)
);

export interface IUserService extends UserService {}

export class UserService {
  async getUser(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
}
```

```typescript
// src/components/user-profile.ts
import { customElement, resolve } from '@aurelia/runtime-html';
import { IUserService, User } from '../services/user-service';

@customElement('user-profile')
export class UserProfile {
  private userService = resolve(IUserService);

  user: User | null = null;
  loading = false;
  error = '';

  async loadUser(userId: number): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.user = await this.userService.getUser(userId);
    } catch (err) {
      this.error = 'Failed to load user';
    } finally {
      this.loading = false;
    }
  }
}
```

```html
<!-- src/components/user-profile.html -->
<div class="user-profile">
  <div if.bind="loading">Loading...</div>
  <div if.bind="error" class="error">${error}</div>
  <div if.bind="user" class="user-details">
    <h2>${user.name}</h2>
    <p>${user.email}</p>
  </div>
</div>
```

### Testing with Mock Services

```typescript
// src/components/user-profile.spec.ts
import { Registration } from '@aurelia/kernel';
import { createFixture } from '../test-helpers/create-fixture';
import { UserProfile } from './user-profile';
import { IUserService, User } from '../services/user-service';

class MockUserService {
  async getUser(id: number): Promise<User> {
    return {
      id,
      name: 'Test User',
      email: 'test@example.com'
    };
  }
}

describe('UserProfile', () => {
  it('should load and display user', async () => {
    const { host, component, platform, tearDown } = await createFixture(
      UserProfile,
      [Registration.singleton(IUserService, MockUserService)]
    );

    await component.loadUser(1);
    platform.domQueue.flush();

    expect(component.user).toBeDefined();
    expect(component.user?.name).toBe('Test User');
    expect(host.querySelector('.user-details h2')?.textContent).toBe('Test User');

    await tearDown();
  });

  it('should display error message on failure', async () => {
    class FailingUserService {
      async getUser(): Promise<User> {
        throw new Error('Network error');
      }
    }

    const { host, component, platform, tearDown } = await createFixture(
      UserProfile,
      [Registration.singleton(IUserService, FailingUserService)]
    );

    await component.loadUser(1);
    platform.domQueue.flush();

    expect(component.error).toBe('Failed to load user');
    expect(host.querySelector('.error')?.textContent).toBe('Failed to load user');

    await tearDown();
  });
});
```

## Testing Router Integration

Testing components that use the router requires setting up the router configuration.

```typescript
// src/components/navigation.spec.ts
import { Registration } from '@aurelia/kernel';
import { TestContext } from '@aurelia/testing';
import { Aurelia } from '@aurelia/runtime-html';
import { RouterConfiguration, IRouter } from '@aurelia/router';

describe('Navigation Component', () => {
  it('should navigate when link is clicked', async () => {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(RouterConfiguration);

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({
      component: AppRoot,
      host
    }).start();

    const router = container.get(IRouter);

    // Test navigation
    await router.load('/home');

    expect(router.currentRoute.path).toBe('/home');

    await au.stop(true);
  });
});
```

## End-to-End Testing

E2E tests verify that your entire application works correctly from a user's perspective. We'll use Playwright for E2E testing.

### Setting Up Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:9000',
  },
  webServer: {
    command: 'npm run dev',
    port: 9000,
    reuseExistingServer: true,
  },
});
```

### Writing E2E Tests

```typescript
// e2e/greeting.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Greeting Component', () => {
  test('should display and update greeting', async ({ page }) => {
    await page.goto('/');

    // Check initial state
    await expect(page.locator('.message')).toHaveText('Hello, stranger!');

    // Enter a name
    await page.locator('input[placeholder="Enter your name"]').fill('Alice');

    // Verify the greeting updates
    await expect(page.locator('.message')).toHaveText('Hello, Alice!');
  });
});
```

### Testing User Flows

```typescript
// e2e/user-profile.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Profile Flow', () => {
  test('should load and display user profile', async ({ page }) => {
    // Navigate to user profile page
    await page.goto('/users/1');

    // Wait for loading to complete
    await expect(page.locator('.user-profile')).toBeVisible();

    // Verify user details are displayed
    await expect(page.locator('.user-details h2')).toContainText('Test User');
    await expect(page.locator('.user-details p')).toContainText('test@example.com');
  });

  test('should display error on network failure', async ({ page }) => {
    // Intercept API call and return error
    await page.route('/api/users/*', route => {
      route.abort('failed');
    });

    await page.goto('/users/1');

    // Verify error message is displayed
    await expect(page.locator('.error')).toContainText('Failed to load user');
  });
});
```

## Best Practices

### 1. Keep Tests Focused

Each test should verify one specific behavior:

```typescript
// Good
it('should add two numbers', () => {
  expect(calculator.add(2, 3)).toBe(5);
});

it('should handle negative numbers', () => {
  expect(calculator.add(-5, 3)).toBe(-2);
});

// Avoid
it('should perform calculations', () => {
  expect(calculator.add(2, 3)).toBe(5);
  expect(calculator.multiply(2, 3)).toBe(6);
  expect(calculator.divide(6, 3)).toBe(2);
});
```

### 2. Use Descriptive Test Names

Test names should clearly describe what is being tested:

```typescript
// Good
it('should display error message when login fails', () => {
  // test code
});

// Avoid
it('should work', () => {
  // test code
});
```

### 3. Clean Up After Tests

Always clean up resources after tests:

```typescript
afterEach(async () => {
  await tearDown();
});
```

### 4. Mock External Dependencies

Isolate your tests by mocking external services:

```typescript
class MockApiService {
  async getData(): Promise<Data> {
    return { id: 1, value: 'test' };
  }
}
```

### 5. Test Edge Cases

Don't just test the happy path:

```typescript
describe('divide', () => {
  it('should divide positive numbers', () => {
    expect(calculator.divide(10, 2)).toBe(5);
  });

  it('should handle division by zero', () => {
    expect(() => calculator.divide(10, 0)).toThrow();
  });

  it('should handle negative divisors', () => {
    expect(calculator.divide(10, -2)).toBe(-5);
  });
});
```

### 6. Use Test Coverage Tools

Track your test coverage to identify untested code:

```bash
npm install --save-dev karma-coverage
```

Configure in `karma.conf.js`:

```javascript
module.exports = function(config) {
  config.set({
    // ...
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    }
  });
};
```

### 7. Organize Tests by Feature

Structure your test files to mirror your source code:

```
src/
  components/
    user-profile.ts
    user-profile.html
    user-profile.spec.ts
  services/
    user-service.ts
    user-service.spec.ts
```

## Conclusion

Testing is essential for building reliable Aurelia applications. This tutorial covered:

- Setting up your test environment with Jasmine and Karma
- Writing unit tests for services
- Testing components with `@aurelia/testing`
- Mocking dependencies with dependency injection
- Testing router integration
- End-to-end testing with Playwright
- Best practices for writing maintainable tests

Start by testing critical business logic, then expand coverage to components and user flows. Remember to run tests regularly during development and as part of your CI/CD pipeline.

For more information, check out the official [Aurelia Documentation](https://docs.aurelia.io/) and the [@aurelia/testing API reference](https://docs.aurelia.io/api/testing/).
