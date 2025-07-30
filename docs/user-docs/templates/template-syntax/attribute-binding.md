# Attribute Bindings

Attribute binding in Aurelia is a powerful feature that allows you to dynamically bind data from your view model to any native HTML attribute within your templates. This enables real-time updates to element attributes such as classes, styles, `src`, `alt`, and other standard HTML attributes, enhancing the interactivity and responsiveness of your applications.

## Basic Binding Syntax

The fundamental syntax for binding to attributes in Aurelia is simple and intuitive:

```html
<div attribute-name.bind="value"></div>
```

- `attribute-name.bind="value"`: The binding declaration.
  - `attribute-name`: The target HTML attribute you want to bind to.
  - `.bind`: The binding command indicating a two-way binding by default.
  - `value`: The expression or property from the view model to bind.

You can bind to virtually any attribute listed in the [HTML Attributes Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes).

### Example: Binding the `title` Attribute

```html
<!-- my-app.html -->
<div title.bind="tooltipText">Hover over me!</div>
```

```typescript
// my-app.ts
export class MyApp {
  tooltipText = 'This is a tooltip';
}
```

*Result:* The `div` will have a `title` attribute with the value "This is a tooltip". Hovering over the div will display the tooltip.

{% hint style="info" %}
When using an empty expression in a binding, such as `attribute-name.bind` or `attribute-name.bind=""`, Aurelia automatically infers the expression based on the camelCase version of the target attribute. For example, `attribute-name.bind=""` is equivalent to `attribute-name.bind="attributeName"`. This behavior applies to other binding commands as well:
- `.one-time`
- `.to-view`
- `.from-view`
- `.two-way`
- `.attr`
{% endhint %}

## Binding Techniques and Syntax

Aurelia provides multiple methods for attribute binding, each tailored for specific use cases and offering different levels of data flow control.

### 1. Interpolation Binding

Interpolation allows embedding dynamic values directly within strings. This is useful for concatenating strings with dynamic data.

**Example: Binding the `id` Attribute Using Interpolation**

```html
<!-- my-app.html -->
<div>
  <h1 id="${headingId}">Dynamic Heading</h1>
</div>
```

```typescript
// my-app.ts
export class MyApp {
  headingId = 'main-heading';
}
```

*Result:* The `h1` element will have an `id` attribute set to "main-heading".

### 2. Keyword Binding

Aurelia supports several binding keywords that define the direction and frequency of data flow between the view model and the view:

- **`.one-time`**: Updates the view from the view model only once. Subsequent changes in the view model do not affect the view.
- **`.to-view` / `.one-way`**: Continuously updates the view from the view model.
- **`.from-view`**: Updates the view model based on changes in the view.
- **`.two-way`**: Establishes a two-way data flow, keeping both the view and view model in sync.
- **`.bind`**: Automatically determines the appropriate binding mode. Defaults to `.two-way` for form elements (e.g., `input`, `textarea`) and `.to-view` for most other elements.

#### Examples of Keyword Binding

```html
<!-- my-app.html -->
<!-- Two-way binding: changes in input update 'firstName' and vice versa -->
<input type="text" value.two-way="firstName" placeholder="First Name">

<!-- One-way binding: changes in 'lastName' update the input, but not vice versa -->
<input type="text" value.one-way="lastName" placeholder="Last Name">

<!-- One-time binding: input value is set once from 'middleName' -->
<input type="text" value.one-time="middleName" placeholder="Middle Name">

<!-- Binding a link's href attribute using to-view -->
<a href.to-view="profile.blogUrl">Blog</a>

<!-- Binding a link's href attribute using one-time -->
<a href.one-time="profile.twitterUrl">Twitter</a>

<!-- Binding a link's href attribute using bind (auto mode) -->
<a href.bind="profile.linkedInUrl">LinkedIn</a>
```

```typescript
// my-app.ts
export class MyApp {
  firstName = 'John';
  lastName = 'Doe';
  middleName = 'A.';
  profile = {
    blogUrl: 'https://johnsblog.com',
    twitterUrl: 'https://twitter.com/johndoe',
    linkedInUrl: 'https://linkedin.com/in/johndoe'
  };
}
```

