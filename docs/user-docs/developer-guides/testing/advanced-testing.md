# Advanced Testing Techniques

This guide covers advanced testing patterns, utilities, and techniques for comprehensive Aurelia 2 application testing. It builds upon the foundation provided in the basic testing guides and explores sophisticated testing scenarios.

## Comprehensive Fixture API Reference

The `createFixture` function returns a powerful fixture object with extensive testing utilities. Understanding all available methods enables more effective and expressive tests.

### Complete Fixture Interface

```typescript
interface IFixture<T> {
  // Core properties
  appHost: HTMLElement;           // Root element containing your app
  startPromise: Promise<void>;    // Promise that resolves when app starts
  stop: (dispose?: boolean) => Promise<void>; // Cleanup function
  component: T;                   // Root component instance
  container: IContainer;          // DI container for registrations
  platform: IPlatform;           // Platform abstraction
  testContext: TestContext;       // Test context utilities

  // Query methods
  getBy<E extends HTMLElement = HTMLElement>(selector: string): E;
  getAllBy<E extends HTMLElement = HTMLElement>(selector: string): E[];
  queryBy<E extends HTMLElement = HTMLElement>(selector: string): E | null;

  // Assertion methods
  assertText(expectedText: string, options?: ITextAssertOptions): void;
  assertText(selector: string, expectedText: string, options?: ITextAssertOptions): void;
  assertTextContain(expectedText: string): void;
  assertTextContain(selector: string, expectedText: string): void;
  assertHtml(expectedHtml: string, options?: IHtmlAssertOptions): void;
  assertHtml(selector: string, expectedHtml: string, options?: IHtmlAssertOptions): void;
  assertAttr(selector: string, attr: string, expectedValue: string | null): void;
  assertAttrNS(selector: string, namespace: string, attr: string, expectedValue: string | null): void;
  assertClass(selector: string, ...expectedClasses: string[]): void;
  assertClassStrict(selector: string, ...expectedClasses: string[]): void;
  assertStyles(selector: string, expectedStyles: Record<string, string>): void;
  assertValue(selector: string, expectedValue: string): void;
  assertChecked(selector: string, expectedChecked: boolean): void;

  // Event methods
  trigger: IEventTrigger;
  type(selector: string | HTMLElement, text: string): void;
  scrollBy(selector: string | HTMLElement, options: number | ScrollOptions): void;

  // Utility methods
  printHtml(): string;
  createEvent(type: string, init?: EventInit): Event;
  hJsx(tag: string, attrs?: Record<string, any>, ...children: any[]): HTMLElement;
}
```

### Event Triggering Interface

```typescript
interface IEventTrigger {
  // Generic event triggering
  (selector: string | HTMLElement, eventType: string, init?: EventInit): void;
  
  // Specific event methods
  click(selector: string | HTMLElement, init?: MouseEventInit): void;
  dblclick(selector: string | HTMLElement, init?: MouseEventInit): void;
  mousedown(selector: string | HTMLElement, init?: MouseEventInit): void;
  mouseup(selector: string | HTMLElement, init?: MouseEventInit): void;
  mousemove(selector: string | HTMLElement, init?: MouseEventInit): void;
  mouseover(selector: string | HTMLElement, init?: MouseEventInit): void;
  mouseout(selector: string | HTMLElement, init?: MouseEventInit): void;
  mouseenter(selector: string | HTMLElement, init?: MouseEventInit): void;
  mouseleave(selector: string | HTMLElement, init?: MouseEventInit): void;
  
  keydown(selector: string | HTMLElement, init?: KeyboardEventInit): void;
  keyup(selector: string | HTMLElement, init?: KeyboardEventInit): void;
  keypress(selector: string | HTMLElement, init?: KeyboardEventInit): void;
  
  focus(selector: string | HTMLElement, init?: FocusEventInit): void;
  blur(selector: string | HTMLElement, init?: FocusEventInit): void;
  
  change(selector: string | HTMLElement, init?: EventInit): void;
  input(selector: string | HTMLElement, init?: EventInit): void;
  submit(selector: string | HTMLElement, init?: SubmitEventInit): void;
  
  scroll(selector: string | HTMLElement, init?: EventInit): void;
  resize(selector: string | HTMLElement, init?: UIEventInit): void;
  
  dragstart(selector: string | HTMLElement, init?: DragEventInit): void;
  drag(selector: string | HTMLElement, init?: DragEventInit): void;
  dragend(selector: string | HTMLElement, init?: DragEventInit): void;
  drop(selector: string | HTMLElement, init?: DragEventInit): void;
}
```

