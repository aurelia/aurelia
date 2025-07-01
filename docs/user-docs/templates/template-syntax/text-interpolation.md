# Text interpolation

Text interpolation allows you to display dynamic values in your views. By wrapping an expression with `${}`, you can render variables, object properties, function results, and more within your HTML. This is conceptually similar to [JavaScript template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

## Displaying values with interpolation

Interpolation can display the values of view model properties, object fields, and any valid expression. As an example, consider the following code:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  myName = 'Aurelia';
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<p>Hello, my name is ${myName}</p>
```
{% endcode %}

Here, the template references the same property name, `myName`, that is defined in the view model. Aurelia automatically replaces `${myName}` with "Aurelia" at runtime. Any property you define on your class can be directly accessed inside your templates.

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

## HTMLElement interpolation

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
  content = Document.parseHTMLUnsafe('<button>Parsed Button</button>').documentElement;
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<div>${content}</div>
```
{% endcode %}

{% hint style="warning" %}
When using `Document.parseHTMLUnsafe()`, be cautious about the source of your HTML strings to avoid XSS vulnerabilities. Only use this with trusted content.
{% endhint %}

### Dynamic element creation

This feature is particularly useful for dynamic content scenarios:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  elements = [];
  
  addDynamicElement() {
    const div = document.createElement('div');
    div.innerHTML = '<strong>Dynamic content!</strong>';
    div.style.padding = '10px';
    div.style.border = '1px solid blue';
    this.elements.push(div);
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<button click.trigger="addDynamicElement()">Add Element</button>
<div repeat.for="el of elements">
  ${el}
</div>
```
{% endcode %}

## Custom Element interpolation

Aurelia supports passing custom element types and definitions directly to template interpolations. This allows you to dynamically render custom elements in your templates based on runtime conditions.

### Using custom element definitions

You can bind custom element definitions created with `CustomElement.define()` directly:

{% code title="my-app.ts" %}
```typescript
import { CustomElement } from 'aurelia';

export class MyApp {
  // Define custom elements dynamically
  cardComponent = CustomElement.define({
    name: 'card',
    template: '<div class="card"><h3>${title}</h3><p>${content}</p></div>',
    bindables: ['title', 'content']
  }, class Card {
    title = 'Default Title';
    content = 'Default Content';
  });
  
  // Or use a pre-defined custom element
  headerComponent = CustomElement.define({
    name: 'my-header',
    template: '<header><h1>Welcome!</h1></header>'
  }, class Header { });
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<div>
  ${headerComponent}
  <main>
    ${cardComponent}
  </main>
</div>
```
{% endcode %}

### Using decorator-defined custom elements

You can also use custom elements defined with the `@customElement` decorator:

{% code title="my-app.ts" %}
```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'user-card',
  template: '<div class="card"><h3>${name}</h3><p>${role}</p></div>'
})
class UserCard {
  name = 'John Doe';
  role = 'Developer';
}

export class MyApp {
  // Reference the custom element class directly
  userCardComponent = UserCard;
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<div>
  ${userCardComponent}
</div>
```
{% endcode %}

### Dynamic component selection

This feature is particularly powerful for scenarios where you need to select components dynamically:

{% code title="my-app.ts" %}
```typescript
import { CustomElement } from 'aurelia';

export class MyApp {
  currentView = 'list';
  
  listView = CustomElement.define({
    name: 'list-view',
    template: '<ul><li repeat.for="item of items">${item}</li></ul>'
  }, class ListView {
    items = ['Item 1', 'Item 2', 'Item 3'];
  });
  
  gridView = CustomElement.define({
    name: 'grid-view',
    template: '<div class="grid"><div repeat.for="item of items" class="grid-item">${item}</div></div>'
  }, class GridView {
    items = ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4'];
  });
  
  get currentComponent() {
    return this.currentView === 'list' ? this.listView : this.gridView;
  }
  
  toggleView() {
    this.currentView = this.currentView === 'list' ? 'grid' : 'list';
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<button click.trigger="toggleView()">Toggle View</button>
<div>
  ${currentComponent}
</div>
```
{% endcode %}

### With activate lifecycle

Custom elements rendered through interpolation support the `activate` lifecycle hook:

{% code title="my-app.ts" %}
```typescript
import { CustomElement } from 'aurelia';

export class MyApp {
  userCardComponent = {
    component: CustomElement.define({
      name: 'user-card',
      template: '<div class="user-card"><h3>${name}</h3><p>${email}</p></div>'
    }, class UserCard {
      name = '';
      email = '';
      
      activate(model: any) {
        if (model) {
          this.name = model.name;
          this.email = model.email;
        }
      }
    }),
    model: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  };
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<div>
  ${userCardComponent}
</div>
```
{% endcode %}

### Conditional rendering

You can use custom element interpolation with conditional expressions:

{% code title="my-app.ts" %}
```typescript
import { CustomElement } from 'aurelia';

export class MyApp {
  isLoggedIn = false;
  
  loginForm = CustomElement.define({
    name: 'login-form',
    template: '<form><input placeholder="Username"><input type="password" placeholder="Password"><button>Login</button></form>'
  }, class LoginForm { });
  
  userDashboard = CustomElement.define({
    name: 'user-dashboard',
    template: '<div><h2>Welcome back!</h2><p>Your dashboard content here...</p></div>'
  }, class UserDashboard { });
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<div>
  ${isLoggedIn ? userDashboard : loginForm}
</div>
```
{% endcode %}

{% hint style="info" %}
When a custom element value changes in an interpolation, Aurelia automatically handles the cleanup of the previous element and renders the new one, ensuring proper lifecycle management.
{% endhint %}

{% hint style="warning" %}
Custom element interpolation only works with custom element types (classes) or definitions, not with instances. If you need to pass data to the custom element, use the `{ component, model }` format.
{% endhint %}

## How Bindable Properties Work

When rendering custom elements through interpolation, there are two approaches to passing data to bindable properties:

### 1. Using the Activate Lifecycle

The simplest approach is to use the `activate` lifecycle method with the `{ component, model }` syntax:

```typescript
const ItemCE = CustomElement.define({
  name: 'list-item',
  template: '<li>${content} - ${priority}</li>',
  bindables: ['content', 'priority']
}, class ListItem {
  content = '';
  priority = 'normal';
  
  activate(model?: any) {
    if (model) {
      this.content = model.content || this.content;
      this.priority = model.priority || this.priority;
    }
  }
});

// Usage
export class App {
  listItem = {
    component: ItemCE,
    model: { 
      content: 'Buy groceries',
      priority: 'high'
    }
  };
}
```

### 2. Default Values in Custom Elements

Bindable properties can have default values that will be used when no model is provided:

```typescript
const CardCE = CustomElement.define({
  name: 'info-card',
  template: '<div class="card ${type}">${title}</div>',
  bindables: {
    title: { mode: BindingMode.toView },
    type: { mode: BindingMode.toView }
  }
}, class InfoCard {
  title = 'Information';
  type = 'info';
});

// Will use default values
export class App {
  card = CardCE;
}
```

### 3. Two-Way Binding Considerations

While you can define two-way bindable properties, note that the interpolation binding itself is one-way. The two-way binding would only work within the custom element's template:

```typescript
const InputCE = CustomElement.define({
  name: 'custom-input',
  template: '<input value.bind="value" input.trigger="updateValue($event.target.value)">',
  bindables: {
    value: { mode: BindingMode.twoWay }
  }
}, class CustomInput {
  value = '';
  
  updateValue(newValue: string) {
    this.value = newValue;
  }
  
  activate(model?: any) {
    if (model && model.value !== undefined) {
      this.value = model.value;
    }
  }
});
```

## Advanced Scenarios

### Nested Custom Elements

Custom elements can render other custom elements through interpolation:

```typescript
const HeaderCE = CustomElement.define({
  name: 'page-header',
  template: '<h1>${title}</h1>'
}, class PageHeader {
  title = 'Page Title';
});

const LayoutCE = CustomElement.define({
  name: 'page-layout',
  template: '<div class="layout">${headerComponent}<main><au-slot></au-slot></main></div>'
}, class PageLayout {
  headerComponent = HeaderCE;
});

// Usage
export class App {
  layout = LayoutCE;
}
```

### Conditional Component Selection

You can dynamically select which component to render based on conditions:

```typescript
export class App {
  userRole: 'guest' | 'user' | 'admin' = 'guest';
  
  get currentView() {
    switch (this.userRole) {
      case 'admin': return AdminPanelCE;
      case 'user': return DashboardCE;
      default: return LoginFormCE;
    }
  }
}
```

```html
<div>${currentView}</div>
```

### Working with Template Controllers

Custom element interpolation works seamlessly with Aurelia's template controllers:

```typescript
// With if.bind
export class App {
  showCard = true;
  card = CardCE;
}
```

```html
<div if.bind="showCard">${card}</div>
```

```typescript
// With repeat.for
export class App {
  items = [
    { component: CardCE, model: { title: 'Card 1' } },
    { component: CardCE, model: { title: 'Card 2' } },
    { component: CardCE, model: { title: 'Card 3' } }
  ].map(item => ({
    component: {
      component: item.component,
      model: item.model
    }
  }));
}
```

```html
<div repeat.for="item of items">${item.component}</div>
```

### Shadow DOM Support

Custom element interpolation fully supports Shadow DOM components that use native `<slot>` elements:

```typescript
const ShadowCardCE = CustomElement.define({
  name: 'shadow-card',
  template: '<div class="card"><h3><slot name="header">Default Header</slot></h3><slot>Default Content</slot></div>',
  shadowOptions: { mode: 'open' }
}, class ShadowCard { });

// Or using the decorator
@customElement({
  name: 'shadow-card',
  template: '<div class="card"><h3><slot name="header">Default Header</slot></h3><slot>Default Content</slot></div>',
  shadowOptions: { mode: 'open' }
})
export class ShadowCard { }
```

You can also mix Shadow DOM and regular components:

```typescript
export class App {
  useShadow = false;
  
  get currentComponent() {
    return this.useShadow ? ShadowCardCE : RegularCardCE;
  }
}
```

```html
<div>${currentComponent}</div>
```

{% hint style="info" %}
When using Shadow DOM components through interpolation, the Shadow DOM encapsulation rules apply. Styles defined outside the shadow root won't affect the component's content, and slots work according to native Shadow DOM slot behavior.
{% endhint %}

## Best Practices

1. **Use descriptive names**: When storing custom element references, use clear property names that indicate they're components.

2. **Consider memory**: The interpolation system properly disposes of previous custom elements when values change, but be mindful of creating too many dynamic components.

3. **Prefer static registration**: While dynamic interpolation is powerful, consider if `<au-compose>` or static element usage might be more appropriate for your use case.

4. **Type safety**: When using TypeScript, create proper types for your model objects to ensure type safety.

## Notes on syntax

While template interpolation is powerful, there are a few limitations to keep in mind:

1. You cannot chain expressions using `;` or `,`.
2. You cannot use certain primitives or operators such as `Boolean`, `String`, `instanceof`, or `typeof`.
3. The pipe character `|` is reserved for Aurelia value converters and cannot be used as a bitwise operator inside interpolation.

{% hint style="info" %}
For complex transformations or formatting, consider using Aurelia's value converters instead of cramming too much logic into an interpolation.
{% endhint %}