*Result:* The input fields and links will reflect the bound properties with varying degrees of reactivity based on the binding keyword used.

### 3. Binding to Images

Binding image attributes such as `src` and `alt` ensures that images update dynamically based on the view model data.

**Example: Dynamic Image Binding**

```html
<!-- my-app.html -->
<img src.bind="imageSrc" alt.bind="imageAlt" />
```

```typescript
// my-app.ts
export class MyApp {
  imageSrc = 'https://example.com/image.jpg';
  imageAlt = 'Example Image';
}
```

*Result:* The `img` element will display the image from the specified `src` and use the provided `alt` text.

### 4. Disabling Elements

Dynamically enabling or disabling form elements enhances user interaction and form validation.

**Example: Binding the `disabled` Attribute**

```html
<!-- my-app.html -->
<button disabled.bind="isButtonDisabled">Submit</button>
<input type="text" disabled.bind="isInputDisabled" placeholder="Enter text" />
```

```typescript
// my-app.ts
export class MyApp {
  isButtonDisabled = true;
  isInputDisabled = false;
  
  toggleButton() {
    this.isButtonDisabled = !this.isButtonDisabled;
  }
  
  toggleInput() {
    this.isInputDisabled = !this.isInputDisabled;
  }
}
```

*Result:* The `Submit` button starts as disabled, and the input field is enabled. Calling `toggleButton()` or `toggleInput()` will toggle their disabled states.

### 5. Binding `innerHTML` and `textContent`

Choose between `innerHTML` for rendering HTML content and `textContent` for rendering plain text to control how content is displayed within elements.

**Example: Rendering HTML vs. Text**

```html
<!-- my-app.html -->
<div innerhtml.bind="htmlContent"></div>
<div textcontent.bind="plainText"></div>
```

```typescript
// my-app.ts
export class MyApp {
  htmlContent = '<strong>This is bold text.</strong>';
  plainText = '<strong>This is not bold text.</strong>';
}
```

*Result:*
- The first `div` will render the bold text as HTML.
- The second `div` will display the HTML tags as plain text.

## Advanced Binding Techniques

Explore more sophisticated binding scenarios to handle complex data interactions and ensure seamless attribute management.

### 1. How Attribute Binding Works

Aurelia employs a mapping function to translate view model properties to corresponding HTML attributes. This typically involves converting `kebab-case` attribute names to `camelCase` property names. However, not all properties directly map to attributes, especially custom or non-standard attributes.

**Example: Automatic Mapping**

```html
<!-- my-app.html -->
<input value.bind="userName" />
```

```typescript
// my-app.ts
export class MyApp {
  userName = 'JaneDoe';
}
```

*Result:* The `input` element's `value` attribute is bound to the `userName` property. Changes in `userName` update the `input` value and vice versa.

#### Property vs. Attribute Targeting

By default, Aurelia bindings target DOM **properties** rather than HTML **attributes**. This distinction is important because:

- **Properties** are JavaScript object properties on DOM elements (e.g., `element.value`)
- **Attributes** are the HTML markup attributes (e.g., `<input value="...">`)

For most standard HTML attributes, this works seamlessly because browsers synchronize property and attribute values. However, for custom attributes or when you specifically need attribute targeting, use the `.attr` binding command or the `attr` binding behavior.

### 2. Using the `.attr` Binding Command

When automatic mapping fails or when dealing with non-standard attributes, use the `.attr` binding command to ensure proper attribute binding.

**Example: Binding a Custom Attribute**

```html
<!-- my-app.html -->
<input my-custom-attr.attr="customValue" />
```

```typescript
// my-app.ts
export class MyApp {
  customValue = 'Custom Attribute Value';
}
```

*Result:* The `input` element will have a `my-custom-attr` attribute set to "Custom Attribute Value".

### 3. The `attr` Binding Behavior

The `attr` binding behavior is a powerful feature that forces any property binding to target the HTML attribute instead of the DOM property. This is especially useful for:

- Custom attributes that don't have corresponding DOM properties
- Data attributes (`data-*`)
- ARIA attributes
- SVG attributes
- Cases where you need to ensure attribute-specific behavior

