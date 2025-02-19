---
description: >-
  Learn how to build forms in Aurelia, bind data to various input elements, and
  handle submission and validation.
---

# Form Inputs

Handling forms and user input is a common task in most applications. Whether you are building a login form, a data-entry screen, or even a chat interface, Aurelia makes it intuitive to work with forms. By default, Aurelia’s binding system uses **two-way** binding for form elements (like `<input>`, `<textarea>`, and `contenteditable` elements), which keeps your view and model in sync automatically.

{% hint style="info" %}
Many of the concepts discussed here assume some familiarity with Aurelia’s binding and template syntax. If you’re new, please read the [Template Syntax & Features](template-syntax.md) section first.
{% endhint %}

---

## Data Flow in Forms

Aurelia’s two-way binding updates your view model properties whenever users enter data into form elements, and likewise updates the form elements if the view model changes:

1. The user types in the input (e.g., **John**).
2. The native input events fire. Aurelia observes the value change.
3. The binding system updates the corresponding view model property.
4. Any references to that property automatically reflect its new value.

Because of this automatic synchronization, you generally don’t need to write custom event handlers or watchers to track form inputs.

---

## Creating a Basic Form

Aurelia lets you create forms in pure HTML without any special setup. Here’s a simple login form illustrating how little code is required.

{% code title="login-component.html" %}

```html
<form submit.trigger="handleLogin()">
  <div>
    <label for="email">Email:</label>
    <input id="email" type="text" value.bind="email" />
  </div>
  <div>
    <label for="password">Password:</label>
    <input id="password" type="password" value.bind="password" />
  </div>

  <button type="submit">Login</button>
</form>
```

{% endcode %}

Key Points:

- We created a form with two inputs: email and password.
- The `value.bind` syntax binds these inputs to class properties named `email` and `password`.
- We call a `handleLogin()` method on submit to process the form data.

And here is the view model (`login-component.ts`):

{% code title="login-component.ts" %}

```typescript
export class LoginComponent {
  private email = "";
  private password = "";

  handleLogin() {
    // Validate credentials or call an API
    console.log(`Email: ${this.email}, Password: ${this.password}`);
  }
}
```

{% endcode %}

Whenever the email or password fields change in the UI, their corresponding view model properties are updated. Then, in `handleLogin()`, you can handle form submission however you wish.

{% hint style="warning" %}
Using `submit.trigger` on a form prevents the default browser submission. If you want the form to submit normally, return `true` from your handler or remove `submit.trigger` entirely.
{% endhint %}

---

## Binding With Text and Textarea Inputs

### Text Input

Binding to text inputs in Aurelia is straightforward:

```html
<form>
  <label>User value:</label><br />
  <input type="text" value.bind="userValue" />
</form>
```

You can also bind other attributes like placeholder:

```html
<form>
  <label>User value:</label><br />
  <input type="text" value.bind="userValue" placeholder.bind="myPlaceholder" />
</form>
```

### Textarea

Textareas work just like text inputs, with value.bind for two-way binding:

```html
<form>
  <label>Comments:</label><br />
  <textarea value.bind="textAreaValue"></textarea>
</form>
```

Any changes to `textAreaValue` in the view model will show up in the `<textarea>`, and vice versa.

---

## Binding with Checkbox Inputs

Aurelia supports two-way binding for checkboxes in various configurations.

### Booleans

Bind a boolean property to the checked attribute:

```typescript
export class MyApp {
  motherboard = false;
  cpu = false;
  memory = false;
}
```

```html
<form>
  <h4>Products</h4>
  <label
    ><input type="checkbox" checked.bind="motherboard" /> Motherboard</label
  >
  <label><input type="checkbox" checked.bind="cpu" /> CPU</label>
  <label><input type="checkbox" checked.bind="memory" /> Memory</label>

  motherboard = ${motherboard}<br />
  cpu = ${cpu}<br />
  memory = ${memory}<br />
</form>
```

### Array of Numbers

When using checkboxes as a multi-select, bind an array to each input’s checked attribute. Provide a model for each checkbox to indicate its value:

```typescript
export class MyApp {
  products = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];

  selectedProductIds = [];
}
```