## Built-in Mock Utilities

Aurelia's testing package provides sophisticated mock utilities for common testing scenarios.

### Available Mock Classes

```typescript
import {
  MockBinding,
  MockBindingBehavior,
  MockBrowserHistoryLocation,
  MockContext,
  MockPropertySubscriber,
  MockServiceLocator,
  MockSignaler,
  MockTracingExpression,
  MockValueConverter,
  SpySubscriber,
} from '@aurelia/testing';
```

### Using Built-in Mocks

```typescript
describe('Component with Bindings', () => {
  it('handles binding changes correctly', async () => {
    const mockBinding = new MockBinding();
    mockBinding.value = 'initial value';

    const { startPromise, stop } = createFixture(
      '<my-component></my-component>',
      class App {},
      [MyComponent],
      [Registration.instance(IBinding, mockBinding)]
    );

    await startPromise;

    // Simulate binding value change
    mockBinding.value = 'updated value';
    mockBinding.handleChange('updated value', 'initial value');

    // Verify binding interactions
    expect(mockBinding.calls).toContainEqual(['handleChange', 'updated value', 'initial value']);

    await stop(true);
  });
});
```

### Spy Subscriber for Observable Testing

```typescript
import { SpySubscriber } from '@aurelia/testing';

describe('Observable Component', () => {
  it('notifies subscribers of changes', async () => {
    const spy = new SpySubscriber();
    
    const { component, startPromise, stop } = createFixture(
      '<observable-component></observable-component>',
      class App {},
      [ObservableComponent]
    );

    await startPromise;

    // Subscribe spy to component's observable property
    component.observableProperty.subscribe(spy);

    // Change the observable value
    component.observableProperty = 'new value';

    // Verify notifications
    expect(spy.handleChange).toHaveBeenCalledWith('new value', undefined);

    await stop(true);
  });
});
```

## Advanced Assertion Patterns

### Custom Assertion Helpers

```typescript
// Create reusable assertion helpers
export class TestAssertions {
  static assertComponentState<T>(
    fixture: IFixture<T>, 
    expectedState: Partial<T>
  ): void {
    Object.entries(expectedState).forEach(([key, value]) => {
      expect(fixture.component[key as keyof T]).toEqual(value);
    });
  }

  static assertElementPresence(
    fixture: IFixture<any>,
    selectors: { present: string[]; absent: string[] }
  ): void {
    selectors.present.forEach(selector => {
      expect(fixture.queryBy(selector)).not.toBeNull();
    });
    
    selectors.absent.forEach(selector => {
      expect(fixture.queryBy(selector)).toBeNull();
    });
  }

  static assertAccessibility(
    fixture: IFixture<any>,
    requirements: {
      hasAriaLabels?: string[];
      hasTabIndex?: string[];
      hasRoles?: Array<{ selector: string; role: string }>;
    }
  ): void {
    requirements.hasAriaLabels?.forEach(selector => {
      const element = fixture.getBy(selector);
      expect(element.getAttribute('aria-label')).toBeTruthy();
    });

    requirements.hasTabIndex?.forEach(selector => {
      const element = fixture.getBy(selector);
      expect(element.hasAttribute('tabindex')).toBe(true);
    });

    requirements.hasRoles?.forEach(({ selector, role }) => {
      fixture.assertAttr(selector, 'role', role);
    });
  }
}
```

