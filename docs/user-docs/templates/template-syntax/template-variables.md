# Template Variables (`<let>`)

Aurelia 2 allows you to managed variables directly within your view templates: the `<let>` custom element.  This element allows you to declare and initialize variables inline in your HTML, making your templates more dynamic and readable.  `<let>` is incredibly versatile, supporting a range of value assignments, from simple strings and interpolation to complex expressions and bindings to your view model.  This capability significantly enhances template flexibility and reduces the need for excessive view model code for simple template-specific logic.

## Declaring Template Variables with `<let>`

The `<let>` element provides a straightforward syntax for declaring variables directly within your templates.  The basic structure is as follows:

```html
<let variable-name="variable value"></let>
```

- `<let>`:  The custom element tag that signals the declaration of a template variable.
- `variable-name`:  The name you choose for your template variable.  In templates, you will reference this variable name in its camelCase form (e.g., `variableName`).
- `"variable value"`: The initial value assigned to the variable. This can be a string literal, an interpolation expression, a binding expression, or any valid JavaScript expression that Aurelia can evaluate within the template context.

### Basic String Assignment

You can assign simple string literals to `<let>` variables:

```html
<let greeting-message="Hello, Aurelia!"></let>
```

To display the value of this variable in your template, use interpolation with the camelCase version of the variable name:

```html
<p>${greetingMessage}</p>
```

This will render:

```html
<p>Hello, Aurelia!</p>
```

### Binding Expressions for Dynamic Values

`<let>` variables are not limited to static strings. You can use binding expressions to assign dynamic values that are calculated or updated based on your view model or other template logic.

**Example: Simple Mathematical Expression**

```html
<let calculation-result.bind="10 + 5 * 2"></let>
```

Now, you can display the result of this calculation:

```html
<p>The result is: ${calculationResult}</p>
```

This will output:

```html
<p>The result is: 20</p>
```

**Example: Binding to View Model Properties**

You can bind a `<let>` variable to properties defined in your view model, making template variables reactive to changes in your data:

{% tabs %}
{% tab title="my-app.html" %}
```html
<let user-name.bind="userName"></let>

<h1>Welcome, ${userName}!</h1>
<p>Your username variable (from &lt;let&gt;) is: ${userName}</p>
<p>Your username property (from view model) is: ${userName}</p>
```
{% endtab %}

{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  userName = 'John Doe';
}
```
{% endtab %}
{% endtabs %}

In this example, both `${userName}` interpolations will display "John Doe". If you update the `userName` property in your view model, both interpolations will dynamically reflect the change.

**Example: Using Template Expressions**

`<let>` variables can also be assigned values derived from template expressions, including function calls, ternary operators, and more:

{% tabs %}
{% tab title="my-app.html" %}
```html
<let is-evening.bind="currentHour >= 18"></let>
<let time-of-day-message.bind="isEvening ? 'Good evening' : 'Good day'"></let>

<p>${timeOfDayMessage}, user!</p>
```
{% endtab %}

{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  currentHour = new Date().getHours();
}
```
{% endtab %}
{% endtabs %}

Here, `isEvening` will be a boolean value based on the current hour, and `timeOfDayMessage` will be dynamically set to either "Good evening" or "Good day" based on the value of `isEvening`.

### Scoping of Template Variables

`<let>` variables are scoped to the template in which they are declared. This means a variable declared with `<let>` is only accessible within the template block where it's defined. This scoping helps prevent naming conflicts and keeps your templates organized and predictable.

**Example: Scoped Variables in `repeat.for`**

When using `<let>` within a `repeat.for` loop, each iteration of the loop will have its own instance of the `<let>` variable, ensuring that variables are correctly associated with each repeated item.

```html
<ul>
  <template repeat.for="item of items">
    <li>
      <let item-index.bind="$index"></let>
      Item ${itemIndex + 1}: ${item.name}
    </li>
  </template>
</ul>
```

In this example, `itemIndex` is scoped to each `<li>` element within the `repeat.for` loop, correctly displaying the index for each item in the list.

### Practical Use Cases for `<let>`

`<let>` is incredibly useful in various template scenarios. Here are a few common use cases:

#### 1. Simplifying Complex Expressions

When you have complex expressions that are used multiple times within a template, you can use `<let>` to assign the result of the expression to a variable, improving readability and maintainability.

**Before using `<let>`:**

```html
<p>Total price (excluding tax): $${quantity * price}</p>
<p>Tax amount (10%): $${(quantity * price) * 0.10}</p>
<p>Final price (including tax): $${(quantity * price) * 1.10}</p>
```

**After using `<let>`:**

```html
<let subtotal.bind="quantity * price"></let>
<p>Total price (excluding tax): $${subtotal}</p>
<p>Tax amount (10%): $${subtotal * 0.10}</p>
<p>Final price (including tax): $${subtotal * 1.10}</p>
```

Using `<let subtotal.bind="quantity * price">` makes the template cleaner and easier to understand, especially if the calculation is more complex.

#### 2. Conditional Rendering Logic

You can use `<let>` in conjunction with conditional attributes like `if.bind` or `else` to manage template variables based on conditions.

```html
<let show-details.bind="isDetailsVisible"></let>

<button click.trigger="isDetailsVisible = !isDetailsVisible">
  ${showDetails ? 'Hide Details' : 'Show Details'}
</button>

<div if.bind="showDetails">
  <!-- Details content here -->
  <p>Detailed information is displayed.</p>
</div>
```

Here, `showDetails` is used to control both the button text and the visibility of the details section, simplifying the conditional logic within the template.

#### 3. Data Transformation within Templates

You can perform simple data transformations directly within your templates using `<let>`, although for more complex transformations, value converters are generally recommended.

**Example: Formatting a Date**

```html
<let formatted-date.bind="new Date().toLocaleDateString()"></let>
<p>Today's date: ${formattedDate}</p>
```

This example formats the current date using `toLocaleDateString()` and stores it in `formattedDate` for display.

#### 4. Creating Reusable Template Snippets

While not its primary purpose, `<let>` can indirectly contribute to creating reusable template snippets by encapsulating logic and variables within a specific section of your template.  Combined with custom elements or template parts, `<let>` helps in modularizing your view templates.

### Considerations when Using `<let>`

- **Keep it Simple**:  While `<let>` is powerful, it's best used for template-specific variables and simple logic. For complex data manipulation or business logic, keep that in your view model.
- **Readability**: Use descriptive variable names for `<let>` to maintain template readability.
- **Scoping**: Be mindful of the scope of `<let>` variables. They are limited to the template in which they are declared.
- **Alternatives**: For complex data transformations or reusable formatting logic, consider using Aurelia's value converters, which are designed for these purposes and promote better separation of concerns.
