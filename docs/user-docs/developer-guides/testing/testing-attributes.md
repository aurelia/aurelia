# Testing Custom Attributes

Testing custom attributes in Aurelia 2 is analogous to testing components, with the primary difference being that custom attributes do not have a view template. They are, however, responsible for modifying the behavior or appearance of existing DOM elements. By leveraging the same testing techniques used for components, we can effectively validate the functionality of our custom attributes.

## Example Custom Attribute

Let's consider a `ColorSquareCustomAttribute` that we previously created. This attribute applies a color border and sets the size of an element, resulting in a square of uniform dimensions with a colored background.

{% code title="color-square.ts" %}
```typescript
import { bindable, customAttribute, INode } from 'aurelia';

@customAttribute('color-square')
export class ColorSquareCustomAttribute {
  @bindable color: string = 'red';
  @bindable size: string = '100px';

  constructor(@INode private element: HTMLElement) {
    this.element.style.width = this.size;
    this.element.style.height = this.size;
    this.element.style.backgroundColor = this.color;
  }

  bound() {
    this.element.style.width = this.size;
    this.element.style.height = this.size;
    this.element.style.backgroundColor = this.color;
  }

  colorChanged(newColor: string) {
    this.element.style.backgroundColor = newColor;
  }

  sizeChanged(newSize: string) {
    this.element.style.width = newSize;
    this.element.style.height = newSize;
  }
}
```
{% endcode %}

## Testing the Custom Attribute

We will now write tests to ensure that the `ColorSquareCustomAttribute` behaves as expected when applied to an element.

### Test Setup

Before writing tests, ensure that your test environment is properly configured. The setup for testing custom attributes is the same as for components, so you can refer to the previous [Configuring the Test Environment](#configuring-the-test-environment) section.

### Writing Tests

Create a test file for your custom attribute, such as `color-square.spec.ts`, and use the following example as a guide:

{% code title="color-square.spec.ts" %}
```typescript
import { createFixture } from '@aurelia/testing';
import { ColorSquareCustomAttribute } from './color-square';
import { bootstrapTestEnvironment } from './path-to-your-initialization-code';

describe('ColorSquareCustomAttribute', () => {
  beforeAll(() => {
    // Initialize the test environment before running the tests
    bootstrapTestEnvironment();
  });

  it('applies default width and color', async () => {
    const { appHost, startPromise, tearDown } = createFixture(
      '<div id="attributeel" color-square></div>',
      class App {},
      [ColorSquareCustomAttribute]
    );

    await startPromise;

    const el = appHost.querySelector('#attributeel') as HTMLElement;

    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('100px');
    expect(el.style.backgroundColor).toBe('red');

    await tearDown();
  });

  it('reacts to color changes', async () => {
    const { appHost, component, startPromise, tearDown } = createFixture(
      '<div color-square="color.bind: newColor; size.bind: newSize"></div>',
      class App {
        newColor = 'blue';
        newSize = '150px';
      },
      [ColorSquareCustomAttribute]
    );

    await startPromise;

    const colorSquareAttribute = component.viewModel as ColorSquareCustomAttribute;

    // Test initial state
    expect(appHost.firstElementChild.style.backgroundColor).toBe('blue');
    expect(appHost.firstElementChild.style.width).toBe('150px');
    expect(appHost.firstElementChild.style.height).toBe('150px');

    // Change color property
    colorSquareAttribute.color = 'green';
    colorSquareAttribute.colorChanged('green', 'blue');

    expect(appHost.firstElementChild.style.backgroundColor).toBe('green');

    await tearDown();
  });

  // Additional tests...
});
```
{% endcode %}

In the first test, we verify that the default size and color are applied to an element when the custom attribute is used without any bindings. In the second test, we bind the color and size properties and then change the color to ensure the `colorChanged` method updates the element's style as expected.

### Testing Approach

As with components, we use `createFixture` to set up our test environment. The first argument is the HTML view where we use our custom attribute. The second argument is the view model, which can define values to bind in our view model if needed. The third argument specifies any dependencies required by our tests, such as custom elements, value converters, or attributes.

## Conclusion

Testing custom attributes in Aurelia 2 is essential to ensure they correctly manipulate DOM elements as intended. By setting up a proper testing environment, creating fixtures, and writing assertions, we can confidently verify that our custom attributes perform their duties correctly. Always remember to clean up your tests to maintain a pristine testing state.