**Example: Using the `attr` Binding Behavior**

```html
<!-- my-app.html -->
<input pattern.bind="patternProp & attr" />
<div data-tooltip.bind="tooltipText & attr"></div>
<svg>
  <circle cx.bind="centerX & attr" cy.bind="centerY & attr" r="50" />
</svg>
```

```typescript
// my-app.ts
export class MyApp {
  patternProp = '[A-Za-z]{3,}';
  tooltipText = 'This is a custom tooltip';
  centerX = 100;
  centerY = 100;
}
```

*Result:* All bindings will target their respective HTML attributes directly, ensuring proper DOM attribute manipulation.

{% hint style="warning" %}
The `attr` binding behavior can only be used with property bindings (`.bind`, `.one-way`, `.two-way`, `.to-view`, `.from-view`). It cannot be used with event bindings (`.trigger`, `.delegate`, `.capture`) or reference bindings (`.ref`).
{% endhint %}

### 4. Attribute Mapping and Custom Elements

Aurelia includes a built-in attribute mapper that handles common HTML attribute-to-property mappings automatically. For example:

- `maxlength` → `maxLength`
- `readonly` → `readOnly`
- `tabindex` → `tabIndex`
- `contenteditable` → `contentEditable`

You can extend this mapping for custom elements or third-party components:

```typescript
// main.ts
import { Aurelia, AppTask, IAttrMapper } from '@aurelia/runtime-html';

Aurelia
  .register(
    AppTask.creating(IAttrMapper, (attrMapper) => {
      attrMapper.useMapping({
        'CUSTOM-INPUT': {
          'max-length': 'maxLength',
          'min-length': 'minLength'
        }
      });
      
      attrMapper.useGlobalMapping({
        'custom-attr': 'customAttribute'
      });
      
      attrMapper.useTwoWay(
        (element, attr) => element.tagName === 'CUSTOM-INPUT' && attr === 'value'
      );
    })
  )
  .app(MyApp)
  .start();
```

### 5. Special Attribute Handling

Aurelia provides specialized handling for certain attributes:

#### Class Attributes

```html
<!-- Single class binding -->
<div class.bind="isActive && 'active'"></div>

<!-- Multiple class binding -->
<div class.bind="getClasses()"></div>
```

#### Style Attributes

```html
<!-- Style property binding -->
<div style.background-color.bind="bgColor"></div>
<div style.font-size.bind="fontSize + 'px'"></div>

<!-- Full style object binding -->
<div style.bind="styleObject"></div>
```

```typescript
export class MyApp {
  bgColor = 'red';
  fontSize = 16;
  styleObject = {
    color: 'blue',
    'font-weight': 'bold',
    margin: '10px'
  };
  
  getClasses() {
    return this.isActive ? 'active highlight' : 'inactive';
  }
}
```

## Practical Use Cases

To better illustrate attribute bindings, here are several practical scenarios showcasing different binding techniques.

### 1. Dynamic Class Binding

**Example: Toggling CSS Classes**

```html
<!-- my-app.html -->
<div class.bind="isActive ? 'active' : 'inactive'">Status</div>
```

```typescript
// my-app.ts
export class MyApp {
  isActive = true;
  
  toggleStatus() {
    this.isActive = !this.isActive;
  }
}
```

*Result:* The `div` will have the class `active` when `isActive` is `true` and `inactive` when `false`. Calling `toggleStatus()` toggles the class.

### 2. Styling Elements Dynamically

**Example: Binding Inline Styles**

```html
<!-- my-app.html -->
<div style.backgroundColor.bind="bgColor">Colored Box</div>
```

```typescript
// my-app.ts
export class MyApp {
  bgColor = 'lightblue';
  
  changeColor(newColor: string) {
    this.bgColor = newColor;
  }
}
```

*Result:* The `div`'s background color reflects the current value of `bgColor`. Invoking `changeColor('coral')` will update the background to coral.

### 3. Conditional Attribute Rendering

**Example: Conditionally Setting the `required` Attribute**

