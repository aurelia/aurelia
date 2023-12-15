# Testing

Testing is integral to modern software development, ensuring that your code behaves as expected in various scenarios. Aurelia 2 facilitates testing by providing helper methods and utilities to instantiate the framework in a test environment. While Aurelia supports different test runners, such as Jest and Mocha, the core testing principles remain consistent across these tools.

Aurelia's dedicated testing library, `@aurelia/testing`, offers helpful functions for testing, including fixture creation methods that instantiate components with ease and handle both setup and teardown processes.

In Aurelia, testing often involves integration tests where you interact with the DOM and observe changes to content, rather than pure unit tests, which focus solely on isolated logic. It's important to test the behavior of code within the context of the view, but unit testing individual pieces of logic is also highly recommended for a comprehensive test suite.

## Configuring the Test Environment

Setting up a consistent test environment is crucial to ensure tests run correctly in different environments. This setup involves initializing the Aurelia platform using the `setPlatform` method and configuring the Aurelia application's environment to operate within the test runner.

### Initialization Code

Place the following initialization code in a shared file to be loaded by all your tests, or include it in each individual test suite:

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

// This function sets up the Aurelia environment for testing
export function bootstrapTestEnvironment() {
    const platform = new BrowserPlatform(window);
    setPlatform(platform);
    BrowserPlatform.set(globalThis, platform);
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