```html
<form>
  <h4>Products</h4>
  <label repeat.for="product of products">
    <input
      type="checkbox"
      model.bind="product.id"
      checked.bind="selectedProductIds"
    />
    ${product.id} - ${product.name}
  </label>
  <br />
  Selected product IDs: ${selectedProductIds}
</form>
```

### Array of Objects

Numbers aren’t the only value type you can store. Here’s how to manage an array of objects:

```typescript
export interface IProduct {
  id: number;
  name: string;
}

export class MyApp {
  products: IProduct[] = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];
  selectedProducts: IProduct[] = [];
}
```

```html
<form>
  <h4>Products</h4>
  <label repeat.for="product of products">
    <input
      type="checkbox"
      model.bind="product"
      checked.bind="selectedProducts"
    />
    ${product.id} - ${product.name}
  </label>

  Selected products:
  <ul>
    <li repeat.for="product of selectedProducts">
      ${product.id} - ${product.name}
    </li>
  </ul>
</form>
```

### Array of Objects with Matcher

If your objects do not share reference equality (e.g., same data, different instances), define a custom matcher:

```typescript
export class MyApp {
  selectedProducts = [
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];

  productMatcher = (a, b) => a.id === b.id;
}
```

```html
<form>
  <h4>Products</h4>
  <label>
    <input
      type="checkbox"
      model.bind="{ id: 0, name: 'Motherboard' }"
      matcher.bind="productMatcher"
      checked.bind="selectedProducts"
    />
    Motherboard
  </label>
  ...
</form>
```

### Array of Strings

If your “selected items” array holds strings, you can rely on the standard value attribute:

```typescript
export class MyApp {
  products = ["Motherboard", "CPU", "Memory"];
  selectedProducts = [];
}
```

```html
<form>
  <h4>Products</h4>
  <label repeat.for="product of products">
    <input
      type="checkbox"
      value.bind="product"
      checked.bind="selectedProducts"
    />
    ${product}
  </label>
  <br />
  Selected products: ${selectedProducts}
</form>
```

### Binding with Radio Inputs

Radio groups in Aurelia are similarly straightforward. Only one radio button in a group can be checked at a time.

#### Numbers

```typescript
export class MyApp {
  products = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];
  selectedProductId = null;
}
```

```html
<form>
  <h4>Products</h4>
  <label repeat.for="product of products">
    <input
      type="radio"
      name="group1"
      model.bind="product.id"
      checked.bind="selectedProductId"
    />
    ${product.id} - ${product.name}
  </label>
  <br />
  Selected product ID: ${selectedProductId}
</form>
```

#### Objects

```typescript
export class MyApp {
  products = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];
  selectedProduct = null;
}
```

```html
<form>
  <h4>Products</h4>
  <label repeat.for="product of products">
    <input
      type="radio"
      name="group2"
      model.bind="product"
      checked.bind="selectedProduct"
    />
    ${product.id} - ${product.name}
  </label>
  Selected product: ${selectedProduct.id} - ${selectedProduct.name}
</form>
```

#### Objects with Matcher

If the selected object doesn’t share reference equality, define a custom matcher:

```typescript
export class MyApp {
  selectedProduct = { id: 1, name: "CPU" };
  productMatcher = (a, b) => a.id === b.id;
}
```

```html
<form>
  <h4>Products</h4>
  <label>
    <input
      type="radio"
      name="group3"
      model.bind="{ id: 0, name: 'Motherboard' }"
      matcher.bind="productMatcher"
      checked.bind="selectedProduct"
    />
    Motherboard
  </label>
  ...
</form>
```

#### Booleans

```typescript
export class MyApp {
  likesCake = null;
}
```

```html
<form>
  <h4>Do you like cake?</h4>
  <label>
    <input
      type="radio"
      name="group4"
      model.bind="null"
      checked.bind="likesCake"
    />
    Don't Know
  </label>
  <label>
    <input
      type="radio"
      name="group4"
      model.bind="true"
      checked.bind="likesCake"
    />
    Yes
  </label>
  <label>
    <input
      type="radio"
      name="group4"
      model.bind="false"
      checked.bind="likesCake"
    />
    No
  </label>

  likesCake = ${likesCake}
</form>
```

