# Template References (`ref`)

Template references in Aurelia 2 offer a powerful and declarative mechanism to establish direct links between elements in your HTML templates and properties in your JavaScript or TypeScript view models. Using the `ref` attribute, you can easily obtain references to specific DOM elements, custom element instances, custom attribute instances, or even Aurelia controllers, enabling efficient DOM manipulation and streamlined interaction with template elements.

## Declaring Template References

### Basic Usage: Referencing DOM Elements

To create a template reference to a standard HTML element, simply add the `ref` attribute to the element within your template. The value assigned to `ref` will be the name of the property in your view model that will hold the reference.

```html
<input type="text" ref="firstNameInput" placeholder="First name">
```

In this basic example, `firstNameInput` is declared as a template reference. Aurelia will automatically populate a property in your view model with the same name, making the `<input>` element directly accessible.

### Accessing References in Templates

Template references become immediately available for use within the template itself.  You can directly access properties and methods of the referenced element using the reference name.

For example, to dynamically display the current value of the `firstNameInput` field:

```html
<p>You are typing: "${firstNameInput.value}"</p>
```

As the user types in the input field, the `<p>` element will update in real-time, displaying the current value accessed through `firstNameInput.value`.

### Accessing References in View Models

To access a template reference in your view model, you need to declare a property in your view model class that matches the reference name you used in the template.  For TypeScript projects, it's strongly recommended to explicitly type this property for enhanced type safety and code maintainability.

```typescript
import { customElement } from 'aurelia';

@customElement({ name: 'my-app', template: `<input type="text" ref="firstNameInput" placeholder="First name">` })
export class MyApp {
  firstNameInput: HTMLInputElement; // Explicitly typed template reference

  bound() {
    // 'firstNameInput' is now available after the view is bound
    console.log('Input element reference:', this.firstNameInput);
  }

  focusInput() {
    if (this.firstNameInput) {
      this.firstNameInput.focus(); // Programmatically focus the input element
    }
  }
}
```

**Important Notes:**

- **Property Naming**: The property name in your view model *must* exactly match the value of the `ref` attribute in your template (`firstNameInput` in the example above).
- **Type Safety**: In TypeScript, always declare the type of your template reference property (e.g., `HTMLInputElement`, `HTMLDivElement`, `MyCustomElement`). This improves code readability and helps catch type-related errors early.
- **Lifecycle Timing**: Template references are *not* available during the view model's constructor. They become available after the view is bound to the view model, typically in lifecycle hooks like `bound()` or later.

## Advanced Usage: Referencing Components and Controllers

Aurelia's `ref` attribute extends beyond simple DOM elements. It provides powerful options to reference component instances and controllers of custom elements and attributes.

### 1. `component.ref`: Referencing Custom Element Instances (View Models)

To obtain a reference to the *view model instance* of a custom element, use `component.ref="expression"`. This was previously known as `view-model.ref` in Aurelia v1.

```html
<my-custom-element component.ref="customElementViewModel"></my-custom-element>
```

In your view model:

```typescript
import { customElement } from 'aurelia';
import { MyCustomElement } from './my-custom-element'; // Assuming MyCustomElement is defined elsewhere

@customElement({ name: 'app', template: `<my-custom-element component.ref="customElementViewModel"></my-custom-element>` })
export class App {
  customElementViewModel: MyCustomElement; // Typed reference to the custom element's view model

  interactWithCustomElement() {
    if (this.customElementViewModel) {
      this.customElementViewModel.someMethodOnViewModel(); // Call a method on the custom element's view model
    }
  }
}
```

`component.ref` is invaluable when you need to directly interact with the logic and data encapsulated within a custom element's view model from a parent component.

### 2. `custom-attribute.ref`: Referencing Custom Attribute Instances (View Models)

Similarly, to reference the *view model instance* of a custom attribute applied to an element, use `custom-attribute.ref="expression"`.

```html
<div my-custom-attribute custom-attribute.ref="customAttributeViewModel"></div>
```

In your view model:

```typescript
import { customElement } from 'aurelia';
import { MyCustomAttribute } from './my-custom-attribute'; // Assuming MyCustomAttribute is defined elsewhere

@customElement({ name: 'app', template: `<div my-custom-attribute custom-attribute.ref="customAttributeViewModel"></div>` })
export class App {
  customAttributeViewModel: MyCustomAttribute; // Typed reference to the custom attribute's view model

  useCustomAttribute() {
    if (this.customAttributeViewModel) {
      this.customAttributeViewModel.doSomethingWithAttribute(); // Call a method on the custom attribute's view model
    }
  }
}
```

`custom-attribute.ref` is useful when you need to interact with the behavior or state managed by a custom attribute from the surrounding view model.

### 3. `controller.ref`: Referencing Aurelia Controller Instances (Advanced)

For more advanced scenarios, `controller.ref="expression"` allows you to access the *Aurelia Controller instance* of a custom element. The Controller provides access to Aurelia's internal workings and lifecycle management for the element. This is less commonly needed but can be powerful for framework-level integrations or very specific use cases.

```html
<my-custom-element controller.ref="customElementController"></my-custom-element>
```

In your view model:

```typescript
import { customElement, Controller } from 'aurelia';

@customElement({ name: 'app', template: `<my-custom-element controller.ref="customElementController"></my-custom-element>` })
export class App {
  customElementController: Controller; // Typed reference to the custom element's Controller

  accessControllerDetails() {
    if (this.customElementController) {
      console.log('Custom Element Controller:', this.customElementController);
      // You can access lifecycle state, bindings, etc. through the controller
    }
  }
}
```

`controller.ref` provides access to the Aurelia Controller, which is an advanced API and typically used for framework extension or very specific control over component lifecycle and binding. For most application development, `component.ref` or direct DOM element references are sufficient.

## Practical Applications and Benefits

Template references significantly enhance Aurelia development by providing a clean, framework-integrated way to interact with elements and components. They offer several key advantages:

- **Direct DOM Manipulation**: Template references provide a structured and type-safe way to obtain direct references to DOM elements, which is essential for tasks like:
    - Focusing input fields programmatically (`elementRef.focus()`).
    - Imperative DOM manipulation when integrating with third-party libraries that require direct element access (e.g., initializing jQuery plugins, interacting with canvas elements, etc.).
    - Fine-grained control over element properties and attributes.

- **Component Interaction**: `component.ref` and `custom-attribute.ref` enable seamless communication and interaction between parent components and their children (custom elements and attributes). This allows for:
    - Calling methods on child component view models.
    - Accessing data and state within child components.
    - Building more complex and encapsulated component structures.

- **Simplified DOM Access**: Template references eliminate the need for manual DOM queries using `document.querySelector` or similar methods within your view models. This leads to:
    - Cleaner and more readable view model code.
    - Reduced risk of brittle selectors that break if the template structure changes.
    - Improved maintainability and refactoring capabilities.

- **Integration with Third-Party Libraries**: Many JavaScript libraries require direct DOM element references for initialization or interaction. Template references provide the ideal mechanism to obtain these references within an Aurelia application without resorting to less maintainable DOM query approaches.

{% hint style="info" %}
By using template references, you move away from string-based DOM queries and embrace a more declarative and type-safe approach to DOM and component interaction within your Aurelia applications. This leads to more robust, maintainable, and efficient code, especially when dealing with complex UI interactions or integrations with external libraries.
{% endhint %}
