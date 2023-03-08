---
description: >-
  Learn how to write unit and end-to-end tests for Aurelia applications.
  Strategies for mocking, component instantiation and more are detailed in this
  comprehensive guide.
---

# Testing

Testing is an integral part of modern development, and Aurelia supports testing through helper methods and ways of instantiating the framework in a test environment. Aurelia supports numerous test runners, including Jest and Mocha, and the guiding test principles are the same.

When it comes to testing, Aurelia provides a testing package `@aurelia/testing` comes with some helpers functions, including a fixture creation method that allows you to instantiate components and handle setup and teardown.

When you test components and other view resources in Aurelia, you will write integration tests and query the DOM for changes to content. Not quite a unit test because we are testing behaviors of our code in the view. However, writing both integration and unit tests is highly recommended.

## Unit vs integration vs e2e tests

If you are new to testing or inexperienced, it is worth noting that when dealing with tests in Aurelia, they are broken down into three distinct categories.

* **Unit tests** — Testing units of your code independently (if statements, function calls, throws, etc.). Most commonly, a unit test involves testing the code itself.
* **Integration tests** — An integration test is an evolutionary leap on unit tests. Instead of testing lines of code in isolation, you test them as a whole. In Aurelia, an integration test commonly refers to staging a resource (component, attribute, value converter) and testing it to have the desired outcome in the UI.
* **End-to-end tests (E2E)** — An e2e test allows you to test behavior in the browser. Think of test cases involving logging into your application and being redirected to a dashboard screen, a button triggering a popup. These are things you would test for in an e2e test.

In the Aurelia documentation, we will not be covering e2e tests as those are outside the realm of the framework itself. Although, we do highly recommend Cypress for end-to-end testing.

## Configuring the test environment

Because tests can be run in various environments, you need to set this part up before running tests. Setting up the environment requires configuring the platform using the `setPlatform` method.

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);
```

This initialization code can be placed in a shared file that all your tests load, or it can be added to each test. The best approach to handle this is to create a function that you call to set this all up.

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

## A basic test

For a basic test example, we'll use the `au-compose` element and test that our view string is rendered into the page. Using the `createFixture` method, we'll get back a few different properties we can use to determine the test status and content to query.

```typescript
import { assert, createFixture } from '@aurelia/testing';

// An assumption is being made you called the code defined in the first part
// of these docs to set up the environment.

describe('My basic test', function() {
    it('should pass test', async function() {
      const { appHost, startPromise, tearDown } = createFixture(
        '<au-compose template="<div>hello world</div>The ">'
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, 'hello world');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });
});
```

The `createFixture` method is being used here (specifying HTML to render), but it can do much more. You can pass in your view model as the second argument (a class with properties), and for the third argument, pass in resource dependencies such as components, value converters, etc.

## Testing components

You already saw how to test a component in the basic setup section. In our example, we tested the `au-compose` element, but in most instances, you will be testing your components to ensure they render properly and handle data.

To showcase how we can test components and components with bindable properties, we will create a fictitious example.

{% code title="person-detail.ts" %}
```typescript
import { bindable } from 'aurelia';

export class PersonDetail {
    @bindable name;
    @bindable age;
}
```
{% endcode %}

Now, we'll create a view for our custom element:

{% code title="person-detail.html" %}
```html
<p>Person is called ${name} and is ${age} years old.</p>
```
{% endcode %}

### Writing the test

We want to test that our custom element says what it should say when data is passed into it.

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { assert, createFixture, setPlatform } from '@aurelia/testing';

import { PersonDetail } from './person-detail';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);

describe('Person Detail', function() {
    it('should render when passed name and age', async function() {
      const { appHost, startPromise, tearDown } = createFixture(
        '<person-detail name.bind="personName" age.bind="personAge"></person-detail>',
        class App {
            personName = 'Rob';
            personAge = 29;
        },
        [ PersonDetail ]
      );

      await startPromise;

      assert.strictEqual(appHost.textContent, 'Person is called Rob and is 29 years old.');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });
})
```

