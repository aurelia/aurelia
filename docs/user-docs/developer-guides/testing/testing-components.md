# Testing Components

Testing components in Aurelia 2 is a straightforward process thanks to the framework's design and the utilities provided by the `@aurelia/testing` package. This guide will walk you through the steps to test your components effectively, ensuring they work as expected within the context of a view.

In Aurelia, a component typically consists of a view (HTML) and a view model (JavaScript or TypeScript). To ensure the quality and correctness of your components, you should write tests that cover both aspects. Testing components involves checking that the view renders correctly with given data and that the view model behaves as intended when interacting with the view.

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

We aim to test that the `PersonDetail` component renders the expected text when provided with `name` and `age` properties.

#### Test Setup

Before writing the test, ensure your environment is correctly set up for testing. Refer to the [Overview](developer-guides/testing/overview.md) section for details on how to initialize the Aurelia testing platform.

#### Test Implementation

Create a test file for your component, such as `person-detail.spec.ts`, and implement your tests using the syntax of your chosen test runner. The following example uses Jest:

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

## Advanced Testing Patterns

### Testing Component Lifecycle

Components have lifecycle hooks that can be tested to ensure proper behavior:

```typescript
export class LifecycleComponent {
  created(): void {
    this.initializeData();
  }

  attached(): void {
    this.setupEventListeners();
  }

  detached(): void {
    this.cleanupEventListeners();
  }

  initializeData(): void {
    // initialization logic
  }

  setupEventListeners(): void {
    // event setup logic
  }

  cleanupEventListeners(): void {
    // cleanup logic
  }
}
```

Test the lifecycle hooks:

```typescript
describe('LifecycleComponent', () => {
  it('calls lifecycle hooks in correct order', async () => {
    const initializeSpy = jest.spyOn(LifecycleComponent.prototype, 'initializeData');
    const setupSpy = jest.spyOn(LifecycleComponent.prototype, 'setupEventListeners');
    const cleanupSpy = jest.spyOn(LifecycleComponent.prototype, 'cleanupEventListeners');

    const { tearDown } = createFixture(
      '<lifecycle-component></lifecycle-component>',
      class App {},
      [LifecycleComponent]
    );

    await startPromise;

    expect(initializeSpy).toHaveBeenCalled();
    expect(setupSpy).toHaveBeenCalled();
    expect(cleanupSpy).not.toHaveBeenCalled();

    await tearDown();

    expect(cleanupSpy).toHaveBeenCalled();
  });
});
```

### Testing Component Events and Communication

Test components that emit custom events:

```typescript
import { EventAggregator } from 'aurelia';

export class EventComponent {
  constructor(private ea: EventAggregator) {}

  @bindable item: any;

  handleClick(): void {
    this.ea.publish('item-selected', this.item);
  }
}
```

Test event publishing:

```typescript
describe('EventComponent', () => {
  it('publishes event when clicked', async () => {
    const mockEA = {
      publish: jest.fn()
    };

    const { component, startPromise, tearDown } = createFixture(
      '<event-component item.bind="testItem"></event-component>',
      class App {
        testItem = { id: 1, name: 'Test' };
      },
      [EventComponent],
      [Registration.instance(EventAggregator, mockEA)]
    );

    await startPromise;

    const button = component.querySelector('button');
    button.click();

    expect(mockEA.publish).toHaveBeenCalledWith('item-selected', { id: 1, name: 'Test' });

    await tearDown();
  });
});
```

### Testing Async Operations

Test components with async operations using task queue utilities:

```typescript
import { queueTask, tasksSettled } from '@aurelia/runtime';

export class AsyncComponent {
  @bindable loading = false;
  @bindable data: any[] = [];

  async loadData(): Promise<void> {
    this.loading = true;
    
    try {
      const response = await this.dataService.fetchData();
      this.data = response.data;
    } finally {
      this.loading = false;
    }
  }
}
```

Test async operations:

```typescript
describe('AsyncComponent', () => {
  it('handles async data loading', async () => {
    const mockDataService = {
      fetchData: jest.fn().mockResolvedValue({ data: [1, 2, 3] })
    };

    const { component, startPromise, tearDown } = createFixture(
      '<async-component></async-component>',
      class App {},
      [AsyncComponent],
      [Registration.instance(DataService, mockDataService)]
    );

    await startPromise;

    const componentInstance = component.querySelector('async-component').au.controller.viewModel;
    
    // Start the async operation
    const loadPromise = componentInstance.loadData();
    
    // Verify loading state
    expect(componentInstance.loading).toBe(true);
    
    // Wait for completion
    await loadPromise;
    await tasksSettled();
    
    // Verify final state
    expect(componentInstance.loading).toBe(false);
    expect(componentInstance.data).toEqual([1, 2, 3]);
    expect(mockDataService.fetchData).toHaveBeenCalled();

    await tearDown();
  });
});
```

