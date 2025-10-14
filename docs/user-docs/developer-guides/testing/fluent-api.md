# Fluent API for `createFixture`

Aurelia's testing library enhances the developer experience by offering a Fluent API for creating test fixtures. This API provides a more readable, flexible, and chainable way to set up component tests. With the Fluent API, you can incrementally build your test fixture, making the configuration of your tests more intuitive and maintainable.

## Understanding the Fluent API

The Fluent API for `createFixture` comprises a series of chainable methods that allow you to configure each aspect of your test fixture in a step-by-step manner. This methodical approach to building test fixtures is particularly beneficial when dealing with complex setups or when you need to express the configuration in a more descriptive way.

### Legacy Approach vs. Fluent API

Previously, creating a test fixture required passing all configuration parameters to the `createFixture` function in a single call, which could become unwieldy as the number of configurations grew:

```typescript
// Legacy approach - still works
const { appHost, startPromise, stop } = createFixture(
  '<my-element></my-element>', 
  class AppRoot {}, 
  [Dependency1, Dependency2]
);
```

With the introduction of the Fluent API, you can now configure your test fixture using several self-explanatory methods, each responsible for a specific part of the setup:

```typescript
// Fluent API approach
const fixture = createFixture
  .component(AppRoot)
  .deps(Dependency1, Dependency2)
  .html('<my-element></my-element>')
  .build(); // build() must be called to create the fixture
  
const { appHost, startPromise, stop } = fixture;
await startPromise; // Wait for the fixture to be ready
```

### Available Fluent API Methods

The Fluent API provides the following methods, which can be chained together to configure your test fixture:

- `.component<T>(component: T, definition?: Partial<PartialCustomElementDefinition>)`: Specifies the root component class for the test fixture. Optionally accepts a custom element definition.
- `.deps(...dependencies: any[])`: Registers additional dependencies required by the test or the components under test.
- `.html(template: string)`: Sets the HTML template for the test as a string.
- `.html(template: TemplateStringsArray, ...values: any[])`: Sets the HTML template using tagged template literals with interpolation.
- `.config(config: IFixtureConfig)`: Sets fixture configuration options.
- `.build()`: **Required** - Finalizes the configuration and builds the test fixture. Returns an `IFixture<T>` object.

**Note**: The `.build()` method is required to create the fixture. The fixture starts automatically unless you specify otherwise.

### Fluent API in Action: Example Test

Consider you have a `MyCustomElement` that relies on `Dependency1` and `Dependency2`. The following example demonstrates how to use the Fluent API to create a test fixture for this component:

```typescript
import { MyCustomElement } from './my-custom-element';
import { Dependency1, Dependency2 } from './dependencies';
import { createFixture } from '@aurelia/testing';

describe('MyCustomElement', () => {
  it('renders correctly', async () => {
    // Incrementally configure the test fixture using the Fluent API
    const { appHost, startPromise, stop } = createFixture
      .component(MyCustomElement)
      .deps(Dependency1, Dependency2)
      .html('<my-custom-element></my-custom-element>')
      .build(); // build() is required

    // Await the startPromise to ensure the component is fully initialized
    await startPromise;

    // Perform assertions on appHost to verify the correct rendering of MyCustomElement
    expect(appHost.querySelector('my-custom-element')).toBeDefined();
    expect(appHost.textContent).toContain('Expected content');

    // Always clean up
    await stop(true);
  });
});
```

In this example, the Fluent API clearly outlines each step of the test fixture setup. It begins by defining the component under test, registers any dependencies, and sets the HTML template. Finally, the fixture is built and started, and the test awaits the `startPromise` before performing assertions.

## Advantages of the Fluent API

The Fluent API offers several advantages over the traditional approach:

- **Readability**: The step-by-step configuration makes the test setup easier to read and understand.
- **Maintainability**: It's easier to update and maintain tests as configurations can be changed independently without affecting the entire setup.
- **Flexibility**: The API allows for dynamic adjustments to the test setup, accommodating various testing scenarios.
- **Type Safety**: The fluent API provides better TypeScript support with proper type inference for components.
- **Template Interpolation**: Support for tagged template literals with component property access.

By employing the Fluent API, developers can write more coherent and expressive tests, enhancing the overall testing experience in Aurelia 2 applications.

## Advanced Fluent API Examples

### Using Tagged Template Literals

```typescript
const { appHost, startPromise, stop } = createFixture
  .component(class App { message = 'Hello'; })
  .html`<div>${vm => vm.message} World</div>`
  .build();

await startPromise;
expect(appHost.textContent).toBe('Hello World');
await stop(true);
```

### With Custom Element Definition

```typescript
const { appHost, startPromise, stop } = createFixture
  .component(MyComponent, { 
    name: 'custom-name',
    containerless: true 
  })
  .deps(ServiceA, ServiceB)
  .html('<custom-name></custom-name>')
  .build();
```

### With Configuration Options

```typescript
const { appHost, startPromise, stop } = createFixture
  .component(FormComponent)
  .config({ allowActionlessForm: true })
  .html('<form><button type="submit">Submit</button></form>')
  .build();
```

### Alternative Entry Points

The fluent API can be started from different methods:

```typescript
// Start with HTML
const fixture1 = createFixture
  .html('<div>Test</div>')
  .component(MyComponent)
  .build();

// Start with component
const fixture2 = createFixture
  .component(MyComponent)
  .html('<my-component></my-component>')
  .build();

// Start with dependencies
const fixture3 = createFixture
  .deps(ServiceA, ServiceB)
  .component(MyComponent)
  .html('<my-component></my-component>')
  .build();
```

**Important**: You must call `.html()` and `.build()` to create a valid fixture. Other methods are optional and can appear in any order.