## Testing custom attributes

A custom attribute is like a component, except it doesn't have a view template. Using the same testing techniques we learned in the components section, we can also easily test our custom attributes.

Before we write any tests, let's create a custom attribute that adds a color border to the element used. We created this attribute in the Custom Attributes section. A simple but effective attribute that will have a predictable outcome we can test for.

{% code title="color-square.ts" %}
```typescript
  import { bindable, customAttribute, INode } from 'aurelia';

  @customAttribute('color-square')
  export class ColorSquareCustomAttribute {
    @bindable() color: string = 'red';
    @bindable() size: string = '100px';

    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = this.size;
        this.element.style.backgroundColor = this.color;
    }

    bound() {
      this.element.style.width = this.element.style.height = this.size;
      this.element.style.backgroundColor = this.color;
    }

    colorChanged(newColor, oldColor) {
      this.element.style.backgroundColor = newColor;
    }

    sizeChanged(newSize: string, oldSize: string) {
      this.element.style.width = this.element.style.height = newSize;
    }
}
```
{% endcode %}

Our color square attribute will make an element uniform in size (same height and width) and allow a color value to be set.

{% code title="color-square.spec.ts" %}
```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { assert, createFixture, setPlatform } from '@aurelia/testing';

import { ColorSquareCustomAttribute } from './color-square';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);

describe('Color Square', function() {
    it('works with default values', async function() {
      const { appHost, startPromise, tearDown } = createFixture(
        '<div id="attributeel" color-square></div>',
        class App {},
        [ ColorSquareCustomAttribute ]
      );

      await startPromise;

      const el = appHost.querySelector('#attributeel') as HTMLElement;

      assert.strictEqual(el.style.width, '100px');

      await tearDown();
    });
});
```
{% endcode %}

Our basic test confirms that our custom attribute modifies the width (default value 100px). We query for this element using its ID, but we could also target it using the custom attribute. The `appHost` is the dom our test is being instrumented in. We query for our element using its ID and then assert the `width` property on the style object.

You might notice how we instrument our test similarly to how we do it for components. The first argument of `createFixture` is our HTML view, the second is our view model where we can define values to bind in our view model, and the third is where we can specify dependencies (custom elements, value converters, components) being used.

## Testing value converters

If you have tried writing tests for components and attributes, value converters will once again feel familiar to you. Where value converters differ is you will write both unit and integration tests (in the same file).

Let's start by creating a value converter we can test, something that takes a string and then transforms it to uppercase.

{% code title="to-uppercase.ts" %}
```typescript
import { valueConverter } from 'aurelia';

@valueConverter('toUpper')
export class ToUpper {
    toView(str) {
        if (!str) {
            return str;
        }

        return str.toUpperCase();
    }
}
```
{% endcode %}

Our value converter checks if the value is valid, and if it is, it returns the value in uppercase. Otherwise, the value provided is returned.

Now, onto our test. Our test is going to test the code itself, as well as being used inside of a view template with different types of values.

{% code title="to-uppercase.spec.ts" %}
```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { assert, createFixture, setPlatform } from '@aurelia/testing';

import { ToUpper } from './to-upper';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);

describe('To Upper', function() {
    // Passing in null should return null
    it('returns invalid values', function() {
        const sut = new ToUpper();

        assert.strictEqual(sut.toView(null), null);
    });

    // Passing in a string should return in uppercase
    it('returns provided string as uppercase', function() {
        const sut = new ToUpper();

        assert.strictEqual(sut.toView('rOb wAs hErE'), 'ROB WAS HERE');
    });

    // Passing in a string containing numbers should return only string in uppercase
    it('returns provided string as uppercase', function() {
        const sut = new ToUpper();

        assert.strictEqual(sut.toView('rOb wAs hErE'), 'ROB WAS HERE');
    });

    it('works in a view', async function() {
      const { appHost, startPromise, tearDown } = createFixture(
        '<div>${text | toUpper}</div>',
        class App {
            text = 'rob is here 123';
        },
        [ ToUpper ]
      );

      await startPromise;

      assert.strictEqual(appHost.textContent, 'ROB IS HERE 123');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });
});
```
{% endcode %}