### Using Custom Assertions

```typescript
describe('AccessibleComponent', () => {
  it('meets accessibility requirements', async () => {
    const { startPromise, stop, ...fixture } = createFixture(
      '<accessible-component></accessible-component>',
      class App {},
      [AccessibleComponent]
    );

    await startPromise;

    TestAssertions.assertAccessibility(fixture, {
      hasAriaLabels: ['.main-button', '.close-button'],
      hasTabIndex: ['.focusable-div'],
      hasRoles: [
        { selector: '.navigation', role: 'navigation' },
        { selector: '.content', role: 'main' }
      ]
    });

    await stop(true);
  });
});
```

## Complex Event Simulation

### Drag and Drop Testing

```typescript
describe('DragDropComponent', () => {
  it('handles drag and drop operations', async () => {
    const { startPromise, stop, trigger } = createFixture(
      '<drag-drop-component></drag-drop-component>',
      class App {},
      [DragDropComponent]
    );

    await startPromise;

    const sourceElement = '.draggable-item';
    const targetElement = '.drop-zone';

    // Simulate complete drag and drop sequence
    trigger.dragstart(sourceElement, {
      dataTransfer: new DataTransfer(),
      clientX: 100,
      clientY: 100
    });

    trigger.drag(sourceElement, {
      clientX: 150,
      clientY: 150
    });

    trigger.drop(targetElement, {
      dataTransfer: new DataTransfer(),
      clientX: 200,
      clientY: 200
    });

    trigger.dragend(sourceElement);

    // Verify drop operation completed
    expect(fixture.getBy('.drop-zone')).toContainElement(fixture.getBy('.draggable-item'));

    await stop(true);
  });
});
```

### Keyboard Navigation Testing

```typescript
describe('KeyboardNavigationComponent', () => {
  it('handles keyboard navigation correctly', async () => {
    const { startPromise, stop, trigger, getBy } = createFixture(
      '<keyboard-nav-component></keyboard-nav-component>',
      class App {},
      [KeyboardNavigationComponent]
    );

    await startPromise;

    const firstItem = getBy('.nav-item:first-child');
    const secondItem = getBy('.nav-item:nth-child(2)');

    // Focus first item
    trigger.focus(firstItem);
    expect(document.activeElement).toBe(firstItem);

    // Navigate with arrow keys
    trigger.keydown(firstItem, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(secondItem);

    // Test Enter key activation
    const activationSpy = jest.fn();
    secondItem.addEventListener('activate', activationSpy);
    
    trigger.keydown(secondItem, { key: 'Enter' });
    expect(activationSpy).toHaveBeenCalled();

    await stop(true);
  });
});
```

## Form Testing Patterns

### Complex Form Validation

```typescript
describe('ValidationFormComponent', () => {
  it('validates form fields correctly', async () => {
    const { startPromise, stop, type, trigger, assertClass } = createFixture(
      '<validation-form></validation-form>',
      class App {},
      [ValidationFormComponent]
    );

    await startPromise;

    // Test required field validation
    const emailInput = '#email-input';
    const submitButton = '#submit-button';

    // Try to submit empty form
    trigger.click(submitButton);
    assertClass(emailInput, 'invalid');

    // Enter invalid email
    type(emailInput, 'invalid-email');
    trigger.blur(emailInput);
    assertClass(emailInput, 'invalid');

    // Enter valid email
    type(emailInput, 'valid@example.com');
    trigger.blur(emailInput);
    assertClass(emailInput, 'valid');

    // Submit valid form
    trigger.click(submitButton);
    expect(component.isSubmitted).toBe(true);

    await stop(true);
  });
});
```

### Multi-step Form Testing