#### Strings

```typescript
export class MyApp {
  products = ["Motherboard", "CPU", "Memory"];
  selectedProduct = null;
}
```

```html
<form>
  <h4>Products</h4>
  <label repeat.for="product of products">
    <input
      type="radio"
      name="group5"
      value.bind="product"
      checked.bind="selectedProduct"
    />
    ${product}
  </label>
  <br />
  Selected product: ${selectedProduct}
</form>
```

---

## Binding with Select Elements

You can use `<select>` as either a single-select or a multiple-select input:

1. Use `value.bind` in single-select mode.
2. Use `value.bind` to an array in multiple-select mode.
3. Provide `<option>` elements that specify their own model (or value) attributes.

### Single Select (Numbers)

```typescript
export class MyApp {
  products = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];
  selectedProductId = null;
}
```

```html
<label>
  Select product:
  <select value.bind="selectedProductId">
    <option model.bind="null">Choose...</option>
    <option repeat.for="product of products" model.bind="product.id">
      ${product.id} - ${product.name}
    </option>
  </select>
</label>
Selected product ID: ${selectedProductId}
```

### Single Select (Objects)

```typescript
export class MyApp {
  products = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];
  selectedProduct = null;
}
```

```html
<label>
  Select product:
  <select value.bind="selectedProduct">
    <option model.bind="null">Choose...</option>
    <option repeat.for="product of products" model.bind="product">
      ${product.id} - ${product.name}
    </option>
  </select>
</label>

Selected product: ${selectedProduct.id} - ${selectedProduct.name}
```

### Single Select (Objects with Matcher)

```typescript
export class MyApp {
  products = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];
  productMatcher = (a, b) => a.id === b.id;
  selectedProduct = { id: 1, name: "CPU" };
}
```

```html
<label>
  Select product:
  <select value.bind="selectedProduct" matcher.bind="productMatcher">
    <option model.bind="null">Choose...</option>
    <option repeat.for="product of products" model.bind="product">
      ${product.id} - ${product.name}
    </option>
  </select>
</label>

Selected product: ${selectedProduct.id} - ${selectedProduct.name}
```

### Single Select (Boolean)

```typescript
export class MyApp {
  likesTacos = null;
}
```

```html
<label>
  Do you like tacos?
  <select value.bind="likesTacos">
    <option model.bind="null">Choose...</option>
    <option model.bind="true">Yes</option>
    <option model.bind="false">No</option>
  </select>
</label>
likesTacos = ${likesTacos}
```

### Single Select (Strings)

```typescript
export class MyApp {
  products = ["Motherboard", "CPU", "Memory"];
  selectedProduct = "";
}
```

```html
<label>
  Select product:
  <select value.bind="selectedProduct">
    <option value="">Choose...</option>
    <option repeat.for="product of products" value.bind="product">
      ${product}
    </option>
  </select>
</label>
Selected product: ${selectedProduct}
```

### Multiple Select (Numbers)

```typescript
export class MyApp {
  products = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];
  selectedProductIds = [];
}
```

```html
<label>
  Select products:
  <select multiple value.bind="selectedProductIds">
    <option repeat.for="product of products" model.bind="product.id">
      ${product.id} - ${product.name}
    </option>
  </select>
</label>
Selected product IDs: ${selectedProductIds}
```

### Multiple Select (Objects)

```typescript
export class MyApp {
  products = [
    { id: 0, name: "Motherboard" },
    { id: 1, name: "CPU" },
    { id: 2, name: "Memory" },
  ];
  selectedProducts = [];
}
```

```html
<label>
  Select products:
  <select multiple value.bind="selectedProducts">
    <option repeat.for="product of products" model.bind="product">
      ${product.id} - ${product.name}
    </option>
  </select>
</label>

Selected products:
<ul>
  <li repeat.for="product of selectedProducts">
    ${product.id} - ${product.name}
  </li>
</ul>
```

### Multiple Select (Strings)

```typescript
export class MyApp {
  products = ["Motherboard", "CPU", "Memory"];
  selectedProducts = [];
}
```