With the first three tests, we instantiated the value converter directly and did not run it through the Aurelia pipeline. It's just a class with a method that we call with values. Notice how we provide an invalid value, a valid value and a value containing a mixture of numbers and strings? We are covering all of our bases and seeing how our value converter handles mixed input.

{% hint style="info" %}
Good tests test all different outcomes. A successful outcome, an unsuccessful outcome and unknown outcomes.
{% endhint %}

This approach can be used for many class-based codes you might have. You don't have to use the fixture bootstrap functionality to test code, it's great for testing component output and behaviors, but for code unit tests, it is not needed.

## How to mock, stub and spy on DI dependencies

One of the advantages of using dependency injection is how easy it makes mocking DI dependencies. Some people have strong opinions on mocks, but in Aurelia, they can make your life stress-free when testing your apps. A mock allows you to replace complicated code, such as server calls, with code that works the same way but doesn't make real calls.

When you mock a dependency, you're replacing the real version with a fake stub or hijacking calls and writing the return functionality on the fly. There is no right or wrong way to mock dependencies.

### Mocks, spies and stubs using Sinon

Sinon is a powerful and well-known library for adding mock, stub and spy functionality to your tests. For more complex tests, a library like Sinon will make testing a lot more enjoyable and prevent the need to reimplement the same functionality.

#### Install Sinon and types:

If you are not using TypeScript, you can omit the `@types/sinon` however, if you are using TypeScript, keep it, so you get intellisense when writing tests and referencing the Sinon package and its methods.

{% hint style="warning" %}
If you are not using TypeScript, you won't need to install `@types/sinon`
{% endhint %}

```shell
npm install sinon @types/sinon -D
```

Inside your tests, you import the Sinon package and reference it inside of your test cases.

Before we do that, let's create a basic component with an injected dependency and see how we can mock it.

{% code title="my-component.ts" %}
```typescript
import { IRouter } from '@aurelia/router';
import { customElement } from 'aurelia';

@customElement('my-component')
export class MyComponent {
    constructor(@IRouter private router: IRouter) {

    }

    navigate(path) {
        return this.router.load(path);
    }
}
```
{% endcode %}

This simplistic component injects the router and has a method called `navigate` which loads a route when called. It's a contrived example because you probably wouldn't do this in a real application, but it allows us to see how we can mock and stub inside tests.

#### Stubbing individual methods

In this test, we will use a Sinon stub to stub out the `load` method inside the router instance. This saves us from having to go and completely implement the router in mock form. We only care about one function here.

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { assert, createFixture, setPlatform } from '@aurelia/testing';
import { IRouter, RouterConfiguration } from '@aurelia/router';

import { MyComponent } from '../src/components/my-component';

import sinon from 'sinon';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);

describe('Component Test', function() {

    it('should mock dependencies', async function() {
        const { startPromise, appHost, tearDown, component, ctx, container } = createFixture(
            `<my-component></my-component>`,
            MyComponent,
            [ RouterConfiguration ]
          );

          await startPromise;

          // The router property is private, so get the router instance
          // from the container
          const router = container.get(IRouter);

          // Stub load and return first argument
          sinon.stub(router, 'load').returnsArg(0);

          assert.strictEqual(component.navigate('nowhere'), 'nowhere');

          await tearDown();
    });
});
```

#### Mocking an entire dependency

Sometimes, you will want to replace a dependency with a fake version completely. Maybe the Fetch API or something else primarily does things external to your code. For that, you can mock the entire dependency itself.

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { assert, createFixture, setPlatform } from '@aurelia/testing';
import { IRouter, RouterConfiguration } from '@aurelia/router';

import { MyComponent } from '../src/components/my-component';

import sinon from 'sinon';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);

const mockRouter = {
    load(path) {
        return path;
    }
};

describe('Component Test', function() {

    it('should mock dependencies', async function() {
        const { startPromise, appHost, tearDown, component, ctx, container } = createFixture(
            `<my-component></my-component>`,
            MyComponent,
            [ Registration.instance(IRouter, mockRouter) ]
          );

          await startPromise;

          assert.strictEqual(component.navigate('nowhere'), 'nowhere');

          await tearDown();
    });
});
```