```html
<!-- my-app.html -->
<input type="email" required.bind="isEmailRequired" placeholder="Enter your email" />
```

```typescript
// my-app.ts
export class MyApp {
  isEmailRequired = true;
  
  toggleEmailRequirement() {
    this.isEmailRequired = !this.isEmailRequired;
  }
}
```

*Result:* The `input` field will be required based on the `isEmailRequired` property. Toggling this property will add or remove the `required` attribute.

## Notes on Syntax

While attribute binding in Aurelia is versatile and robust, there are certain syntactical nuances and limitations to be aware of to prevent unexpected behavior.

1. **Expression Syntax Restrictions**

   - **No Chaining with `;` or `,`**: Expressions within `${}` cannot be chained using semicolons `;` or commas `,`. Each interpolation expression should represent a single, complete expression.
   
   - **Restricted Primitives and Operators**: Certain JavaScript primitives and operators cannot be used within interpolation expressions. These include:
     - `Boolean`
     - `String`
     - `instanceof`
     - `typeof`
     - Bitwise operators (except for the pipe `|` used with value converters)
   
   - **Usage of Pipe `|`**: The pipe character `|` is reserved exclusively for Aurelia's value converters within bindings and cannot be used as a bitwise operator.

2. **Attribute Targeting Syntax**

   The presence of both `.bind` and `.attr` syntaxes can be confusing. Here's why both exist:

   - **Property vs. Attribute Binding**: `.bind` targets the DOM property, which is suitable for standard attributes that have corresponding DOM properties. However, for custom or non-standard attributes that do not have direct property mappings, `.attr` is necessary to bind directly to the attribute itself.
   
   - **Example: Binding `id` Using Property and Attribute**

     ```html
     <!-- Property Binding -->
     <input id.bind="inputId" />
     
     <!-- Attribute Binding -->
     <input id.attr="inputId" />
     ```

     ```typescript
     // my-app.ts
     export class MyApp {
       inputId = 'user-input';
     }
     ```

     *Result:*
     - Using `.bind`, Aurelia binds to the `id` property of the `input` element.
     - Using `.attr`, Aurelia binds directly to the `id` attribute in the DOM.

3. **Choosing Between Interpolation and Keyword Binding**

   Both interpolation and keyword binding can achieve similar outcomes. The choice between them often comes down to preference and specific use case requirements.

   - **Performance and Features**: There is no significant performance difference between the two. Both are equally efficient and offer similar capabilities.
   
   - **Readability and Maintainability**: Interpolation can be more readable for simple string concatenations, while keyword bindings offer more explicit control for complex bindings.

{% hint style="info" %}
For complex transformations or formatting, consider using Aurelia's value converters instead of embedding extensive logic within interpolation expressions. This practice enhances code maintainability and separation of concerns.
{% endhint %}

### Example: Using Value Converters for Formatting

**Binding with a Value Converter**

```html
<!-- my-app.html -->
<span class="price">${totalPrice | currency}</span>
```

```typescript
// my-app.ts
export class MyApp {
  totalPrice = 199.99;
}
```

```typescript
// currency-value-converter.ts
export class CurrencyValueConverter {
  toView(value: number) {
    return `$${value.toFixed(2)}`;
  }
}
```

*Result:* Displays the `totalPrice` formatted as currency, e.g., "$199.99".

## Troubleshooting and Common Issues

### 1. Binding Behavior Errors

**Error: AUR9994 - Invalid Binding Type for 'attr' Binding Behavior**

This error occurs when the `attr` binding behavior is used with non-property bindings:

```html
<!-- ❌ Incorrect: Using attr with event binding -->
<button click.trigger="save() & attr">Save</button>

<!-- ✅ Correct: Remove attr from event binding -->
<button click.trigger="save()">Save</button>

<!-- ✅ Correct: Use attr with property binding -->
<input value.bind="query & attr">
```

### 2. Null and Undefined Values

When bound properties are `null` or `undefined`, attributes are removed from the DOM:

```typescript
export class MyApp {
  tooltipText: string | null = null; // Will remove title attribute
  isDisabled: boolean | undefined = undefined; // Will remove disabled attribute
}
```

