# How to Mock, Stub, and Spy on DI Dependencies

Testing in Aurelia often involves testing components that have dependencies injected into them. Using dependency injection (DI) simplifies the process of replacing these dependencies with mocks, stubs, or spies during testing. This can be particularly useful when you need to isolate the component under test from external concerns like API calls or complex logic.

## Understanding Mocks, Stubs, and Spies

- **Mocks** are objects that replace real implementations with fake methods and properties that you define. They are useful for simulating complex behavior without relying on the actual implementation.
- **Stubs** are like mocks but typically focus on replacing specific methods or properties rather than entire objects. They are useful when you want to control the behavior of a dependency for a particular test case.
- **Spies** allow you to wrap existing methods so that you can record information about their calls, such as the number of times they were called or the arguments they received.

## Using Sinon for Mocking, Stubbing, and Spying

Sinon is a popular library for creating mocks, stubs, and spies in JavaScript tests. It provides a rich API for controlling your test environment and can significantly simplify the process of testing components with dependencies.

### Installing Sinon

To make use of Sinon in your Aurelia project, you need to install it along with its type definitions for TypeScript support:

```shell
npm install sinon @types/sinon -D
```

{% hint style="warning" %}
If you are not using TypeScript, you can omit the `@types/sinon`.
{% endhint %}

### Using Sinon in Your Tests

After installing Sinon, import it in your test files to access its functionality. Let's look at how to apply Sinon to mock, stub, and spy on dependencies in Aurelia components.

{% code title="my-component.ts" %}
```typescript
import { IRouter } from '@aurelia/router';
import { customElement } from 'aurelia';

@customElement('my-component')
export class MyComponent {
    constructor(@IRouter private router: IRouter) {}

    navigate(path: string) {
        return this.router.load(path);
    }
}
```
{% endcode %}

In this example, the `MyComponent` class has a dependency on `IRouter` and a method `navigate` that delegates to the router's `load` method.

### Stubbing Individual Methods

To stub the `load` method of the router, use Sinon's `stub` method:

```typescript
import { createFixture } from '@aurelia/testing';
import { MyComponent } from './my-component';
import { IRouter } from '@aurelia/router';
import sinon from 'sinon';

describe('MyComponent', () => {
    it('should stub the load method of the router', async () => {
        const { startPromise, component, container, tearDown } = createFixture(
            `<my-component></my-component>`,
            MyComponent,
            []
        );

        await startPromise;

        const router = container.get(IRouter);
        const stub = sinon.stub(router, 'load').returnsArg(0);

        expect(component.navigate('nowhere')).toBe('nowhere');

        stub.restore();
        await tearDown();
    });
});
```

### Mocking an Entire Dependency

When you need to replace the entire dependency, create a mock object and register it in place of the real one:

```typescript
import { createFixture, Registration } from '@aurelia/testing';
import { MyComponent } from './my-component';
import { IRouter } from '@aurelia/router';

const mockRouter = {
    load(path: string) {
        return path;
    }
};

describe('MyComponent', () => {
    it('should use a mock router', async () => {
        const { startPromise, component, tearDown } = createFixture(
            `<my-component></my-component>`,
            MyComponent,
            [],
            [Registration.instance(IRouter, mockRouter)]
        );

        await startPromise;

        expect(component.navigate('nowhere')).toBe('nowhere');

        await tearDown();
    });
});
```

By using `Registration.instance`, we can ensure that any part of the application being tested will receive our mock implementation when asking for the `IRouter` dependency.

### Spying on Methods

To observe and assert the behavior of methods, use Sinon's spies:

{% code title="magic-button.ts" %}
```typescript
import { customElement } from 'aurelia';

@customElement('magic-button')
export class MagicButton {
    callbackFunction(event: Event, id: number) {
        return this.save(event, id);
    }

    save(event: Event, id: number) {
        // Pretend to call an API or perform some action...
        return `${id}__special`;
    }
}
```
{% endcode %}

To test that the `save` method is called correctly, wrap it with a spy:

{% code title="magic-button.spec.ts" %}
```typescript
import { createFixture } from '@aurelia/testing';
import { MagicButton } from './magic-button';
import sinon from 'sinon';

describe('MagicButton', () => {
    it('calls save when callbackFunction is invoked', async () => {
        const { startPromise, component, tearDown } = createFixture(
            `<magic-button></magic-button>`,
            MagicButton
        );

        await startPromise;

        const spy = sinon.spy(component, 'save');
        component.callbackFunction(new Event('click'), 123);

        expect(spy.calledOnceWithExactly(new Event('click'), 123)).toBeTruthy();

        spy.restore();
        await tearDown();
    });
});
```
{% endcode %}

## Mocking Dependencies Directly in the Constructor

Unit tests may require you to instantiate classes manually rather than using Aurelia's `createFixture`. In such cases, you can mock dependencies directly in the constructor:

{% code title="my-component.spec.ts" %}
```typescript
import { MyComponent } from './my-component';
import { IRouter } from '@aurelia/router';

describe('MyComponent', () => {
    const mockRouter: IRouter = {
        load(path: string) {
            return path;
        }
        // ... other methods and properties
    };

    it('should navigate using the mock router', () => {
        const component = new MyComponent(mockRouter);

        expect(component.navigate('somewhere')).toBe('somewhere');
    });
});
```
{% endcode %}

In this test, we directly provide a mock router object when creating an instance of `MyComponent`. This technique is useful for more traditional unit testing where you want to test methods in isolation.

## Conclusion

Mocking, stubbing, and spying are powerful techniques that can help you write more effective and isolated tests for your Aurelia components. By leveraging tools like Sinon and Aurelia's dependency injection system, you can create test environments that are both flexible and easy to control. Whether you're writing unit tests or integration tests, these methods will enable you to test your components' behavior accurately and with confidence.