```typescript
describe('MultiStepFormComponent', () => {
  it('navigates through form steps correctly', async () => {
    const { startPromise, stop, type, trigger, assertText } = createFixture(
      '<multi-step-form></multi-step-form>',
      class App {},
      [MultiStepFormComponent]
    );

    await startPromise;

    // Step 1: Personal Information
    assertText('.step-indicator', 'Step 1 of 3');
    type('#first-name', 'John');
    type('#last-name', 'Doe');
    trigger.click('#next-button');

    // Step 2: Contact Information
    assertText('.step-indicator', 'Step 2 of 3');
    type('#email', 'john@example.com');
    type('#phone', '123-456-7890');
    trigger.click('#next-button');

    // Step 3: Review
    assertText('.step-indicator', 'Step 3 of 3');
    assertText('.review-name', 'John Doe');
    assertText('.review-email', 'john@example.com');

    // Test back navigation
    trigger.click('#back-button');
    assertText('.step-indicator', 'Step 2 of 3');

    // Return to review and submit
    trigger.click('#next-button');
    trigger.click('#submit-button');

    expect(component.isFormSubmitted).toBe(true);

    await stop(true);
  });
});
```

## Performance and Memory Testing

### Render Performance Testing

```typescript
describe('PerformanceComponent', () => {
  it('renders large datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`
    }));

    const startTime = performance.now();

    const { startPromise, stop } = createFixture(
      '<performance-component items.bind="data"></performance-component>',
      class App { data = largeDataset; },
      [PerformanceComponent]
    );

    await startPromise;

    const renderTime = performance.now() - startTime;
    
    // Verify reasonable render time
    expect(renderTime).toBeLessThan(500); // Should render in under 500ms

    // Verify all items are rendered
    const items = fixture.getAllBy('.list-item');
    expect(items).toHaveLength(1000);

    await stop(true);
  });

  it('handles updates efficiently', async () => {
    const { component, startPromise, stop } = createFixture(
      '<performance-component items.bind="data"></performance-component>',
      class App { 
        data = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      },
      [PerformanceComponent]
    );

    await startPromise;

    // Measure update performance
    const updateStart = performance.now();
    
    // Add 100 more items
    component.data = [
      ...component.data,
      ...Array.from({ length: 100 }, (_, i) => ({ id: i + 100, name: `New Item ${i}` }))
    ];

    await tasksSettled();
    
    const updateTime = performance.now() - updateStart;
    
    // Update should be fast
    expect(updateTime).toBeLessThan(100);
    
    // Verify correct number of items
    expect(fixture.getAllBy('.list-item')).toHaveLength(200);

    await stop(true);
  });
});
```

### Memory Leak Detection

```typescript
describe('MemoryLeakComponent', () => {
  it('does not leak memory on repeated creation/destruction', async () => {
    if (!(performance as any).memory) {
      pending('Memory measurement not available');
      return;
    }

    const initialMemory = (performance as any).memory.usedJSHeapSize;
    
    // Create and destroy component multiple times
    for (let i = 0; i < 50; i++) {
      const { startPromise, stop } = createFixture(
        '<memory-test-component></memory-test-component>',
        class App {},
        [MemoryTestComponent]
      );

      await startPromise;
      await stop(true);
    }

    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }

    const finalMemory = (performance as any).memory.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal (less than 5MB)
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
  });
});
```

## Integration Testing Patterns

### Multi-Component Integration

```typescript
describe('ComponentIntegration', () => {
  it('integrates multiple components correctly', async () => {
    const { startPromise, stop, trigger, assertText } = createFixture(
      `<parent-component>
         <child-component-a></child-component-a>
         <child-component-b></child-component-b>
       </parent-component>`,
      class App {},
      [ParentComponent, ChildComponentA, ChildComponentB]
    );

    await startPromise;

    // Test component communication
    trigger.click('.child-a-button');
    assertText('.parent-status', 'Child A clicked');

    trigger.click('.child-b-button');
    assertText('.parent-status', 'Child B clicked');

    // Test cross-component data flow
    trigger.type('.child-a-input', 'shared data');
    assertText('.child-b-display', 'shared data');

    await stop(true);
  });
});
```

### Service Integration Testing

```typescript
describe('ServiceIntegration', () => {
  it('integrates with real services', async () => {
    // Use real services instead of mocks for integration testing
    const { container, startPromise, stop } = createFixture(
      '<service-consumer></service-consumer>',
      class App {},
      [ServiceConsumer, DataService, AuthService]
    );

    await startPromise;

    // Test actual service interactions
    const dataService = container.get(DataService);
    const authService = container.get(AuthService);

    // Simulate authentication
    await authService.login('test@example.com', 'password');
    
    // Verify authenticated state affects component
    expect(component.isAuthenticated).toBe(true);

    // Test data loading
    const data = await dataService.fetchUserData();
    expect(component.userData).toEqual(data);

    await stop(true);
  });
});
```

## Async Testing Advanced Patterns

### Testing Race Conditions

```typescript
describe('AsyncComponent', () => {
  it('handles concurrent operations correctly', async () => {
    const { component, startPromise, stop } = createFixture(
      '<async-component></async-component>',
      class App {},
      [AsyncComponent]
    );

    await startPromise;

    // Start multiple async operations concurrently
    const promise1 = component.loadData('endpoint1');
    const promise2 = component.loadData('endpoint2');
    const promise3 = component.loadData('endpoint3');

    // Wait for all to complete
    await Promise.all([promise1, promise2, promise3]);

    // Verify final state is consistent
    expect(component.isLoading).toBe(false);
    expect(component.data).toBeDefined();
    expect(component.errors).toHaveLength(0);

    await stop(true);
  });
});
```

### Testing Timeout Scenarios

```typescript
describe('TimeoutComponent', () => {
  it('handles operation timeouts gracefully', async () => {
    jest.useFakeTimers();

    const { component, startPromise, stop } = createFixture(
      '<timeout-component></timeout-component>',
      class App {},
      [TimeoutComponent]
    );

    await startPromise;

    // Start operation with timeout
    const operationPromise = component.performOperationWithTimeout();

    // Fast-forward past timeout
    jest.advanceTimersByTime(30000);

    // Wait for timeout to be handled
    await operationPromise;

    // Verify timeout was handled
    expect(component.hasTimedOut).toBe(true);
    expect(component.errorMessage).toContain('timeout');

    jest.useRealTimers();
    await stop(true);
  });
});
```

## Best Practices Summary

### 1. **Test Organization**
```typescript
describe('ComponentName', () => {
  describe('initialization', () => {
    // Test component setup and initial state
  });

  describe('user interactions', () => {
    // Test user-driven behaviors
  });

  describe('error scenarios', () => {
    // Test error handling and edge cases
  });

  describe('performance', () => {
    // Test performance characteristics
  });
});
```

### 2. **Assertion Strategies**
- Use the most specific assertion available
- Create custom assertions for domain-specific validations
- Test both positive and negative scenarios
- Verify side effects and state changes

### 3. **Mock Management**
- Use real implementations for integration tests
- Mock external dependencies and slow operations
- Prefer built-in mocks when available
- Clean up mock state between tests

### 4. **Async Handling**
- Always await `startPromise` before assertions
- Use `tasksSettled()` for complex async operations
- Test timeout and error scenarios
- Handle race conditions explicitly

### 5. **Performance Considerations**
- Monitor render times for large datasets
- Test memory usage patterns
- Verify cleanup prevents memory leaks
- Use performance budgets in CI/CD

This advanced testing guide provides comprehensive patterns for testing sophisticated Aurelia 2 applications. Combine these techniques with the foundational testing guides to create robust, maintainable test suites that ensure application quality and reliability.