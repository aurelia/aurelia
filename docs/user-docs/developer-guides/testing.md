# Testing

Testing is an integral part of modern development and Aurelia supports testing through helper methods and ways of instantiating the framework in a test environment. Aurelia supports numerous test runners including Jest and Mocha, the guiding test principles are the same.

When it comes to testing, Aurelia provides a testing package `@aurelia/testing` comes with some helpers functions including a fixture creation method that allows you to instantiate components and handle setup and teardown.

When you test components and other view resources in Aurelia, you will be writing integration tests where you will query the DOM for changes to content. Not quite a unit test, because we are testing behaviors of our code in the view. However, writing both integration and unit tests is highly recommended.

## Configuring the test environment

Because tests can be run in a wide variety of different environments, you need to set this part up prior to running tests. Setting up the environment requires configuring the platform using the `setPlatform` method.

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

const platform = new BrowserPlatform(window);
setPlatform(platform);
BrowserPlatform.set(globalThis, platform);
```

This initialization code can be placed in a shared file that all of your tests load, or it can be added to each test. The best approach to handle this is to create a function that you call to set this all up.

```typescript
import { BrowserPlatform } from '@aurelia/platform-browser';
import { setPlatform } from '@aurelia/testing';

function bootstrapTestEnvironment() {
    const platform = new BrowserPlatform(window);
    setPlatform(platform);
    BrowserPlatform.set(globalThis, platform);
}
```

You can then call this function at the beginning of each new test to specify the environment for the tests to run in.

## A basic test

For a basic test example, we'll use the `au-compose` element and test that our view string is rendered into the page. Using the `createFixture` method, we'll get back a few different properties we can use to determine test status and content to query.

```typescript
import { assert, createFixture } from '@aurelia/testing';

// An assumption is being made you called the code defined in the first part
// of these docs to set up the environment.

describe('My basic test', function() {
    it('should pass test', async function() {
      const { appHost, startPromise, tearDown } = createFixture(
        '<au-compose view="<div>hello world</div>The ">'
      );

      await startPromise;
      assert.strictEqual(appHost.textContent, 'hello world');

      await tearDown();

      assert.strictEqual(appHost.textContent, '');
    });
});
```

The `createFixture` method is being used in a simple way here (specifying HTML to render), but it can do so much more. You can pass in your own view model as the second argument (a class with properties), and for the third argument passing in resource dependencies such as components, value converters and so on.

## Testing components

In the basic setup section, you kind of already saw how to test a component. In our example, we tested the `au-compose` element, but in most instances, you will be testing your own components to make sure they render properly and handle data.

To showcase how we can not only test components but also components with bindable properties, we are going to create a fictitious example.

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

A custom attribute is very much like a component, except it doesn't have its own view. Using the same testing techniques we learned in the components section, we can easily test our custom attributes too.

Before we write any tests, let's create a custom attribute that adds a color border to the element it is used on. We created this attribute in the Custom Attributes section. A simple, but effective attribute that will have a predictable outcome we can test for.

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

Our color square attribute will make an element uniform in size (same height and width), as well as allow a color value to be set.

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

Our basic test here confirms that our custom attribute is modifying the width (default value 100px). We query for this element using its ID, but we could also target it using the custom attribute as well. The `appHost` is the dom our test is being instrumented in. We query for our element using its ID and then assert the `width` property on the style object.

You might notice that the way we instrument our test is similar to how we do it for components. The first argument of `createFixture` is our HTML view, the second is our view model where we can define values to bind in our view model and the third is where we can specify dependencies (custom elements, value converters, components) being used.

## How to mock DI dependencies

One of the advantages of using dependency injection is how easy it makes mocking DI dependencies. Some people have strong opinions on mocks, but in Aurelia, they can make your life stress free when testing your apps.