### Testing State Management Integration

Test components that use state management:

```typescript
import { fromState, StateBinding } from '@aurelia/state';

export class StateComponent {
  @fromState(state => state.user.name)
  userName: string;

  @fromState(state => state.user.isLoggedIn)
  isLoggedIn: boolean;
}
```

Test state bindings:

```typescript
describe('StateComponent', () => {
  it('updates when state changes', async () => {
    const mockStore = {
      state: {
        user: { name: 'John', isLoggedIn: true }
      },
      subscribe: jest.fn(),
      dispatch: jest.fn()
    };

    const { component, startPromise, tearDown } = createFixture(
      '<state-component></state-component>',
      class App {},
      [StateComponent],
      [Registration.instance(Store, mockStore)]
    );

    await startPromise;

    const componentInstance = component.querySelector('state-component').au.controller.viewModel;
    
    expect(componentInstance.userName).toBe('John');
    expect(componentInstance.isLoggedIn).toBe(true);

    await tearDown();
  });
});
```

### Testing Conditional Rendering

Test components with conditional rendering logic:

```typescript
export class ConditionalComponent {
  @bindable showContent = false;
  @bindable items: any[] = [];

  get hasItems(): boolean {
    return this.items && this.items.length > 0;
  }
}
```

With template:

```html
<template>
  <div if.bind="showContent">
    <p if.bind="hasItems">Found ${items.length} items</p>
    <p else>No items found</p>
  </div>
</template>
```

Test conditional rendering:

```typescript
describe('ConditionalComponent', () => {
  it('shows content based on conditions', async () => {
    const { component, startPromise, tearDown } = createFixture(
      '<conditional-component show-content.bind="show" items.bind="itemList"></conditional-component>',
      class App {
        show = false;
        itemList: any[] = [];
      },
      [ConditionalComponent]
    );

    await startPromise;

    // Initially hidden
    expect(component.textContent).not.toContain('Found');
    expect(component.textContent).not.toContain('No items');

    // Show content with no items
    const app = component.querySelector('conditional-component').au.controller.viewModel;
    app.showContent = true;
    await tasksSettled();

    expect(component.textContent).toContain('No items found');

    // Add items
    app.items = [1, 2, 3];
    await tasksSettled();

    expect(component.textContent).toContain('Found 3 items');

    await tearDown();
  });
});
```

### Testing Component Performance

Test component render performance and memory usage:

```typescript
describe('PerformanceComponent', () => {
  it('renders within acceptable time limits', async () => {
    const startTime = performance.now();

    const { startPromise, tearDown } = createFixture(
      '<performance-component items.bind="largeDataSet"></performance-component>',
      class App {
        largeDataSet = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `Item ${i}` }));
      },
      [PerformanceComponent]
    );

    await startPromise;

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(100); // Should render in under 100ms

    await tearDown();
  });

  it('does not leak memory on repeated renders', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize;
    
    for (let i = 0; i < 10; i++) {
      const { startPromise, tearDown } = createFixture(
        '<performance-component></performance-component>',
        class App {},
        [PerformanceComponent]
      );

      await startPromise;
      await tearDown();
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = performance.memory?.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
  });
});
```

## Best Practices for Advanced Testing

### 1. **Test Organization**
- Group related tests using `describe` blocks
- Use descriptive test names that explain the behavior being tested
- Follow the AAA pattern: Arrange, Act, Assert

### 2. **Async Testing**
- Always use `await` with `startPromise` and `tearDown()`
- Use `tasksSettled()` when testing async operations
- Handle promise rejections properly in tests

### 3. **Mocking Strategies**
- Mock external dependencies using `Registration.instance`
- Use Jest spies to verify method calls
- Mock only what's necessary for the test

### 4. **Performance Testing**
- Use `performance.now()` for timing measurements
- Test with realistic data sizes
- Monitor memory usage in long-running tests

### 5. **Error Handling**
- Test both success and failure scenarios
- Verify error messages and error states
- Test error recovery mechanisms

## Conclusion

Testing Aurelia components involves setting up a test environment, creating fixtures, and writing assertions based on your expectations. By following these patterns and best practices, you can ensure that your components are reliable, performant, and maintainable. Remember to clean up after your tests to maintain a clean test environment and to avoid any side effects between tests.

The advanced patterns shown here cover lifecycle testing, event handling, async operations, state management, conditional rendering, and performance testing. These techniques will help you create comprehensive test suites that cover the full functionality of your Aurelia components.
