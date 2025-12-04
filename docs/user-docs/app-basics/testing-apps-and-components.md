---
description: A beginner-friendly guide to testing Aurelia applications and components
---

# Testing Apps and Components

Testing ensures your Aurelia application works correctly and continues to work as you make changes. This guide will help you get started with testing, from setting up your environment to writing your first tests.

## Why Test?

Testing provides several benefits:

- **Confidence**: Know your code works as expected
- **Refactoring Safety**: Make changes without fear of breaking things
- **Documentation**: Tests show how your code should be used
- **Bug Prevention**: Catch issues before users do
- **Faster Development**: Find and fix bugs early

## Quick Start

### 1. Install Testing Dependencies

Most Aurelia projects come with testing dependencies already installed. If not, install them:

```bash
npm install --save-dev @aurelia/testing jest @types/jest
```

### 2. Configure Your Test Environment

Create a test setup file (e.g., `test-setup.ts`) to initialize Aurelia's testing platform:

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

// Call this once globally
bootstrapTestEnvironment();
```

### 3. Configure Jest

Update your `jest.config.js`:

```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
};
```

## Your First Test

Let's test a simple greeting component.

### The Component

Create `greeting.ts`:

```typescript
import { bindable } from 'aurelia';

export class Greeting {
  @bindable name = 'World';

  get message() {
    return `Hello, ${this.name}!`;
  }
}
```

Create `greeting.html`:

```html
<div class="greeting">
  <h1>\${message}</h1>
  <p>Welcome to Aurelia!</p>
</div>
```

### The Test

Create `greeting.spec.ts`:

```typescript
import { createFixture } from '@aurelia/testing';
import { Greeting } from './greeting';

describe('Greeting component', () => {
  it('displays default greeting', async () => {
    const { assertText, stop } = await createFixture
      .html`<greeting></greeting>`
      .deps(Greeting)
      .build()
      .started;

    assertText('Hello, World!');

    await stop(true);
  });

  it('displays custom name', async () => {
    const { assertText, stop } = await createFixture
      .html`<greeting name="Alice"></greeting>`
      .deps(Greeting)
      .build()
      .started;

    assertText('Hello, Alice!');

    await stop(true);
  });

  it('updates when name changes', async () => {
    const { component, assertText, stop } = await createFixture
      .html`<greeting name.bind="userName"></greeting>`
      .component(class App { userName = 'Bob'; })
      .deps(Greeting)
      .build()
      .started;

    assertText('Hello, Bob!');

    // Change the name
    component.userName = 'Charlie';
    assertText('Hello, Charlie!');

    await stop(true);
  });
});
```

### Run Your Tests

```bash
npm test
```

You should see all three tests pass!

## Understanding the Test Structure

Let's break down what's happening:

### 1. createFixture

`createFixture` creates a test environment for your component:

```typescript
const fixture = await createFixture
  .html`<greeting></greeting>`  // Your component markup
  .component(class App {})       // Optional parent component
  .deps(Greeting)                // Dependencies to register
  .build()                       // Build the fixture
  .started;                      // Wait for startup to complete
```

### 2. Assertions

The fixture provides assertion helpers:

```typescript
// Check text content
assertText('Expected text');

// Check HTML structure
assertHtml('<h1>Expected HTML</h1>');

// Check element attributes
assertAttr('button', 'disabled', null);

// Check CSS classes
assertClass('div', 'active', 'visible');
```

### 3. Cleanup

Always clean up after tests:

```typescript
await stop(true);  // true = dispose components
```

This prevents memory leaks and ensures test isolation.

## Testing Common Scenarios

### Testing User Input

Test a todo input component:

```typescript
// todo-input.ts
export class TodoInput {
  newTodo = '';
  todos: string[] = [];

  addTodo() {
    if (this.newTodo.trim()) {
      this.todos.push(this.newTodo);
      this.newTodo = '';
    }
  }
}
```

```html
<!-- todo-input.html -->
<div class="todo-input">
  <input type="text" value.bind="newTodo">
  <button click.trigger="addTodo()">Add</button>
  <ul>
    <li repeat.for="todo of todos">\${todo}</li>
  </ul>
