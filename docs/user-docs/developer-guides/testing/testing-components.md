# Testing Components

Testing components in Aurelia 2 is a straightforward process thanks to the framework's design and the utilities provided by the `@aurelia/testing` package. This guide will walk you through the steps to test your components effectively, ensuring they work as expected within the context of a view.

In Aurelia 2, a component typically consists of a view (HTML) and a view model (JavaScript or TypeScript). To ensure the quality and correctness of your components, you should write tests that cover both aspects. Testing components involves checking that the view renders correctly with given data and that the view model behaves as intended when interacting with the view.

## Testing Strategy

When testing components, we will focus on integration tests that involve both the view and view model. This approach allows us to verify the component as a whole, as it would function within an Aurelia application.

### Example Component

For demonstration purposes, we will use a simple `PersonDetail` component with bindable properties `name` and `age`.

{% code title="person-detail.ts" %}
```typescript
import { bindable } from 'aurelia';

export class PersonDetail {
    @bindable name: string;
    @bindable age: number;
}
```
{% endcode %}

{% code title="person-detail.html" %}
```html
<template>
    <p>Person is called ${name} and is ${age} years old.</p>
</template>
```
{% endcode %}

### Writing the Test

Our goal is to test that the `PersonDetail` component renders the expected text when provided with `name` and `age` properties.

#### Test Setup

Before writing the actual test, make sure that your environment is correctly set up for testing. Refer to the [Configuring the Test Environment](#configuring-the-test-environment) section for details on how to initialize the Aurelia testing platform.

#### Test Implementation

Create a test file for your component, such as `person-detail.spec.ts`, and implement your tests using your chosen test runner's syntax. The following example uses Jest:

```typescript
import { createFixture } from '@aurelia/testing';
import { PersonDetail } from './person-detail';
import { bootstrapTestEnvironment } from './path-to-your-initialization-code';

describe('PersonDetail component', () => {
  beforeAll(() => {
    // Initialize the test environment before running the tests
    bootstrapTestEnvironment();
  });

  it('renders the name and age correctly', async () => {
    const { component, startPromise, tearDown } = createFixture(
      '<person-detail name.bind="testName" age.bind="testAge"></person-detail>',
      class App {
        testName = 'Alice';
        testAge = 30;
      },
      [PersonDetail]
    );

    await startPromise;

    expect(component.textContent).toContain('Person is called Alice and is 30 years old.');

    await tearDown();
  });

  // Additional tests...
});
```

In this example, `createFixture` is used to instantiate the component with a test context, binding `name` and `age` to specified values. We then assert that the component's text content includes the correct information. After the test completes, `tearDown` cleans up the component instance to avoid memory leaks and ensure test isolation.

## Testing Components with Dependencies

If your component has dependencies, such as services or other custom elements, you'll need to register these within the Aurelia testing container.

### Example with a Dependency

Assume `PersonDetail` depends on a `PersonFormatter` service:

```typescript
import { inject } from 'aurelia';
import { PersonFormatter } from './person-formatter';

@inject(PersonFormatter)
export class PersonDetail {
    @bindable name: string;
    @bindable age: number;

    constructor(private personFormatter: PersonFormatter) {}

    get formattedDetails() {
        return this.personFormatter.format(this.name, this.age);
    }
}
```

To test this component, you can create a mock `PersonFormatter` and register it with the Aurelia container:

```typescript
import { createFixture, Registration } from '@aurelia/testing';
import { PersonDetail } from './person-detail';
import { PersonFormatter } from './person-formatter';

describe('PersonDetail with PersonFormatter dependency', () => {
  it('formats the details using PersonFormatter', async () => {
    const mockPersonFormatter = {
      format: jest.fn().mockImplementation((name, age) => `Formatted: ${name}, age ${age}`),
    };

    const { component, startPromise, tearDown } = createFixture(
      '<person-detail name.bind="testName" age.bind="testAge"></person-detail>',
      class App {
        testName = 'Bob';
        testAge = 40;
      },
      [PersonDetail],
      [Registration.instance(PersonFormatter, mockPersonFormatter)]
    );

    await startPromise;

    expect(mockPersonFormatter.format).toHaveBeenCalledWith('Bob', 40);
    expect(component.textContent).toContain('Formatted: Bob, age 40');

    await tearDown();
  });
});
```

In the test above, we use Jest's `jest.fn()` to create a mock implementation of `PersonFormatter`. We then verify that the mock's `format` method is called with the correct arguments and that the component's text content includes the formatted details.

## Conclusion

Testing Aurelia 2 components involves setting up a test environment, creating fixtures, and writing assertions based on your expectations. By following these steps and best practices, you can ensure that your components are reliable and maintainable. Remember to clean up after your tests to maintain a clean test environment and to avoid any side effects between tests.
