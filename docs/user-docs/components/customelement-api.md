# CustomElement API

The `CustomElement` resource is a core concept in Aurelia 2, enabling developers to create encapsulated and reusable components. Understanding how to leverage the `CustomElement` API is crucial for building robust applications. In this documentation, we will delve into the usage of `CustomElement` and its methods, providing detailed examples and explanations.

## CustomElement.for

This method retrieves the Aurelia controller associated with a DOM node. The controller offers access to the element's view-model, lifecycle, and other properties.

### Usage Examples

#### Retrieving a Controller for the Current Node

```typescript
import { CustomElement } from 'aurelia';

const myElement = document.querySelector('.my-custom-element');
try {
  const controller = CustomElement.for(myElement);
  // You can now interact with the custom element's controller
} catch (error) {
  console.error('The provided node does not host a custom element.', error);
}
```

#### Searching Parent Nodes for a Controller

```typescript
const someInnerElement = document.querySelector('.some-inner-element');
const parentController = CustomElement.for(someInnerElement, { searchParents: true });
// parentController is the closest controller up the DOM tree from someInnerElement
```

#### Getting a Controller for a Named Custom Element

```typescript
const controller = CustomElement.for(myElement, { name: 'my-custom-element' });
if (controller) {
  // The controller is for a custom element named 'my-custom-element'
} else {
  // No custom element with the specified name found
}
```

#### Retrieving a Controller Without Throwing an Error

```typescript
const optionalController = CustomElement.for(myElement, { optional: true });
if (optionalController) {
  // The node is a custom element and its controller is available
} else {
  // The node is not a custom element, no error thrown
}
```

### Parameters

- `node`: The DOM Node for which to retrieve the controller.
- `opts`: An object with optional properties to customize the behavior of the method.

### Return Value

Returns an instance of `ICustomElementController` or `null`/`undefined`, depending on the options provided and whether a controller is found.

## CustomElement.define

The `define` method registers a class as a custom element in Aurelia.

### Usage Examples

#### Defining a Custom Element with a Name

```typescript
import { CustomElement } from 'aurelia';

@customElement('my-custom-element')
class MyCustomElement {
  // Custom element's logic here
}

CustomElement.define('my-custom-element', MyCustomElement);
```

#### Defining a Custom Element with a Definition Object

```typescript
const definition = {
  name: 'my-custom-element',
  template: '<template><span>${message}</span></template>',
  bindables: ['message']
};

CustomElement.define(definition, MyCustomElement);
```

### Parameters

- `nameOrDef`: A string representing the name or a `PartialCustomElementDefinition` object with configuration options.
- `Type`: The class containing the logic for the custom element.

### Return Value

Returns a `CustomElementType` representing the defined custom element.

## CustomElement.getDefinition

Retrieves the `CustomElementDefinition` for a custom element class.

### Usage Example

```typescript
import { CustomElement } from 'aurelia';

const definition = CustomElement.getDefinition(MyCustomElement);
// Access the definition's properties, such as name, template, bindables, etc.
```

### Parameters

- `Type`: The class of the custom element.

### Return Value

Returns a `CustomElementDefinition` object with metadata about the custom element.

## CustomElement.annotate and CustomElement.getAnnotation

These methods are used to attach and retrieve metadata to/from a custom element class.

### Usage Examples

#### Annotating a Custom Element Class

```typescript
CustomElement.annotate(MyCustomElement, 'someProperty', 'someValue');
```

#### Retrieving an Annotation from a Custom Element Class

```typescript
const value = CustomElement.getAnnotation(MyCustomElement, 'someProperty');
// value now holds 'someValue'
```

### Parameters

- `Type`: The custom element class to annotate or from which to retrieve annotations.
- `prop`: The property key for the annotation.
- `value`: The value for the annotation (for `annotate` method).

### Return Value

`CustomElement.annotate` does not return a value. `CustomElement.getAnnotation` returns the annotation value.

## CustomElement.generateName

Generates a unique name for a custom element, which is useful for components that do not require a specific name.

### Usage Example

```typescript
const uniqueName = CustomElement.generateName();
// Use uniqueName when defining an anonymous custom element
```

### Return Value

A string representing a unique name for a custom element.

## CustomElement.createInjectable

Creates an `InjectableToken` for dependency injection.

### Usage Example

```typescript
const myToken = CustomElement.createInjectable();
```

### Return Value

An instance of `InjectableToken`.

## CustomElement.generateType

Dynamically generates a `CustomElementType` with a given name and prototype.

### Usage Example

```typescript
const DynamicElement = CustomElement.generateType('dynamic-element', {
  message: 'Hello from Dynamic Element!',
  showMessage() {
    alert(this.message);
  }
});

CustomElement.define('dynamic-element', DynamicElement);
```

### Parameters

- `name`: The name of the custom element.
- `proto`: An object representing the prototype of the custom element.

### Return Value

A `CustomElementType` that can be used to define a custom element.