</div>
```

```typescript
// todo-input.spec.ts
describe('TodoInput', () => {
  it('adds todos when button clicked', async () => {
    const { component, type, trigger, assertText, stop } = await createFixture
      .html`<todo-input></todo-input>`
      .deps(TodoInput)
      .build()
      .started;

    // Type into the input
    type('input', 'Buy milk');

    // Click the add button
    trigger.click('button');

    // Verify todo was added
    assertText('Buy milk');
    expect(component.todos).toEqual(['Buy milk']);
    expect(component.newTodo).toBe(''); // Input cleared

    await stop(true);
  });
});
```

### Testing Forms

Test a login form:

```typescript
// login-form.ts
import { bindable } from 'aurelia';

export class LoginForm {
  username = '';
  password = '';
  isLoggedIn = false;

  login() {
    if (this.username && this.password) {
      this.isLoggedIn = true;
    }
  }
}
```

```html
<!-- login-form.html -->
<form submit.trigger="login()">
  <input type="text" value.bind="username" placeholder="Username">
  <input type="password" value.bind="password" placeholder="Password">
  <button type="submit">Login</button>
  <p if.bind="isLoggedIn">Welcome, \${username}!</p>
</form>
```

```typescript
// login-form.spec.ts
describe('LoginForm', () => {
  it('logs in with valid credentials', async () => {
    const { component, type, trigger, assertText, stop } = await createFixture
      .html`<login-form></login-form>`
      .deps(LoginForm)
      .build()
      .started;

    // Fill in the form
    type('input[type="text"]', 'alice');
    type('input[type="password"]', 'secret123');

    // Submit the form
    trigger('form', new Event('submit'));

    // Verify login
    expect(component.isLoggedIn).toBe(true);
    assertText('Welcome, alice!');

    await stop(true);
  });
});
```

### Testing Lists and Loops

Test a component with a repeater:

```typescript
// user-list.ts
export class UserList {
  users = [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false },
    { id: 3, name: 'Charlie', active: true }
  ];

  get activeUsers() {
    return this.users.filter(u => u.active);
  }

  toggleActive(user: any) {
    user.active = !user.active;
  }
}
```

```html
<!-- user-list.html -->
<ul class="user-list">
  <li repeat.for="user of users" class="${user.active ? 'active' : 'inactive'}">
    \${user.name}
    <button click.trigger="toggleActive(user)">Toggle</button>
  </li>
</ul>
<p>Active users: \${activeUsers.length}</p>
```

```typescript
// user-list.spec.ts
describe('UserList', () => {
  it('displays all users', async () => {
    const { getAllBy, assertText, stop } = await createFixture
      .html`<user-list></user-list>`
      .deps(UserList)
      .build()
      .started;

    const items = getAllBy('li');
    expect(items.length).toBe(3);

    assertText('Alice');
    assertText('Bob');
    assertText('Charlie');
    assertText('Active users: 2');

    await stop(true);
  });

  it('toggles user active status', async () => {
    const { component, getAllBy, trigger, assertText, stop } = await createFixture
      .html`<user-list></user-list>`
      .deps(UserList)
      .build()
      .started;

    // Initially 2 active
    expect(component.activeUsers.length).toBe(2);

    // Toggle Bob (inactive -> active)
    const buttons = getAllBy('button');
    trigger.click(buttons[1]); // Bob's button

    // Now 3 active
    expect(component.activeUsers.length).toBe(3);
    assertText('Active users: 3');

    await stop(true);
  });
});
```

### Testing Conditional Rendering

Test components with if/else:

```typescript
// status-message.ts
export class StatusMessage {
  loading = false;
  error: string | null = null;
  data: string | null = null;

