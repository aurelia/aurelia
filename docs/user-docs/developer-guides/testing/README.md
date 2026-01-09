# Testing Quick Reference ("How Do I...")

Practical answers to common testing questions in Aurelia 2.

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Component Testing](#basic-component-testing)
- [DOM Interaction & Assertions](#dom-interaction--assertions)
- [Testing with Dependencies](#testing-with-dependencies)
- [Async Testing](#async-testing)
- [Events & User Interaction](#events--user-interaction)
- [Router Testing](#router-testing)
- [Forms & Input Testing](#forms--input-testing)
- [Lifecycle Testing](#lifecycle-testing)
- [Mocking & Spies](#mocking--spies)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### How do I set up my test environment?

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

export function bootstrapTestEnvironment() {
  if (!(globalThis as any).__aureliaTestPlatform__) {
    const platform = new BrowserPlatform(window);
    setPlatform(platform);
    BrowserPlatform.set(globalThis, platform);
    (globalThis as any).__aureliaTestPlatform__ = platform;
  }
}

// Call once globally
bootstrapTestEnvironment();
```

**Configure Jest** (`jest.config.js`):
```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  testEnvironment: 'jsdom',
};
```

**Configure Mocha** (`test/setup.ts`):
```typescript
import './test-bootstrap';
// Import this file at the top of each test file or via --require
```

### How do I create a simple test fixture?

```typescript
import { createFixture } from '@aurelia/testing';

const { component, startPromise, stop } = createFixture(
  '<div>${message}</div>',
  class App { message = 'Hello World'; }
);

await startPromise;
// ... assertions
await stop(true);
```

### How do I test a component with a template file?

```typescript
import { createFixture } from '@aurelia/testing';
import { MyComponent } from './my-component';

const { appHost, startPromise, stop } = createFixture(
  '<my-component value.bind="testValue"></my-component>',
  class App { testValue = 'test'; },
  [MyComponent] // Register your component
);

await startPromise;
expect(appHost.textContent).toContain('test');
await stop(true);
```

### How do I use the builder pattern for fixtures?

```typescript
const fixture = await createFixture
  .component(class App { items = [1, 2, 3]; })
  .html`<div repeat.for="i of items">${i}</div>`
  .deps(MyService, MyCustomElement)
  .build()
  .started;

fixture.assertText('123');
await fixture.stop(true);
```

---

## Basic Component Testing

### How do I test that a component renders correctly?

```typescript
const { assertText } = await createFixture
  .html`<div>${message}</div>`
  .component(class { message = 'Hello'; })
  .build()
  .started;

assertText('Hello');
```

### How do I test bindable properties?

```typescript
import { MyComponent } from './my-component';

const { component, getBy } = await createFixture
  .html`<my-component value.bind="testValue"></my-component>`
  .component(class App { testValue = 'initial'; })
  .deps(MyComponent)
  .build()
  .started;

expect(getBy('my-component').textContent).toContain('initial');

// Change the value
component.testValue = 'updated';
expect(getBy('my-component').textContent).toContain('updated');
```

### How do I test computed properties?

```typescript
const { component, assertText } = await createFixture
  .html`<div>\${fullName}</div>`
  .component(class {
    firstName = 'John';
    lastName = 'Doe';
    get fullName() { return `\${this.firstName} \${this.lastName}`; }
  })
  .build()
  .started;

assertText('John Doe');

component.firstName = 'Jane';
assertText('Jane Doe');
```

### How do I test conditional rendering?

```typescript
const { component, assertText, assertHtml } = await createFixture
  .html`<div if.bind="show">Visible</div>`
  .component(class { show = true; })
  .build()
  .started;

assertText('Visible');

component.show = false;
assertHtml(''); // Empty when hidden
```

### How do I test repeat.for?

```typescript
const { component, assertText } = await createFixture
  .html`<div repeat.for="item of items">\${item}</div>`
  .component(class { items = ['a', 'b', 'c']; })
  .build()
  .started;

assertText('abc');

// Test array mutation
component.items.push('d');
assertText('abcd');

// Test array replacement
component.items = ['x', 'y'];
assertText('xy');
```

---

## DOM Interaction & Assertions

### How do I assert text content?

```typescript
const { assertText } = fixture;

// Assert text of root element
assertText('Expected text');

// Assert text of specific element
assertText('.my-class', 'Expected text');

// Assert text contains substring
assertTextContain('partial text');
```

### How do I assert HTML content?

```typescript
const { assertHtml } = fixture;

// Assert innerHTML of root
assertHtml('<div>Hello</div>');

// Assert innerHTML of specific element
assertHtml('.container', '<span>Content</span>');

// With options
assertHtml('.container', '<div>Text</div>', { compact: true });
```

### How do I query DOM elements?

```typescript
const { getBy, getAllBy, queryBy } = fixture;

// Get single element (throws if not found or multiple)
const button = getBy('button');

// Get all matching elements
const items = getAllBy('.item');
expect(items.length).toBe(3);

// Query (returns null if not found)
const optional = queryBy('.optional');
expect(optional).toBeNull();
```

### How do I assert CSS classes?

```typescript
const { assertClass, assertClassStrict } = fixture;

// Check element has classes (can have others)
assertClass('.my-element', 'active', 'selected');

// Check element has ONLY these classes
assertClassStrict('.my-element', 'active', 'selected');
```

### How do I assert attributes?

```typescript
const { assertAttr, assertAttrNS } = fixture;

// Assert attribute value
assertAttr('input', 'type', 'text');
assertAttr('a', 'href', '/home');

// Assert namespaced attribute
assertAttrNS('svg', 'http://www.w3.org/2000/svg', 'viewBox', '0 0 100 100');
```

### How do I assert computed styles?

```typescript
const { assertStyles } = fixture;

assertStyles('.my-element', {
  display: 'flex',
  color: 'rgb(255, 0, 0)',
  fontSize: '16px'
});
```

### How do I assert form values?

```typescript
const { assertValue, assertChecked } = fixture;

// Assert input value
assertValue('input[name="username"]', 'john');

// Assert checkbox state
assertChecked('input[type="checkbox"]', true);
```

---

## Testing with Dependencies

### How do I inject a service into my test component?

```typescript
import { resolve } from 'aurelia';
import { MyService } from './my-service';

const { component } = await createFixture
  .component(class App {
    private service = resolve(MyService);
    get data() { return this.service.getData(); }
  })
  .html`<div>\${data}</div>`
  .deps(MyService)
  .build()
  .started;
```

### How do I mock a service?

```typescript
import { Registration } from '@aurelia/kernel';

class MockMyService {
  getData() { return 'mock data'; }
}

const { component } = await createFixture
  .component(class App {
    private service = resolve(IMyService);
  })
  .html`<div>\${service.getData()}</div>`
  .deps(
    Registration.instance(IMyService, new MockMyService())
  )
  .build()
  .started;
```

### How do I test with custom elements/attributes?

```typescript
import { MyButton } from './my-button';
import { HighlightAttribute } from './highlight';

const fixture = await createFixture
  .html`
    <my-button value="Click">
      <div highlight.bind="color">Text</div>
    </my-button>
  `
  .component(class { color = 'yellow'; })
  .deps(MyButton, HighlightAttribute)
  .build()
  .started;
```

### How do I test with value converters?

```typescript
import { UppercaseValueConverter } from './uppercase';

const fixture = await createFixture
  .html`<div>\${message | uppercase}</div>`
  .component(class { message = 'hello'; })
  .deps(UppercaseValueConverter)
  .build()
  .started;

fixture.assertText('HELLO');
```

### How do I register multiple dependencies?

```typescript
const fixture = await createFixture
  .html`...`
  .component(class App {})
  .deps(
    MyComponent,
    MyService,
    MyValueConverter,
    MyAttribute,
    Registration.singleton(ILogger, ConsoleLogger)
  )
  .build()
  .started;
```

---

## Async Testing

### How do I wait for component initialization?

```typescript
const fixture = createFixture(
  '<my-component></my-component>',
  class App {},
  [MyComponent]
);

// Wait for startup to complete
await fixture.startPromise;

// OR use .started
const fixture = await createFixture
  .html`<my-component></my-component>`
  .deps(MyComponent)
  .build()
  .started;
```

### How do I test async lifecycle hooks?

```typescript
let bindingComplete = false;

const { component } = await createFixture
  .component(class {
    async binding() {
      await new Promise(resolve => setTimeout(resolve, 100));
      bindingComplete = true;
    }
  })
  .html`<div>Ready</div>`
  .build()
  .started;

// By the time .started resolves, binding() has completed
expect(bindingComplete).toBe(true);
```

### How do I test data loading?

```typescript
const { component, assertText } = await createFixture
  .component(class {
    data = '';

    async attached() {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 50));
      this.data = 'Loaded';
    }
  })
  .html`<div>\${data}</div>`
  .build()
  .started;

// After .started, attached() has completed
assertText('Loaded');
```

### How do I test task queue operations?

```typescript
import { IPlatform } from '@aurelia/runtime-html';

const { component, platform, assertText } = await createFixture
  .component(class {
    message = 'initial';

    updateMessage() {
      queueTask(() => {
        this.message = 'updated';
      });
    }
  })
  .html`<div>\${message}</div>`
  .build()
  .started;

component.updateMessage();
assertText('initial'); // Not updated yet

await tasksSettled();
assertText('updated'); // Now updated
```

---

## Events & User Interaction

### How do I trigger a click event?

```typescript
const { getBy, trigger, component } = fixture;

let clicked = false;
component.handleClick = () => { clicked = true; };

trigger.click('button');
expect(clicked).toBe(true);

// With event init options
trigger.click('button', { bubbles: true, cancelable: true });
```

### How do I type into an input?

```typescript
const { type, assertValue, component } = fixture;

// Type into input (sets value and triggers 'input' event)
type('input[name="username"]', 'john_doe');

// Verify value was set
assertValue('input[name="username"]', 'john_doe');

// Verify binding updated
expect(component.username).toBe('john_doe');
```

### How do I trigger keyboard events?

```typescript
const { trigger } = fixture;

trigger.keydown('input', { key: 'Enter', code: 'Enter' });
trigger.keydown('input', { key: 'Escape', code: 'Escape' });
trigger.keyup('input', { key: 'a', code: 'KeyA' });
```

### How do I trigger form submission?

```typescript
const { trigger, component } = fixture;

let submitted = false;
component.onSubmit = () => { submitted = true; };

trigger('form', 'submit');
expect(submitted).toBe(true);
```

### How do I trigger custom events?

```typescript
const { trigger, createEvent, component } = fixture;

component.onCustom = (event) => {
  component.receivedData = event.detail.data;
};

const customEvent = createEvent('custom-event', {
  detail: { data: 'test' }
});

trigger('.my-element', customEvent);
expect(component.receivedData).toBe('test');
```

### How do I test two-way binding with events?

```typescript
const { component, type, assertValue } = await createFixture
  .html`<input value.two-way="name">`
  .component(class { name = 'initial'; })
  .build()
  .started;

assertValue('input', 'initial');

// User types
type('input', 'updated');
expect(component.name).toBe('updated');

// Programmatic change
component.name = 'changed';
assertValue('input', 'changed');
```

---

## Router Testing

### How do I test router navigation?

```typescript
import { IRouter } from '@aurelia/router';
import { resolve } from 'aurelia';

const { component } = await createFixture
  .component(class {
    private router = resolve(IRouter);

    async navigateToHome() {
      await this.router.load('/home');
    }
  })
  .html`<div>Content</div>`
  .build()
  .started;

await component.navigateToHome();
expect(component.router.currentRoute?.path).toBe('/home');
```

### How do I test route parameters?

```typescript
import { IRouter } from '@aurelia/router';

// Setup router with routes
const fixture = await createFixture
  .component(class App {
    static routes = [
      { path: 'users/:id', component: UserDetail }
    ];
  })
  .html`<au-viewport></au-viewport>`
  .deps(UserDetail)
  .build()
  .started;

await fixture.component.router.load('users/123');

// Verify route parameter
const userDetail = fixture.getBy('user-detail');
expect(userDetail.userId).toBe('123');
```

### How do I test route hooks?

```typescript
export class MyComponent {
  canLoad(params, next, current) {
    // Test this hook
    return params.id !== 'forbidden';
  }

  async loading(params, next, current) {
    // Test async loading
    this.data = await fetchData(params.id);
  }
}

// In test
const fixture = await createFixture
  .component(MyComponent)
  .html`<div>\${data}</div>`
  .build()
  .started;

// Manually invoke hooks if needed
const canProceed = fixture.component.canLoad({ id: '123' }, null, null);
expect(canProceed).toBe(true);
```

---

## Forms & Input Testing

### How do I test text input binding?

```typescript
const { component, type, assertValue } = await createFixture
  .html`<input value.bind="username">`
  .component(class { username = ''; })
  .build()
  .started;

type('input', 'john_doe');
expect(component.username).toBe('john_doe');
assertValue('input', 'john_doe');
```

### How do I test checkbox binding?

```typescript
const { component, getBy, trigger } = await createFixture
  .html`<input type="checkbox" checked.bind="accepted">`
  .component(class { accepted = false; })
  .build()
  .started;

expect(component.accepted).toBe(false);

trigger.click('input[type="checkbox"]');
expect(component.accepted).toBe(true);
expect(getBy('input').checked).toBe(true);
```

### How do I test radio button binding?

```typescript
const { component, trigger } = await createFixture
  .html`
    <input type="radio" value="a" checked.bind="choice">
    <input type="radio" value="b" checked.bind="choice">
  `
  .component(class { choice = 'a'; })
  .build()
  .started;

expect(component.choice).toBe('a');

trigger.click('input[value="b"]');
expect(component.choice).toBe('b');
```

### How do I test select dropdown binding?

```typescript
const { component, getBy, trigger } = await createFixture
  .html`
    <select value.bind="selected">
      <option value="1">One</option>
      <option value="2">Two</option>
    </select>
  `
  .component(class { selected = '1'; })
  .build()
  .started;

const select = getBy('select') as HTMLSelectElement;
select.value = '2';
trigger.change('select');

expect(component.selected).toBe('2');
```

### How do I test form validation?

```typescript
import { ValidationController } from '@aurelia/validation';

const { component } = await createFixture
  .component(class {
    private controller = resolve(ValidationController);
    username = '';

    async submit() {
      const result = await this.controller.validate();
      return result.valid;
    }
  })
  .html`<input value.bind="username & validate">`
  .build()
  .started;

const isValid = await component.submit();
expect(isValid).toBe(false); // Empty username

component.username = 'john';
const isValidNow = await component.submit();
expect(isValidNow).toBe(true);
```

---

## Lifecycle Testing

### How do I test lifecycle hooks?

```typescript
const calls: string[] = [];

const { component } = await createFixture
  .component(class {
    binding() { calls.push('binding'); }
    bound() { calls.push('bound'); }
    attaching() { calls.push('attaching'); }
    attached() { calls.push('attached'); }
  })
  .html`<div>Test</div>`
  .build()
  .started;

expect(calls).toEqual(['binding', 'bound', 'attaching', 'attached']);
```

### How do I test detaching/unbinding?

```typescript
const calls: string[] = [];

const fixture = await createFixture
  .component(class {
    detaching() { calls.push('detaching'); }
    unbinding() { calls.push('unbinding'); }
  })
  .html`<div>Test</div>`
  .build()
  .started;

await fixture.stop(true);

expect(calls).toEqual(['detaching', 'unbinding']);
```

### How do I test @observable?

```typescript
import { observable } from 'aurelia';

const { component } = await createFixture
  .component(class {
    @observable count = 0;
    countChanged(newValue, oldValue) {
      this.changeLog = { newValue, oldValue };
    }
    changeLog = { newValue: 0, oldValue: 0 };
  })
  .html`<div>\${count}</div>`
  .build()
  .started;

component.count = 5;

expect(component.changeLog).toEqual({ newValue: 5, oldValue: 0 });
```

### How do I test component dispose?

```typescript
let disposed = false;

const fixture = await createFixture
  .component(class {
    dispose() {
      disposed = true;
    }
  })
  .html`<div>Test</div>`
  .build()
  .started;

await fixture.stop(true); // true = dispose

expect(disposed).toBe(true);
```

---

## Mocking & Spies

### How do I create a spy function?

```typescript
import { createSpy } from '@aurelia/testing';

const spy = createSpy();

spy('arg1', 'arg2');
spy('arg3');

expect(spy.calls.length).toBe(2);
expect(spy.calls[0].args).toEqual(['arg1', 'arg2']);
expect(spy.calls[1].args).toEqual(['arg3']);
```

### How do I spy on a method?

```typescript
const service = new MyService();
const originalMethod = service.getData;
const calls: any[] = [];

service.getData = (...args) => {
  calls.push(args);
  return originalMethod.call(service, ...args);
};

service.getData('test');
expect(calls.length).toBe(1);
expect(calls[0]).toEqual(['test']);
```

### How do I use mock objects?

```typescript
import { MockServiceLocator } from '@aurelia/testing';

const mockLocator = new MockServiceLocator();
mockLocator.registerService(IMyService, new MyMockService());

const service = mockLocator.get(IMyService);
expect(service).toBeInstanceOf(MyMockService);
```

### How do I verify method calls?

```typescript
import { recordCalls, stopRecordingCalls } from '@aurelia/testing';

const service = new MyService();
const calls = recordCalls(service, 'getData');

service.getData('param1');
service.getData('param2');

stopRecordingCalls(calls);

expect(calls.length).toBe(2);
expect(calls[0].args).toEqual(['param1']);
expect(calls[1].args).toEqual(['param2']);
```

---

## Common Patterns

### How do I test error handling?

```typescript
const { component } = await createFixture
  .component(class {
    error = '';

    async loadData() {
      try {
        this.data = await fetchData();
      } catch (e) {
        this.error = e.message;
      }
    }
  })
  .html`<div>\${error}</div>`
  .build()
  .started;

// Trigger error
await component.loadData();

expect(component.error).toBeTruthy();
```

### How do I test conditional display?

```typescript
const { component, assertText, assertHtml } = await createFixture
  .component(class {
    loading = true;
    data = null;
  })
  .html`
    <div if.bind="loading">Loading...</div>
    <div if.bind="data">Data: \${data}</div>
  `
  .build()
  .started;

assertText('Loading...');

component.loading = false;
component.data = 'Ready';
assertText('Data: Ready');
```

### How do I test promise templates?

```typescript
const { assertText } = await createFixture
  .component(class {
    dataPromise = Promise.resolve('async data');
  })
  .html`
    <div promise.bind="dataPromise">
      <span pending>Loading...</span>
      <span then.from-view="data">\${data}</span>
    </div>
  `
  .build()
  .started;

// Wait for promise resolution
await new Promise(resolve => setTimeout(resolve, 10));

assertText('async data');
```

### How do I test dynamic composition?

```typescript
import { au-compose } from 'aurelia';

const { component } = await createFixture
  .component(class {
    currentView = MyComponent;
    currentModel = { data: 'test' };
  })
  .html`
    <au-compose component.bind="currentView" model.bind="currentModel">
    </au-compose>
  `
  .deps(MyComponent)
  .build()
  .started;

// Verify composed component
const composed = fixture.getBy('my-component');
expect(composed).toBeTruthy();
```

---

## Troubleshooting

### Why is "Platform not set" error appearing?

**Problem:** Test runs before platform initialization.

**Solution:** Ensure `bootstrapTestEnvironment()` is called before `createFixture()`:

```typescript
// In test setup file
bootstrapTestEnvironment();

// OR in beforeAll
beforeAll(() => {
  bootstrapTestEnvironment();
});
```

### Why is my component not updating after property change?

**Problem:** Async task queue hasn't flushed.

**Solution:** Wait for task queue:

```typescript
const { component, platform, assertText } = fixture;

component.value = 'new';

// Option 1: Wait for task queue
await tasksSettled();

// Option 2: flush straight away
await runTasks();

assertText('new');
```

### Why is "window is not defined" error appearing?

**Problem:** Test environment doesn't provide browser APIs.

**Solution:** Configure test runner to use jsdom:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom'
};
```

### Why is my test fixture not cleaning up?

**Problem:** Using deprecated `tearDown()` or not calling `stop()`.

**Solution:** Always use `stop(true)`:

```typescript
const fixture = await createFixture
  .html`<div>Test</div>`
  .build()
  .started;

// ... tests

// Cleanup (always in afterEach or after test)
await fixture.stop(true); // true = dispose
```

### Why can't I find my element with getBy()?

**Problem:** Element not rendered yet or selector is wrong.

**Solution:** Verify element exists and check selector:

```typescript
const { getBy, queryBy, printHtml } = fixture;

// Use queryBy to check if element exists
const el = queryBy('.my-class');
if (!el) {
  // Debug: print HTML to see what's rendered
  printHtml();
}

// Use correct selector
getBy('.my-class'); // Class selector
getBy('#my-id'); // ID selector
getBy('button'); // Tag selector
getBy('[data-test="value"]'); // Attribute selector
```

### Why are my lifecycle hooks not firing?

**Problem:** Fixture not started or component not activated.

**Solution:** Always await `.started`:

```typescript
const fixture = await createFixture
  .component(class {
    attached() {
      this.ready = true;
    }
    ready = false;
  })
  .html`<div>Test</div>`
  .build()
  .started; // Important!

expect(fixture.component.ready).toBe(true);
```

### How do I debug what's rendered?

Use `printHtml()` to log current DOM state:

```typescript
const { printHtml, assertText } = fixture;

printHtml(); // Logs innerHTML to console

// Or manually inspect
console.log(fixture.appHost.innerHTML);
console.log(fixture.testHost.innerHTML);
```

### Why is my mock not being used?

**Problem:** Service registered incorrectly or after component creation.

**Solution:** Register mock before building fixture:

```typescript
// Correct order
const fixture = await createFixture
  .component(class App {
    private service = resolve(IMyService);
  })
  .html`<div></div>`
  .deps(
    Registration.instance(IMyService, mockService) // Register first!
  )
  .build()
  .started;
```

---

## See Also

- [Testing Components](testing-components.md) - Detailed component testing guide
- [Testing Attributes](testing-attributes.md) - Custom attribute testing
- [Testing Value Converters](testing-value-converters.md) - Value converter testing
- [Fluent API](fluent-api.md) - Advanced fixture builder API
- [Mocks and Spies](mocks-spies.md) - Detailed mocking strategies
- [Advanced Testing](advanced-testing.md) - Advanced techniques