When our component requests the dependency `IRouter` , our registered instance provided to the third argument  `createFixture` will be the value it gets instead of the default one. Because our mocked `load` method is doing what our stub did, the result is the same.

We use the `Registration.instance` method to register our mock router as an instance of `IRouter` which all parts of our application we are testing will use. For more information on how this works, consult the [Dependency Injection](../getting-to-know-aurelia/dependency-injection-di/) section to learn more.

#### Spying on methods

Kind of like a stub, a spy allows you to observe methods and determine when they are called. Maybe your component has a button with a callback function that gets triggered when the button is pressed. You don't want to reimplement the callback, but you want to make sure it gets called.

Where spies are useful is not only in knowing when a method is called but how many times it was called and what parameters it was supplied.

{% code title="magic-button.ts" %}
```typescript
import { customElement } from 'aurelia';

@customElement('magic-button')
export class MagicButton {
    callbackFunction(event, id) {
        return this.save(event, id);
    }

    save(event, id) {
        // This would call the API or something...
        return `${id}__special`;
    }
}
```
{% endcode %}

Now, let's create our test for our magic button. We want to spy on the `save` method inside of our component, so we use `sinon.spy` to create a spy. We can then determine if the method is called or not. We know our `callbackFunction` method calls it, so we call that.

{% code title="magic-button.spec.ts" %}
```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { assert, createFixture, setPlatform } from '@aurelia/testing';

import { MagicButton } from '../src/components/magic-button';

import sinon from 'sinon';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);

describe('Magic Button', function() {

    it('magic button calls save function', async function() {
        const { startPromise, appHost, tearDown, component, ctx, container } = createFixture(
            `<magic-button></magic-button>`,
            MagicButton
          );

          await startPromise;

          const save = sinon.spy(component, 'save');

          component.callbackFunction(new CustomEvent('test'), 2);

          save.restore();
          sinon.assert.calledOnce(save);

          await tearDown();
    });
});
```
{% endcode %}

### Mocks via the constructor

Sometimes you want to mock dependencies directly on the constructor itself. This approach means you will manually instantiate your classes and not stage them like you would integration tests using `createFixture`.

You would use this approach when taking a more traditional unit test approach to testing.

We'll take the same custom element from the above section:

{% code title="my-element.ts" %}
```typescript
import { customElement } from 'aurelia';

@customElement('my-component')
export class MyComponent {
    constructor(@IRouter private router: IRouter) {

    }

    navigate(path) {
        return this.router.load(path);
    }
}
```
{% endcode %}

Inside our test file, you'll notice things are a little cleaner than in the previous examples. This is because we don't stage the component anymore. We instantiate it ourselves. We lose the ability to query the HTML, but it allows us to test the code in a more traditional sense (which you might prefer).

{% code title="my-element.spec.ts" %}
```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { assert, setPlatform } from '@aurelia/testing';
import { IRouter, RouterConfiguration } from '@aurelia/router';

import { MyComponent } from '../src/components/my-component';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);

describe('Component Test', function() {

    // We need any or TypeScript will complain it's not a proper router instance
    const mockRouter: any = {
        load(path) {
            return path;
        }
    };

    it('should mock dependencies', function() {
        const sut = new MyElement(mockRouter);

        assert.strictEqual(sut.navigate('nowhere'), 'nowhere');
    });
});
```
{% endcode %}

As you can see in our test, we create an object that we provide in place of the router that would usually be injected. We are making the router `load` method return whatever is provided to it. We want to make sure the load method is called.

This approach does mean you have to stub and mock the entire implementation, but it can be convenient for situations where you only want to test a couple of methods.