```html
<!-- These attributes will be removed when values are null/undefined -->
<div title.bind="tooltipText">Content</div>
<button disabled.bind="isDisabled">Click me</button>
```

### 3. Custom Attribute Conflicts

When using `.attr` binding command, Aurelia bypasses custom attribute detection:

```html
<!-- This will create a DOM attribute, NOT invoke a custom attribute -->
<div my-custom.attr="value"></div>

<!-- This will invoke the custom attribute -->
<div my-custom.bind="value"></div>
```

### 4. Boolean Attribute Handling

HTML boolean attributes (like `disabled`, `checked`, `readonly`) have special handling:

```html
<!-- These all result in disabled="disabled" or no attribute -->
<button disabled.bind="true">Always Disabled</button>
<button disabled.bind="false">Never Disabled</button>
<button disabled.bind="isDisabled">Conditionally Disabled</button>
```

### 5. SVG Attributes

SVG attributes may require the `attr` binding behavior for proper functionality:

```html
<svg>
  <!-- For SVG-specific attributes, use attr binding behavior -->
  <circle cx.bind="x & attr" cy.bind="y & attr" r.bind="radius & attr" />
  <text text-anchor.bind="anchor & attr">Label</text>
</svg>
```

## Performance Considerations

### 1. Binding Mode Selection

Choose the appropriate binding mode for optimal performance:

- Use `.one-time` for static values that never change
- Use `.to-view` for display-only data
- Use `.two-way` only when bidirectional synchronization is needed
- Use `.from-view` for write-only scenarios

### 2. Expression Complexity

Keep binding expressions simple for better performance:

```html
<!-- ❌ Complex expression in template -->
<div class.bind="items.filter(i => i.active).length > 0 ? 'has-active' : 'no-active'"></div>

<!-- ✅ Move logic to view model -->
<div class.bind="hasActiveItems ? 'has-active' : 'no-active'"></div>
```

```typescript
export class MyApp {
  get hasActiveItems() {
    return this.items.some(i => i.active);
  }
}
```

### 3. Computed Properties

Use computed properties with proper dependencies for efficient updates:

```typescript
import { computed } from '@aurelia/runtime';

export class MyApp {
  items = [];
  
  @computed({ dependencies: ['items.length'] })
  get itemCount() {
    return this.items.length;
  }
}
```

## Best Practices

### 1. Consistent Naming

Use consistent naming conventions for attributes and properties:

```html
<!-- Use kebab-case for attributes -->
<my-component data-id.bind="itemId" custom-prop.bind="value"></my-component>
```

### 2. Type Safety

Leverage TypeScript for better development experience:

```typescript
interface User {
  id: number;
  name: string;
  avatar?: string;
}

export class UserProfile {
  user: User = { id: 1, name: 'John' };
  
  get avatarUrl(): string {
    return this.user.avatar ?? '/default-avatar.png';
  }
}
```

### 3. Error Boundaries

Handle potential errors in binding expressions:

```html
<!-- Use optional chaining and fallbacks -->
<img src.bind="user?.avatar ?? defaultAvatar" alt.bind="user?.name ?? 'Unknown User'">
```

### 4. Accessibility

Ensure proper accessibility attributes:

```html
<!-- Include ARIA attributes for screen readers -->
<button 
  disabled.bind="isLoading" 
  aria-busy.bind="isLoading & attr"
  aria-label.bind="buttonLabel & attr">
  ${isLoading ? 'Loading...' : 'Submit'}
</button>
```

## Summary

Attribute binding in Aurelia offers a flexible and powerful means to synchronize data between your view model and the DOM. By understanding and utilizing the various binding commands and techniques, you can create dynamic, responsive, and maintainable user interfaces. Always consider the specific needs of your project when choosing between different binding strategies, and leverage Aurelia's features to their fullest to enhance your application's interactivity and user experience.

Key takeaways:

- Use the appropriate binding mode for your use case
- Understand the difference between property and attribute targeting
- Leverage the `attr` binding behavior for custom attributes
- Handle null/undefined values gracefully
- Consider performance implications of complex expressions
- Follow accessibility best practices
- Use TypeScript for better development experience
