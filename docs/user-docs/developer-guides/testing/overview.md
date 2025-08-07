# Testing

Testing is integral to modern software development, ensuring that your code behaves as expected in various scenarios. Aurelia 2 facilitates testing by providing helper methods and utilities to instantiate the framework in a test environment. While Aurelia supports different test runners, such as Jest and Mocha, the core testing principles remain consistent across these tools.

Aurelia's dedicated testing library, `@aurelia/testing`, offers helpful functions for testing, including fixture creation methods that instantiate components with ease and handle both setup and teardown processes.

In Aurelia, testing often involves integration tests where you interact with the DOM and observe changes to content, rather than pure unit tests, which focus solely on isolated logic. It's important to test the behavior of code within the context of the view, but unit testing individual pieces of logic is also highly recommended for a comprehensive test suite.

## Core Testing Concepts

### Fixtures
Fixtures are isolated test environments that provide a complete Aurelia application context. They handle component instantiation, dependency injection, lifecycle management, and cleanup.

### Test Context
The `TestContext` provides access to the DOM platform, document, and Aurelia services within your tests. It encapsulates the browser environment for testing.

### Assertions
Aurelia testing provides specialized assertion methods for DOM content, component state, and behavior verification that work seamlessly with the framework's binding system.

## Configuring the Test Environment

Setting up a consistent test environment is crucial to ensure tests run correctly in different environments. This setup involves initializing the Aurelia platform using the `setPlatform` method and configuring the Aurelia application's environment to operate within the test runner.

### Initialization Code

Place the following initialization code in a shared file to be loaded by all your tests, or include it in each individual test suite:

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';
import { IPlatform } from '@aurelia/runtime-html';

// This function sets up the Aurelia environment for testing
export function bootstrapTestEnvironment() {
    const platform = new BrowserPlatform(window);
    setPlatform(platform);
    BrowserPlatform.set(globalThis, platform);
}

// Alternative setup for environments with different platform requirements
export function bootstrapTestEnvironmentWithPlatform(platform: IPlatform) {
    setPlatform(platform);
}
```

### Using the Initialization Function

By creating the `bootstrapTestEnvironment` function, you can easily initialize the test environment at the beginning of each test suite. This approach ensures consistency and reduces code duplication:

```typescript
import { bootstrapTestEnvironment } from './path-to-your-initialization-code';

beforeAll(() => {
    // Initialize the test environment before running the tests
    bootstrapTestEnvironment();
});

// ... your test suites
```

With your test environment configured, you can now focus on writing effective tests for your Aurelia components, ensuring that they perform as intended under various conditions.

### Complete Test Environment Setup Examples

Here are practical examples of how to implement `bootstrapTestEnvironment` in different testing scenarios:

#### Jest Setup (Recommended)

Create a dedicated test setup file that runs before all tests:

{% code title="test-setup.ts" %}
```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

// Global test environment setup
export function bootstrapTestEnvironment(): void {
    // Only initialize if not already done
    if (!(globalThis as any).__aureliaTestPlatform__) {
        const platform = new BrowserPlatform(window);
        setPlatform(platform);
        BrowserPlatform.set(globalThis, platform);
        (globalThis as any).__aureliaTestPlatform__ = platform;
    }
}

// Call immediately for global setup
bootstrapTestEnvironment();
```
{% endcode %}

Configure Jest to use this setup file in your `jest.config.js`:

```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  testEnvironment: 'jsdom',
  // ... other config
};
```

#### Mocha/Vitest Setup

For Mocha or Vitest, create a similar setup file:

{% code title="test-bootstrap.ts" %}
```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

let testPlatform: BrowserPlatform | null = null;

export function bootstrapTestEnvironment(): void {
    if (!testPlatform) {
        testPlatform = new BrowserPlatform(window);
        setPlatform(testPlatform);
        BrowserPlatform.set(globalThis, testPlatform);
    }
}

export function cleanupTestEnvironment(): void {
    // Optional cleanup for test isolation
    testPlatform = null;
}

// Auto-setup
bootstrapTestEnvironment();
```
{% endcode %}

#### Per-Test-Suite Setup

If you prefer to set up the environment per test suite:

```typescript
import { bootstrapTestEnvironment } from './test-bootstrap';
import { createFixture } from '@aurelia/testing';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  beforeAll(() => {
    bootstrapTestEnvironment();
  });

  it('should render correctly', async () => {
    const { appHost, startPromise, stop } = createFixture(
      '<my-component></my-component>',
      class App {},
      [MyComponent]
    );

    await startPromise;
    expect(appHost.textContent).toContain('Expected content');
    await stop(true);
  });
});
```

### Environment Setup Best Practices

1. **Call Once**: Set up the environment once globally, not per test
2. **Use Guards**: Prevent multiple initializations with guard conditions
3. **Test Runner Integration**: Use your test runner's setup hooks for automatic initialization
4. **Error Handling**: Handle platform setup errors gracefully

### Troubleshooting Common Issues

**"Platform not set" error:**
```typescript
// Ensure bootstrapTestEnvironment() is called before createFixture
bootstrapTestEnvironment();
const fixture = createFixture(...);
```

**"Window is not defined" in Node.js:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom' // Provides window object
};
```

**Multiple platform initialization errors:**
```typescript
// Use a guard to prevent re-initialization
if (!(globalThis as any).__aureliaTestPlatform__) {
  bootstrapTestEnvironment();
}
```

## Essential Testing Imports

For most Aurelia tests, you'll need these core imports:

```typescript
// Core testing utilities
import { createFixture, TestContext } from '@aurelia/testing';

// For dependency registration and mocking
import { Registration } from '@aurelia/kernel';

// For async testing with task queues
import { queueTask, runTasks, tasksSettled } from '@aurelia/runtime';

// Your components and services
import { MyComponent } from './my-component';
import { MyService } from './my-service';
```

## Basic Test Structure

A typical Aurelia test follows this pattern:

```typescript
describe('MyComponent', () => {
  beforeAll(() => {
    bootstrapTestEnvironment();
  });

  it('should render correctly', async () => {
    // Arrange: Create the fixture
    const { component, startPromise, stop } = createFixture(
      '<my-component value.bind="testValue"></my-component>',
      class App { testValue = 'Hello World'; },
      [MyComponent] // Dependencies
    );

    // Act: Start the application
    await startPromise;

    // Assert: Verify the results
    expect(component.textContent).toContain('Hello World');

    // Cleanup: Always dispose of the fixture
    await stop(true);
  });
});
```

## Next Steps

Now that you understand the basics, explore the specific testing guides:

- [Testing Components](testing-components.md) - Component integration testing
- [Testing Attributes](testing-attributes.md) - Custom attribute testing
- [Testing Value Converters](testing-value-converters.md) - Value converter testing
- [Fluent API](fluent-api.md) - Advanced fixture creation
- [Mocks and Spies](mocks-spies.md) - Dependency mocking strategies
