# Fluent API for `createFixture`

Aurelia's testing library enhances the developer experience by offering a Fluent API for creating test fixtures. This API provides a more readable, flexible, and chainable way to set up component tests. With the Fluent API, you can incrementally build your test fixture, making the configuration of your tests more intuitive and maintainable.

## Understanding the Fluent API

The Fluent API for `createFixture` comprises a series of chainable methods that allow you to configure each aspect of your test fixture in a step-by-step manner. This methodical approach to building test fixtures is particularly beneficial when dealing with complex setups or when you need to express the configuration in a more descriptive way.

### Legacy Approach vs. Fluent API

Previously, creating a test fixture required passing all configuration parameters to the `createFixture` function in a single call, which could become unwieldy as the number of configurations grew:

```typescript
const { appHost, startPromise, tearDown } = await createFixture('<my-element></my-element>', class AppRoot {}, [Dependency1, Dependency2]).promise;
```

With the introduction of the Fluent API, you can now configure your test fixture using several self-explanatory methods, each responsible for a specific part of the setup:

```typescript
const fixture = createFixture
  .component(AppRoot)
  .deps(Dependency1, Dependency2)
  .html('<my-element></my-element>');
  
const { appHost, startPromise } = await fixture.build().start();
```

### Available Fluent API Methods

The Fluent API provides the following methods, which can be chained together to configure your test fixture:

- `.component(component: any)`: Specifies the root component class for the test fixture.
- `.deps(...dependencies: any[])`: Registers additional dependencies required by the test or the components under test.
- `.html(template: string | HTMLTemplateElement)`: Sets the HTML template for the test. This can be provided as a string literal, a tagged template literal, or an `HTMLTemplateElement`.
- `.build()`: Finalizes the configuration and builds the test fixture.
- `.start()`: Initializes the test fixture and returns a promise that resolves when the component is bound and attached.

### Fluent API in Action: Example Test

Consider you have a `MyCustomElement` that relies on `Dependency1` and `Dependency2`. The following example demonstrates how to use the Fluent API to create a test fixture for this component:

```typescript
import { MyCustomElement } from './my-custom-element';
import { Dependency1, Dependency2 } from './dependencies';
import { createFixture } from '@aurelia/testing';

describe('MyCustomElement', () => {
  it('renders correctly', async () => {
    // Incrementally configure the test fixture using the Fluent API
    const fixture = createFixture
      .component(MyCustomElement)
      .deps(Dependency1, Dependency2)
      .html('<my-custom-element></my-custom-element>');

    // Build and start the fixture
    const { appHost, startPromise } = await fixture.build();

    // Await the startPromise to ensure the component is fully initialized
    await startPromise;

    // Perform assertions on appHost to verify the correct rendering of MyCustomElement
    expect(appHost.querySelector('my-custom-element')).toBeDefined();
    expect(appHost.textContent).toContain('Expected content');

    // Additional assertions and test logic...
  });
});
```

In this example, the Fluent API clearly outlines each step of the test fixture setup. It begins by defining the component under test, registers any dependencies, and sets the HTML template. Finally, the fixture is built and started, and the test awaits the `startPromise` before performing assertions.

## Advantages of the Fluent API

The Fluent API offers several advantages over the traditional approach:

- **Readability**: The step-by-step configuration makes the test setup easier to read and understand.
- **Maintainability**: It's easier to update and maintain tests as configurations can be changed independently without affecting the entire setup.
- **Flexibility**: The API allows for dynamic adjustments to the test setup, accommodating various testing scenarios.

By employing the Fluent API, developers can write more coherent and expressive tests, enhancing the overall testing experience in Aurelia 2 applications.
