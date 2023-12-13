# Template References

Template references in Aurelia 2 provide a powerful and flexible way to connect your HTML templates with your JavaScript or TypeScript view models. Using the ref attribute, you can easily identify and interact with specific parts of your template, making it more efficient to manipulate the DOM or access template data.

## Declaring Template References

### Basic Usage
Add the ref attribute to an HTML element within your template to create a template reference. This marks the element as a reference, allowing you to access it directly in your view model.

```html
<input type="text" ref="myInput" placeholder="First name">
```

In this example, `myInput` references the input element, which can be used both in the template and the corresponding view model.

### Accessing Reference in Template

Template references are immediately available within the template. For instance, you can display the value of the input field as follows:

```html
<p>${myInput.value}</p>
```

This binding displays the current value of the input field dynamically.

### Accessing Reference in View Model

To access the referenced element in the view model, declare a property with the same name as the reference. For TypeScript users, it's important to define the type of this property for type safety.

```typescript
export class MyApp {
  private myInput: HTMLInputElement;

  // Additional view model logic here
}
```

## Advanced Usage

### Working with Custom Elements and Attributes

Aurelia's `ref` attribute is not limited to standard HTML elements. It can also be used with custom elements and attributes to reference their component instances (view-models) or controllers.

**Custom Element Instance** 
Use `component.ref="expression"` to create a reference to a custom element's component instance (view-model). This was known as `view-model.ref` in Aurelia v1.

```html
<my-custom-element component.ref="customElementVm"></my-custom-element>
```

**Custom Attribute Instance**
Similarly, `custom-attribute.ref="expression"` can reference a custom attribute's component instance (view-model).

```html
<div my-custom-attribute custom-attribute.ref="customAttrVm"></div>
```

**Controller Instance**
For more advanced scenarios, `controller.ref="expression"` creates a reference to a custom element's controller instance.

```html
<my-custom-element controller.ref="customElementController"></my-custom-element>
```

## Practical Applications
Template references are incredibly useful for integrating with third-party libraries or when direct DOM manipulation is necessary. Instead of using traditional JavaScript queries to find elements, template references provide a more straightforward, framework-integrated approach.

{% hint style="info" %}
Leveraging template references can greatly simplify interactions with elements, particularly when integrating with libraries that require direct DOM element references. This approach promotes cleaner and more maintainable code by reducing reliance on direct DOM queries.
{% endhint %}