  async loadData() {
    this.loading = true;
    this.error = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      this.data = 'Data loaded successfully';
    } catch (err) {
      this.error = 'Failed to load data';
    } finally {
      this.loading = false;
    }
  }
}
```

```html
<!-- status-message.html -->
<div class="status">
  <p if.bind="loading">Loading...</p>
  <p if.bind="error" class="error">\${error}</p>
  <p if.bind="data" class="success">\${data}</p>
  <button click.trigger="loadData()" if.bind="!loading">Load Data</button>
</div>
```

```typescript
// status-message.spec.ts
describe('StatusMessage', () => {
  it('shows loading state', async () => {
    const { component, trigger, assertText, stop } = await createFixture
      .html`<status-message></status-message>`
      .deps(StatusMessage)
      .build()
      .started;

    // Initially not loading
    expect(component.loading).toBe(false);

    // Start loading
    const loadPromise = component.loadData();

    // Check loading state
    expect(component.loading).toBe(true);
    assertText('Loading...');

    // Wait for completion
    await loadPromise;

    // Check success state
    expect(component.loading).toBe(false);
    assertText('Data loaded successfully');

    await stop(true);
  });
});
```

## Testing with Dependencies

Many components depend on services. Here's how to test them:

### Component with Service

```typescript
// user-service.ts
export class UserService {
  async getUser(id: number) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
}

// user-detail.ts
import { resolve } from '@aurelia/kernel';
import { bindable } from 'aurelia';
import { UserService } from './user-service';

export class UserDetail {
  @bindable userId: number;
  user: any = null;
  loading = false;

  private userService = resolve(UserService);

  async userIdChanged(newId: number) {
    if (!newId) return;

    this.loading = true;
    this.user = await this.userService.getUser(newId);
    this.loading = false;
  }
}
```

### Testing with Mocks

```typescript
import { Registration } from '@aurelia/kernel';
import { createFixture } from '@aurelia/testing';
import { UserDetail } from './user-detail';
import { UserService } from './user-service';

describe('UserDetail with mocked service', () => {
  it('loads user data', async () => {
    // Create a mock service
    const mockUserService = {
      getUser: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com'
      })
    };

    const { component, assertText, stop } = await createFixture
      .html`<user-detail user-id="1"></user-detail>`
      .deps(
        UserDetail,
        Registration.instance(UserService, mockUserService)
      )
      .build()
      .started;

    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify service was called
    expect(mockUserService.getUser).toHaveBeenCalledWith(1);

    // Verify component state
    expect(component.user).toEqual({
      id: 1,
      name: 'Alice',
      email: 'alice@example.com'
    });

    // Verify rendering
    assertText('Alice');
    assertText('alice@example.com');

    await stop(true);
  });
});
```

## Testing Best Practices

### 1. Write Descriptive Test Names

```typescript
// ✅ Good: Clear and specific
it('displays error message when username is empty', ...)

// ❌ Bad: Vague
it('works correctly', ...)
```

### 2. Test Behavior, Not Implementation

```typescript
// ✅ Good: Tests the outcome
it('adds item to list when button clicked', async () => {
  trigger.click('button');
  assertText('New item');
});