```html
<label>
  Select products:
  <select multiple value.bind="selectedProducts">
    <option repeat.for="product of products" value.bind="product">
      ${product}
    </option>
  </select>
</label>
Selected products: ${selectedProducts}
```

---

## Form Submission

Typically, a `<form>` groups related inputs. Aurelia allows you to intercept submission using `submit.trigger`:

```html
<form submit.trigger="submitMyForm()">...</form>
```

```typescript
export class MyApp {
  submitMyForm() {
    // Custom logic, e.g., fetch POST to an API endpoint
    fetch("/register", { method: "POST" /* ... */ });
  }
}
```

For `<form>` elements without a method (or method="GET"), Aurelia automatically calls `event.preventDefault()` to avoid a full page reload. If you prefer the default browser submission, return `true` from your handler:

```typescript
export class MyApp {
  submitMyForm() {
    // Possibly do some checks...
    return true; // Allow normal form submission
  }
}
```

---

## File Inputs and Upload Handling

Working with file uploads in Aurelia typically involves using the standard `<input type="file">` element and handling file data in your view model. While Aurelia doesn’t provide special bindings for file inputs, you can easily wire up event handlers or use standard properties to capture and upload files.

### Capturing File Data

In most cases, you’ll want to listen for the `change` event on a file input:

{% code title="file-upload-component.html" %}
```html
<form>
  <label for="fileUpload">Select files to upload:</label>
  <input
    id="fileUpload"
    type="file"
    multiple
    accept="image/*"
    change.trigger="handleFileSelect($event)"
  />

  <button click.trigger="uploadFiles()" disabled.bind="!selectedFiles.length">
    Upload
  </button>
</form>
```
{% endcode %}

- `multiple`: Allows selecting more than one file.
- `accept="image/*"`: Restricts file selection to images (this can be changed to fit your needs).
- `change.trigger="handleFileSelect($event)"`: Calls a method in your view model to handle the file selection event.

### View Model Handling

You can retrieve the selected files from the event object in your view model:

{% code title="file-upload-component.ts" %}
```typescript
export class FileUploadComponent {
  public selectedFiles: File[] = [];

  public handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    // Convert the FileList to a real array
    this.selectedFiles = Array.from(input.files);
  }

  public async uploadFiles() {
    if (this.selectedFiles.length === 0) {
      return;
    }

    const formData = new FormData();
    for (const file of this.selectedFiles) {
      // The first argument (key) matches the field name expected by your backend
      formData.append('files', file, file.name);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      // Optionally, reset selected files
      this.selectedFiles = [];
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }
}
```
{% endcode %}

**Key Points:**

- Reading File Data: `input.files` returns a `FileList`; converting it to an array (`Array.from`) makes it easier to iterate over.
- FormData: Using `FormData` to append files is a convenient way to send them to the server (via Fetch).
- Error Handling: Always check `response.ok` to handle server or network errors.
- Disabling the Button: In the HTML, `disabled.bind="!selectedFiles.length"` keeps the button disabled until at least one file is selected.

### Single File Inputs

If you only need a single file, omit multiple and simplify your logic:

```html
<input type="file" accept="image/*" change.trigger="handleFileSelect($event)" />
```

```typescript
public handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  this.selectedFiles = input.files?.length ? [input.files[0]] : [];
}
```

### Validation and Security

When handling file uploads, consider adding validation and security measures:

- Server-side Validation: Even if you filter files by type on the client (accept="image/*"), always verify on the server to ensure the files are valid and safe.
- File Size Limits: Check file sizes either on the client or server (or both) to prevent excessively large uploads.
- Progress Indicators: For a better user experience, consider using XMLHttpRequest or the Fetch API with progress events (via third-party solutions or polyfills), so you can display an upload progress bar.

---

## Form Validation

Validation is essential for robust, user-friendly forms. Aurelia provides a dedicated Validation plugin that helps you:

- Validate inputs using built-in or custom rules.
- Display error messages and warnings.
- Integrate seamlessly with Aurelia’s binding system.

{% content-ref url="../aurelia-packages/validation/" %}
[validation](../aurelia-packages/validation/)
{% endcontent-ref %}
