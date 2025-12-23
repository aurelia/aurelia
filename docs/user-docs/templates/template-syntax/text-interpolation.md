# Text Interpolation

Text interpolation allows you to display dynamic values in your views. By wrapping an expression with `${}`, you can render variables, object properties, function results, and more within your HTML. This is conceptually similar to [JavaScript template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

## Template expressions

Expressions inside `${}` can perform operations such as arithmetic, function calls, or ternaries:

{% code title="Addition example" %}
```html
<p>Quick maths: ${2 + 2}</p>
<!-- Outputs "Quick maths: 4" -->
```
{% endcode %}

### Calling functions

You can call functions defined on your view model. For example:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  adder(val1: number, val2: number): number {
    return parseInt(val1) + parseInt(val2);
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<p>Behold mathematics, 6 + 1 = ${adder(6, 1)}</p>
<!-- Outputs "Behold mathematics, 6 + 1 = 7" -->
```
{% endcode %}

### Using ternaries

You can also use ternary operations:

{% code title="my-app.html" %}
```html
<p>${isTrue ? 'True' : 'False'}</p>
```
{% endcode %}

This will display either "True" or "False" depending on the boolean value of `isTrue`.

### Complex expressions

You can use more sophisticated expressions for dynamic content:

{% code title="Array operations" %}
```typescript
export class MyApp {
  items = [
    { name: 'Apple', price: 1.50, category: 'fruit' },
    { name: 'Banana', price: 0.80, category: 'fruit' },
    { name: 'Carrot', price: 0.90, category: 'vegetable' }
  ];
}
```
```html
<!-- Array length and conditionals -->
<p>Total items: ${items.length}</p>
<p>${items.length > 0 ? 'Items available' : 'No items'}</p>

<!-- Array methods (keep simple for performance) -->
<p>First item: ${items[0]?.name}</p>
<p>Expensive items: ${items.filter(i => i.price > 1).length}</p>
```
{% endcode %}

{% code title="Object property access" %}
```typescript
export class MyApp {
  user = {
    profile: {
      personal: { firstName: 'John', lastName: 'Doe' },
      settings: { theme: 'dark', notifications: true }
    }
  };
}
```
```html
<!-- Deep property access -->
<p>Welcome, ${user.profile.personal.firstName}!</p>

<!-- Dynamic property access -->
<p>Theme: ${user.profile.settings['theme']}</p>

<!-- Computed display names -->
<p>Full name: ${user.profile.personal.firstName + ' ' + user.profile.personal.lastName}</p>
```
{% endcode %}

{% code title="Conditional and logical operations" %}
```html
<p>Status: ${isLoggedIn && user ? 'Authenticated' : 'Guest'}</p>
<p>Display: ${showDetails || showSummary ? 'Visible' : 'Hidden'}</p>
<p>Count: ${count || 0}</p>
<p>Message: ${message?.trim() || 'No message'}</p>
```
{% endcode %}

## Optional Syntax

Aurelia supports the following optional chaining and nullish coalescing operators in templates:

- `??`
- `?.`
- `?.()`
- `?.[]`

{% hint style="warning" %}
Note that `??=` is not supported.
{% endhint %}

You can use these operators to safely handle null or undefined values:

{% code title="Optional chaining and nullish coalescing" %}
```html
<p>User Name: ${user?.name ?? 'Anonymous'}</p>
```
{% endcode %}

This helps avoid lengthy if-statements or ternary checks in your view model when dealing with potentially undefined data.

## HTMLElement Interpolation

Aurelia supports passing HTMLElement objects directly to template interpolations. This allows you to dynamically create and insert DOM elements into your templates at runtime.

### Creating elements with `document.createElement()`

You can create DOM elements in your view model and bind them directly:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  content = document.createElement('button');

  constructor() {
    this.content.textContent = 'Click me!';
    this.content.addEventListener('click', () => {
      alert('Button clicked!');
    });
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<div>${content}</div>
```
{% endcode %}

The button element will be directly inserted into the div, maintaining all its properties and event listeners.

### Parsing HTML strings

You can also parse HTML strings and render the resulting elements:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  content = (() => {
    const tpl = document.createElement('template');
    tpl.innerHTML = '<button>Parsed Button</button>';
    return tpl.content.firstElementChild as HTMLElement;
  })();
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<div>${content}</div>
```
{% endcode %}

{% hint style="warning" %}
Be cautious about the source of your HTML strings to avoid XSS vulnerabilities. Only do this with trusted content, or sanitize it first.
{% endhint %}

### Security Considerations

When interpolating HTMLElements, be mindful of security implications:

{% code title="Safe practices" %}
```typescript
export class MyApp {
  // ✅ Safe: Creating known elements
  createSafeButton() {
    const button = document.createElement('button');
    button.textContent = 'Safe Button'; // textContent escapes content
    button.className = 'safe-class';
    return button;
  }

  // ❌ Dangerous: Using innerHTML with user input
  createUnsafeElement(userInput: string) {
    const div = document.createElement('div');
    div.innerHTML = userInput; // Can execute scripts!
    return div;
  }

  // ✅ Better: Sanitize user input or use textContent
  createSafeElement(userInput: string) {
    const div = document.createElement('div');
    div.textContent = userInput; // Escapes all HTML
    return div;
  }
}
```
{% endcode %}

{% hint style="danger" %}
**Never use innerHTML with user-provided content** without proper sanitization. This can lead to XSS vulnerabilities.
{% endhint %}

### Dynamic element creation

This feature is particularly useful for dynamic content scenarios:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  elements: HTMLElement[] = [];

  addElement() {
    const newElement = document.createElement('span');
    newElement.textContent = `Element ${this.elements.length + 1}`;
    newElement.style.color = 'blue';
    this.elements.push(newElement);
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<button click.trigger="addElement()">Add Element</button>
<div repeat.for="element of elements">${element}</div>
```
{% endcode %}

## Notes on syntax

While template interpolation is powerful, there are a few limitations to keep in mind:

1. Aurelia parses **expressions**, not statements (so things like `if`, `for`, `return`, and `function` declarations are not supported inside `${...}`).
2. Some JavaScript tokens are repurposed: `|` is reserved for value converters and `&` is reserved for binding behaviors (so bitwise `|` / `&` are not available).
3. The comma operator (`,`) is not supported.

{% hint style="info" %}
For complex transformations or formatting, consider using Aurelia's value converters instead of cramming too much logic into an interpolation.
{% endhint %}

## Performance Best Practices

### Avoid Complex Expressions

Keep interpolation expressions simple for better performance. Complex computations should be moved to getters or methods:

{% code title="❌ Not recommended" %}
```html
<p>${items.filter(i => i.active).map(i => i.name.toUpperCase()).join(', ')}</p>
```
{% endcode %}

{% code title="✅ Better approach" %}
```typescript
export class MyApp {
  get activeItemNames() {
    return this.items
      .filter(i => i.active)
      .map(i => i.name.toUpperCase())
      .join(', ');
  }
}
```
```html
<p>${activeItemNames}</p>
```
{% endcode %}

### Array Observation Performance

Aurelia automatically observes arrays used in interpolation. For large arrays that change frequently, consider using computed getters:

{% code title="Large array optimization" %}
```typescript
export class MyApp {
  private _cachedResult: string = '';
  private _lastArrayLength: number = 0;

  get expensiveArrayComputation() {
    if (this.largeArray.length !== this._lastArrayLength) {
      this._cachedResult = this.largeArray
        .filter(/* complex filter */)
        .reduce(/* expensive operation */, '');
      this._lastArrayLength = this.largeArray.length;
    }
    return this._cachedResult;
  }
}
```
{% endcode %}

### Memory Considerations

When using HTMLElement interpolation, ensure proper cleanup to avoid memory leaks:

{% code title="Proper cleanup example" %}
```typescript
export class MyApp {
  elements: HTMLElement[] = [];

  detaching() {
    // Clean up event listeners and references
    this.elements.forEach(el => {
      el.removeEventListener('click', this.handleClick);
    });
    this.elements = [];
  }
}
```
{% endcode %}

## Error Handling and Edge Cases

### Handling Null and Undefined Values

Interpolation gracefully handles `null` and `undefined` values by rendering empty strings:

{% code title="Null/undefined handling" %}
```typescript
export class MyApp {
  name: string | null = null;
  data: any = undefined;
}
```
```html
<p>Name: ${name}</p>          <!-- Renders: "Name: " -->
<p>Data: ${data}</p>          <!-- Renders: "Data: " -->
<p>Safe: ${data?.prop}</p>     <!-- Renders: "Safe: " -->
```
{% endcode %}

### Error-Prone Expressions

Some expressions can throw runtime errors. Use defensive patterns:

{% code title="❌ Can throw errors" %}
```html
<p>${user.profile.name}</p>           <!-- Error if user or profile is null -->
<p>${items[selectedIndex].title}</p>  <!-- Error if index out of bounds -->
<p>${calculateTotal()}</p>            <!-- Error if method throws -->
```
{% endcode %}

{% code title="✅ Defensive patterns" %}
```html
<p>${user?.profile?.name ?? 'Anonymous'}</p>
<p>${items[selectedIndex]?.title ?? 'No item selected'}</p>
<p>${safeCalculateTotal()}</p>
```
```typescript
export class MyApp {
  safeCalculateTotal(): string {
    try {
      return this.calculateTotal().toString();
    } catch {
      return 'Calculation error';
    }
  }
}
```
{% endcode %}

### Type Coercion Behavior

Interpolation converts values to strings following JavaScript coercion rules:

{% code title="Type conversion examples" %}
```typescript
export class MyApp {
  number = 42;
  boolean = true;
  array = [1, 2, 3];
  object = { name: 'test' };
}
```
```html
<p>${number}</p>    <!-- Renders: "42" -->
<p>${boolean}</p>   <!-- Renders: "true" -->
<p>${array}</p>     <!-- Renders: "1,2,3" -->
<p>${object}</p>    <!-- Renders: "[object Object]" -->
```
{% endcode %}

### HTMLElement Edge Cases

When interpolating HTMLElements, be aware of these behaviors:

{% code title="HTMLElement considerations" %}
```typescript
export class MyApp {
  nullElement: HTMLElement | null = null;
  detachedElement = document.createElement('div');

  constructor() {
    this.detachedElement.textContent = 'Detached';
    // Element not in DOM yet
  }
}
```
```html
<div>${nullElement}</div>      <!-- Renders empty, no error -->
<div>${detachedElement}</div>  <!-- Inserts element into DOM -->
```
{% endcode %}

## Advanced Example: Dynamic Content with Observer Updates

Here's an example showing how interpolation works with Aurelia's observer system to automatically update the view when data changes:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  items = [];

  constructor() {
    this.items.push({ name: 'Item 1' }, { name: 'Item 2' });
  }

  addItem() {
    this.items.push({ name: `Item ${this.items.length + 1}` });
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<ul>
  <li repeat.for="item of items">${item.name}</li>
</ul>
<button click.trigger="addItem()">Add Item</button>
```
{% endcode %}

The interpolation is automatically updated by Aurelia's array observer whenever items are added to the collection.