// ❌ Bad: Tests internal details
it('calls addItem method', async () => {
  const spy = jest.spyOn(component, 'addItem');
  trigger.click('button');
  expect(spy).toHaveBeenCalled();
});
```

### 3. Keep Tests Independent

Each test should work on its own:

```typescript
describe('Counter', () => {
  // ✅ Good: Each test is independent
  it('increments count', async () => {
    const { component } = await createFixture
      .html`<counter></counter>`
      .build().started;

    component.increment();
    expect(component.count).toBe(1);
    await stop(true);
  });

  it('decrements count', async () => {
    const { component } = await createFixture
      .html`<counter></counter>`
      .build().started;

    component.decrement();
    expect(component.count).toBe(-1);
    await stop(true);
  });
});
```

### 4. Use AAA Pattern

Organize tests with Arrange, Act, Assert:

```typescript
it('adds todo to list', async () => {
  // Arrange: Set up the test
  const { component, type, trigger } = await createFixture
    .html`<todo-list></todo-list>`
    .build().started;

  // Act: Perform the action
  type('input', 'Buy milk');
  trigger.click('button');

  // Assert: Verify the result
  expect(component.todos).toContain('Buy milk');

  await stop(true);
});
```

### 5. Test Edge Cases

```typescript
describe('Calculator', () => {
  it('handles division by zero', async () => {
    const { component } = await createFixture
      .html`<calculator></calculator>`
      .build().started;

    component.divide(10, 0);
    expect(component.result).toBe(Infinity);
    expect(component.error).toBe('Cannot divide by zero');

    await stop(true);
  });

  it('handles very large numbers', async () => {
    const { component } = await createFixture
      .html`<calculator></calculator>`
      .build().started;

    component.multiply(Number.MAX_SAFE_INTEGER, 2);
    expect(component.overflow).toBe(true);

    await stop(true);
  });
});
```

## Common Testing Patterns

### Setup and Teardown

Use `beforeEach` and `afterEach` for shared setup:

```typescript
describe('MyComponent', () => {
  let fixture: any;

  beforeEach(async () => {
    fixture = await createFixture
      .html`<my-component></my-component>`
      .deps(MyComponent)
      .build()
      .started;
  });

  afterEach(async () => {
    await fixture.stop(true);
  });

  it('test 1', () => {
    // Use fixture
  });

  it('test 2', () => {
    // Use fixture
  });
});
```

### Testing Async Operations

```typescript
it('loads data asynchronously', async () => {
  const { component, assertText, stop } = await createFixture
    .html`<data-loader></data-loader>`
    .deps(DataLoader)
    .build()
    .started;

  // Trigger async operation
  const loadPromise = component.loadData();

  // Check loading state
  expect(component.loading).toBe(true);

  // Wait for completion
  await loadPromise;

  // Check final state
  expect(component.loading).toBe(false);
  assertText('Data loaded');

  await stop(true);
});
```

### Snapshot Testing

Test that component output hasn't changed unexpectedly:

```typescript
it('matches snapshot', async () => {
  const { appHost, stop } = await createFixture
    .html`<my-component title="Test"></my-component>`
    .deps(MyComponent)
    .build()
    .started;

  expect(appHost.innerHTML).toMatchSnapshot();

  await stop(true);
});
```

## Troubleshooting

### "Platform not set" Error

**Solution**: Call `bootstrapTestEnvironment()` before creating fixtures:

```typescript
import { bootstrapTestEnvironment } from './test-setup';

beforeAll(() => {
  bootstrapTestEnvironment();
});
```

### Component Not Updating

**Solution**: Wait for the task queue to flush:

```typescript
import { tasksSettled } from '@aurelia/runtime';
import { IPlatform } from '@aurelia/runtime-html';

const { component, platform } = fixture;

component.value = 'new value';
await tasksSettled(); // Wait for updates

assertText('new value');
```

### Element Not Found

**Solution**: Check that the element exists and use the correct selector:

```typescript
// Debug: See what's rendered
fixture.printHtml();

// Use correct selector
const button = fixture.queryBy('button'); // Returns null if not found
if (!button) {
  console.log('Button not found!');
}
```

## Next Steps

Now that you understand the basics of testing:

- **[Testing Components](../developer-guides/testing/testing-components.md)**: Advanced component testing patterns
- **[Testing Quick Reference](../developer-guides/testing/README.md)**: Comprehensive testing API reference
- **[Testing Attributes](../developer-guides/testing/testing-attributes.md)**: Custom attribute testing
- **[Mocks and Spies](../developer-guides/testing/mocks-spies.md)**: Advanced mocking strategies

## Summary

Testing Aurelia applications is straightforward:

1. **Setup**: Configure Jest and initialize the test platform
2. **Create Fixtures**: Use `createFixture` to instantiate components
3. **Assert**: Use assertion helpers to verify behavior
4. **Cleanup**: Always call `stop(true)` to prevent memory leaks

Testing gives you confidence that your application works correctly and will continue to work as you make changes. Start testing today and build better, more reliable applications!
