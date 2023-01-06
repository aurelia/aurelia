# Form Inputs

Handling forms and user input is quite a common task in applications. Whether you are building a login form, data entry, or even a chat application, Aurelia allows you to work with forms intuitively.

In Aurelia, the binding system uses `two-way` binding as a default for form elements. Text inputs, text areas and even `contenteditable` elements all use a `two-way` binding.

## Data flow in forms

In Aurelia, form elements are reactive and their changes are directly tied to the underlying view model. Updates flow from the view to the view model and updates from the view model flow to the view (hence, two-way).

To illustrate how `two-way` binding works in forms, let's break down the workflow:

1. The user types a value into the input element, the element is for a first name so they enter _John_.
2. The native form input events are fired and Aurelia also sees the value has changed.
3. The binding system sees the new value and notifies the view model to update the value.
4. Any reference to the bound value will be updated without the need for any callback functions or additional notification steps (the value just changes).

## Creating a basic form

Creating forms in Aurelia requires no special configuration or treatment. Simply create a form element and add in form input controls with bindings. To show you how little code you need, here is a basic form example for a login form.

Firstly, let's create the markup for our login form:

{% code title="login-component.html" %}
```markup
<form submit.trigger="handleLogin()">
    <div>
        <label for="email">Email:</label>
        <input id="email" type="text" value.bind="email">
    </div>
    <div>
        <label for="password">Password:</label>
        <input id="password" type="password" value.bind="password">
    </div>
    
    <button type="submit">Login</button>
</form>
```
{% endcode %}

Before we write the view model code, let's break down what we did here:

* We created a form with two text inputs
* We used `value.bind` to bind to the native value attribute of these fields to the corresponding view model properties
* We are calling a function `handleLogin` when the `submit` event on the form is triggered to handle the bindable properties inside

Now, the corresponding view model code:

{% code title="login-component.ts" %}
```typescript
export class LoginComponent {
    private email = '';
    private password = '';
    
    // This function is called when the form is submitted
    handleLogin() {
        // Call an API/validate the bound values
    }
}
```
{% endcode %}

There is not a whole lot of code here for what is happening. Whenever the `email` or `password` values change, they will be reflected inside of our view model. Inside of the `handleLogin` method, we would probably validate the data and call an API.

{% hint style="warning" %}
Using `submit.trigger` on a form will prevent its default action by applying a `event.preventDefault` behind the scenes. This means your form will not submit to the action or method attributes on the form, you will need to handle this manually.
{% endhint %}

## Binding with text and textarea inputs

Binding to text inputs uses similar syntax to that of binding to other elements in Aurelia. By default, input elements will use `two-way` binding which means the value will update in the view when changed inside of the view model and updated in the view-model when changed in the view.

### Text Input

```markup
<form>
  <label>User value</label><br>
  <input type="text" value.bind="userValue" />
</form>
```

You can even bind to other attributes on form elements such as the `placeholder` attribute.

```markup
<form>
  <label>User value</label><br>
  <input type="text" value.bind="userValue" placeholder.bind="myPlaceholder" />
</form>
```

### Textarea

A textarea element is just like any other form element. It allows you to bind to its value and by default `value.bind` will be two-way binding (meaning changes flow from out of the view into the view-model and changes in the view-model flow back to the view).

```markup
<form role="form">
  <textarea value.bind="textAreaValue"></textarea>
</form>
```

## Binding with checkbox inputs

Aurelia supports two-way binding a variety of data types to checkbox input elements.

### Booleans

Bind a boolean property to an input element's `checked` attribute using `checked.bind="myBooleanProperty"`.

```javascript
export class App {
  motherboard = false;
  cpu = false;
  memory = false;
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label><input type="checkbox" checked.bind="motherboard">  Motherboard</label>
    <label><input type="checkbox" checked.bind="cpu"> CPU</label>
    <label><input type="checkbox" checked.bind="memory"> Memory</label>

    motherboard = ${motherboard}<br>
    cpu = ${cpu}<br>
    memory = ${memory}<br>
  </form>
</template>
```

