# Testing

Testing is an integral part of modern development, and Aurelia supports testing through helper methods and ways of instantiating the framework in a test environment. Aurelia supports numerous test runners, including Jest and Mocha, and the guiding test principles are the same.

When it comes to testing, Aurelia provides a testing package, `@aurelia/testing`, which comes with some helper functions, including a fixture creation method that allows you to instantiate components and handle setup and teardown.

When you test components and other view resources in Aurelia, you will write integration tests and query the DOM for changes to content. It is not quite a unit test because we are testing the behaviors of our code in the view. However, writing both integration and unit tests is highly recommended.

## Configuring the test environment

Because tests can be run in various environments, you must set this part up before running tests. Setting up the environment requires configuring the platform using the `setPlatform` method.

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);
```

This initialization code can be placed in a shared file that all your tests load or added to each test. The best approach to handle this is to create a function that you call to set this all up.

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

function bootstrapTestEnvironment() {
    const platform = new BrowserPlatform(window);
    setPlatform(platform);
    BrowserPlatform.set(globalThis, platform);
}
```

You can then call this function at the beginning of each new test to specify the environment for the tests to run.