[Boolean Demo](https://codesandbox.io/embed/9zvm06x9pp?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Array of Numbers

A set of checkbox elements is a multiple selection interface. If you have an array that serves as the "selected items" list, you can bind the array to each input's `checked` attribute. The binding system will track the input's checked status, adding the input's value to the array when the input is checked and removing the input's value from the array when the input is unchecked.

To define the input's "value", bind the input's `model` attribute: `model.bind="product.id"`.

```javascript
export class App {
  products = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  selectedProductIds = [];
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label repeat.for="product of products">
      <input type="checkbox" model.bind="product.id" checked.bind="selectedProductIds">
      ${product.id} - ${product.name}
    </label>
    <br>
    Selected product IDs: ${selectedProductIds}
  </form>
</template>
```

[Number Array Demo](https://codesandbox.io/embed/pm0lxx0q2m?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Array of Objects

Numbers aren't the only type of value you can store in a "selected items" array. The binding system supports all types, including objects. Here's an example that adds and removes "product" objects from a `selectedProducts` array using the checkbox data-binding.

```typescript
export interface IProduct {
  id: number;
  name: string;
}

export class App {
  products: IProduct[] = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  selectedProducts: IProduct[] = [];
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label repeat.for="product of products">
      <input type="checkbox" model.bind="product" checked.bind="selectedProducts">
      ${product.id} - ${product.name}
    </label>

    Selected products:
    <ul>
      <li repeat.for="product of selectedProducts">${product.id} - ${product.name}</li>
    </ul>
  </form>
</template>
```

[Object Array Demo](https://codesandbox.io/embed/1qr32k1po3?autoresize=1\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Array of Objects with Matcher

You may run into situations where the object your input element's model is bound to does not have reference equality to any of the objects in your checked array. The objects might match by id, but they may not be the same object instance. To support this scenario you can override Aurelia's default "matcher" which is a equality comparison function that looks like this: `(a, b) => a === b`. You can substitute a function of your choosing that has the right logic to compare your objects.

```javascript
export class App {
  selectedProducts = [
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' }
  ];

  productMatcher = (a, b) => a.id === b.id;
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label>
      <input type="checkbox" model.bind="{ id: 0, name: 'Motherboard' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProducts">
      Motherboard
    </label>
    <label>
      <input type="checkbox" model.bind="{ id: 1, name: 'CPU' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProducts">
      CPU
    </label>
    <label>
      <input type="checkbox" model.bind="{ id: 2, name: 'Memory' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProducts">
      Memory
    </label>

    Selected products:
    <ul>
      <li repeat.for="product of selectedProducts">${product.id} - ${product.name}</li>
    </ul>
  </form>
</template>
```

[Object Array Matcher Demo](https://codesandbox.io/embed/14wj6p05j7?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Array of Strings

Finally, here's an example that adds and removes strings from a `selectedProducts` array using the checkbox data-binding. This is example is unique because it does not use `model.bind` to assign each checkbox's value. Instead the input's standard `value` attribute is used. Normally we cannot use the standard `value` attribute in conjunction with checked binding because it coerces anything it's assigned to a string. This example uses an array of strings so everything works just fine.

```javascript
export class App {
  products = ['Motherboard', 'CPU', 'Memory'];
  selectedProducts = [];
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label repeat.for="product of products">
      <input type="checkbox" value.bind="product" checked.bind="selectedProducts">
      ${product}
    </label>
    <br>
    Selected products: ${selectedProducts}
  </form>
</template>
```

## Binding with radio inputs

A group of radio inputs is a type of "single select" interface. Aurelia supports two-way binding any type of property to a group of radio inputs. The examples below illustrate binding number, object, string and boolean properties to sets of radio inputs. In each of the examples there's a common set of steps:

1. Group the radios via the `name` property. Radio buttons that have the same value for the name attribute are in the same "radio button group"; only one radio button in a group can be selected at a time.
2. Define each radio's value using the `model` property.
3. Two-way bind each radio's `checked` attribute to a "selected item" property on the view model.

### Numbers

Let's start with an example that uses a numeric "selected item" property. In this example, each radio input will be assigned a number value via the model property. Selecting a radio will cause its model value to be assigned to the `selectedProductId` property.

```javascript
export class App {
  products = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  selectedProductId = null;
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label repeat.for="product of products">
      <input type="radio" name="group1"
              model.bind="product.id" checked.bind="selectedProductId">
      ${product.id} - ${product.name}
    </label>
    <br>
    Selected product ID: ${selectedProductId}
  </form>
</template>
```

[Number Demo](https://codesandbox.io/embed/mzjz8pyryp?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Objects

The binding system supports binding all types to radios, including objects. Here's an example that binds a group of radios to a `selectedProduct` object property.

```javascript
export class App {
  products = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  selectedProduct = null;
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label repeat.for="product of products">
      <input type="radio" name="group2"
              model.bind="product" checked.bind="selectedProduct">
      ${product.id} - ${product.name}
    </label>

    Selected product: ${selectedProduct.id} - ${selectedProduct.name}
  </form>
</template>
```

[Object Demo](https://codesandbox.io/embed/mqy966y08p?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Objects with Matcher

You may run into situations where the object your input element's model is bound to does not have reference equality to any of the object in your checked attribute is bound to. The objects might match by id, but they may not be the same object instance. To support this scenario you can override Aurelia's default "matcher" which is a equality comparison function that looks like this: `(a, b) => a === b`. You can substitute a function of your choosing that has the right logic to compare your objects.

```javascript
export class App {
  selectedProduct = { id: 1, name: 'CPU' };

  productMatcher = (a, b) => a.id === b.id;
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label>
      <input type="radio" name="group3"
              model.bind="{ id: 0, name: 'Motherboard' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProduct">
      Motherboard
    </label>
    <label>
      <input type="radio" name="group3"
              model.bind="{ id: 1, name: 'CPU' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProduct">
      CPU
    </label>
    <label>
      <input type="radio" name="group3"
              model.bind="{ id: 2, name: 'Memory' }"
              matcher.bind="productMatcher"
              checked.bind="selectedProduct">
      Memory
    </label>

    Selected product: ${selectedProduct.id} - ${selectedProduct.name}
  </form>
</template>
```

[Object Matcher Demo](https://codesandbox.io/embed/1ok5l0z29j?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Booleans

In this example each radio input is assigned one of three literal values: `null`, `true` and `false`. Selecting one of the radios will assign it's value to the `likesCake` property.

```javascript
export class App {
  likesCake = null;
}
```

```markup
<template>
  <form>
    <h4>Do you like cake?</h4>
    <label>
      <input type="radio" name="group3"
              model.bind="null" checked.bind="likesCake">
      Don't Know
    </label>
    <label>
      <input type="radio" name="group3"
              model.bind="true" checked.bind="likesCake">
      Yes
    </label>
    <label>
      <input type="radio" name="group3"
              model.bind="false" checked.bind="likesCake">
      No
    </label>

    likesCake = ${likesCake}
  </form>
</template>
```

[Boolean Demo](https://codesandbox.io/embed/qzyly2kxy4?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Strings

Finally, here's an example using strings. This is example is unique because it does not use `model.bind` to assign each radio's value. Instead the input's standard `value` attribute is used. Normally we cannot use the standard `value` attribute in conjunction with checked binding because it coerces anything it's assigned to a string.

```javascript
export class App {
  products = ['Motherboard', 'CPU', 'Memory'];
  selectedProduct = null;
}
```

```markup
<template>
  <form>
    <h4>Products</h4>
    <label repeat.for="product of products">
      <input type="radio" name="group4"
              value.bind="product" checked.bind="selectedProduct">
      ${product}
    </label>
    <br>
    Selected product: ${selectedProduct}
  </form>
</template>
```

[String Demo](https://codesandbox.io/embed/52nwnv7vpp?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

## Binding with select elements

A `<select>` element can serve as a single-select or multiple-select "picker" depending on whether the `multiple` attribute is present. The binding system supports both use cases. The samples below demonstrate a variety scenarios, all use a common series of steps to configure the select element:

1. Add a `<select>` element to the template and decide whether the `multiple` attribute should be applied.
2. Bind the select element's `value` attribute to a property. In "multiple" mode, the property should be an array. In singular mode it can be any type.
3. Define the select element's `<option>` elements. You can use the `repeat` or add each option element manually.
4.  Specify each option's value via the `model` property:

    `<option model.bind="product.id">${product.name}</option>`

    _You can use the standard `value` attribute instead of `model`, just remember- it will coerce anything it's assigned to a string._

### Select Number

```javascript
export class App {
  products = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  selectedProductId = null;
}
```

```markup
<template>
  <label>
    Select product:<br>
    <select value.bind="selectedProductId">
      <option model.bind="null">Choose...</option>
      <option repeat.for="product of products"
              model.bind="product.id">
        ${product.id} - ${product.name}
      </option>
    </select>
  </label>
  Selected product ID: ${selectedProductId}
</template>
```

[Select Number Demo](https://codesandbox.io/embed/5j0zxp7rk?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Select Object

```javascript
export class App {
  products = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  selectedProduct = null;
}
```

```markup
<template>
  <label>
    Select product:<br>
    <select value.bind="selectedProduct">
      <option model.bind="null">Choose...</option>
      <option repeat.for="product of products"
              model.bind="product">
        ${product.id} - ${product.name}
      </option>
    </select>
  </label>

  Selected product: ${selectedProduct.id} - ${selectedProduct.name}
</template>
```

[Select Object Demo](https://codesandbox.io/embed/j20q48yp3?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Select Object with Matcher

You may run into situations where the object your select element's value is bound does not have reference equality with any of the objects your option element model properties are bound to. The select's value object might "match" one of the option objects by id, but they may not be the same object instance. To support this scenario you can override Aurelia's default "matcher" which is a equality comparison function that looks like this: `(a, b) => a === b`. You can substitute a function of your choosing that has the right logic to compare your objects.

```javascript
export class App {
  products = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  productMatcher = (a, b) => a.id === b.id;

  selectedProduct = { id: 1, name: 'CPU' };
}
```

```markup
<template>
  <label>
    Select product:<br>
    <select value.bind="selectedProduct" matcher.bind="productMatcher">
      <option model.bind="null">Choose...</option>
      <option repeat.for="product of products"
              model.bind="product">
        ${product.id} - ${product.name}
      </option>
    </select>
  </label>

  Selected product: ${selectedProduct.id} - ${selectedProduct.name}
</template>
```

[Select Object Matcher Demo](https://codesandbox.io/embed/nk5m6216xl?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Select Boolean

```javascript
export class App {
  likesTacos = null;
}
```

```markup
<template>
  <label>
    Do you like tacos?:
    <select value.bind="likesTacos">
      <option model.bind="null">Choose...</option>
      <option model.bind="true">Yes</option>
      <option model.bind="false">No</option>
    </select>
  </label>
  likesTacos: ${likesTacos}
</template>
```

[Select Boolean Demo](https://codesandbox.io/embed/zz2o6259wl?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Select String

```javascript
export class App {
  products = ['Motherboard', 'CPU', 'Memory'];
  selectedProduct = '';
}
```

```markup
<template>
  <label>
    Select product:<br>
    <select value.bind="selectedProduct">
      <option value="">Choose...</option>
      <option repeat.for="product of products"
              value.bind="product">
        ${product}
      </option>
    </select>
  </label>
  Selected product: ${selectedProduct}
</template>
```

[Select String Demo](https://codesandbox.io/embed/o8o7yozoz?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Multiple Select Numbers

```javascript
export class App {
  products = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  selectedProductIds = [];
}
```

```markup
<template>
  <label>
    Select products:
    <select multiple value.bind="selectedProductIds">
      <option repeat.for="product of products"
              model.bind="product.id">
        ${product.id} - ${product.name}
      </option>
    </select>
  </label>
  Selected product IDs: ${selectedProductIds}
</template>
```

[Select Multiple Numbers Demo](https://codesandbox.io/embed/88xzwon19?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Multiple Select Objects

```javascript
export class App {
  products = [
    { id: 0, name: 'Motherboard' },
    { id: 1, name: 'CPU' },
    { id: 2, name: 'Memory' },
  ];

  selectedProducts = [];
}
```

```markup
<template>
  <label>
    Select products:
    <select multiple value.bind="selectedProducts">
      <option repeat.for="product of products"
              model.bind="product">
        ${product.id} - ${product.name}
      </option>
    </select>
  </label>

  Selected products:
  <ul>
    <li repeat.for="product of selectedProducts">${product.id} - ${product.name}</li>
  </ul>
</template>
```

[Select Multiple Objects Demo](https://codesandbox.io/embed/o10mn3p0qq?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

### Multiple Select Strings

```javascript
export class App {
  products = ['Motherboard', 'CPU', 'Memory'];
  selectedProducts = [];
}
```

```markup
<template>
  <label>
    Select products:
    <select multiple value.bind="selectedProducts">
      <option repeat.for="product of products"
              value.bind="product">
        ${product}
      </option>
    </select>
  </label>
  Selected products: ${selectedProducts}
</template>
```

[Select Multiple Strings Demo](https://codesandbox.io/embed/yvr7p888q9?autoresize=1\&fontsize=18\&hidenavigation=1\&module=%2Fsrc%2Fapp.html\&view=preview)

## Form Submission

Most of the time, a `<form>` element should be used to group one or many controls in a form, it acts a container for those controls, and can also be used for layout purposes with CSS. Normally, HTML forms can be submitted without involving any JavaScript, via the `action` and `method` attributes on a `<form>`. Though it's also common in applications that forms are driven by JavaScript. In Aurelia, driving form via script can be achieved via `submit` event on the form, with the basic usage looks like the following example:

```markup
<form submit.trigger="submitMyForm()">
  ...
</form>
```

```typescript
class MyApp {
  submitMyForm() {
    fetch('/register', { method: 'POST', ... })
  }
}
```

Note that by default, for a `<form/>` without a `method` attribute, or `method` attribute value being equal to `GET/get`, using `submit.trigger` will call `preventDefault()` on the `submit` event, which prevents the normally unwanted behavior of html of navigating the page to the `URI` of the form. If this behavior is not desired, return true in the method being called, like the following example:

```typescript
class MyApp {
  submitMyForm() {
    ...
    return true;
  }
}
```

## Form validation

Validation is an important part of creating good forms. Aurelia provides a robust validation plugin that allows you to validate forms, create custom validation rules and configure every facet of validation in your Aurelia applications.

{% content-ref url="broken-reference" %}
[Broken link](broken-reference)
{% endcontent-ref %}
