# Templates

Aurelia's templating system provides powerful data binding, event handling, and control flow with intuitive syntax. Templates are HTML files enhanced with binding expressions and template controls.

## Data Binding

### Text Interpolation

Display dynamic content using string interpolation:

```html
<h1>${title}</h1>
<p>Welcome, ${user.firstName} ${user.lastName}!</p>
```

### Property Binding

Bind to element properties and attributes:

```html
<!-- Property binding -->
<input value.bind="message">
<img src.bind="imageUrl" alt.bind="imageAlt">

<!-- Attribute binding -->
<div class.bind="cssClass" id.bind="elementId">

<!-- Boolean attributes -->
<button disabled.bind="isLoading">Submit</button>
```

### Two-way Binding

Create two-way data flow with `.bind`:

```html
<input value.bind="searchQuery">
<p>Searching for: ${searchQuery}</p>
```

As you type, both the input and paragraph update automatically.

## Event Handling

Handle user interactions with `.trigger`:

```html
<button click.trigger="save()">Save</button>
<form submit.trigger="handleSubmit($event)">
  <input keyup.trigger="validateInput($event)">
</form>
```

```typescript
export class MyComponent {
  save() {
    console.log('Saving...');
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    // Handle form submission
  }

  validateInput(event: KeyboardEvent) {
    // Validate as user types
  }
}
```

## Conditional Rendering

Show or hide content based on conditions:

```html
<!-- Show/hide elements -->
<div if.bind="isLoggedIn">
  <p>Welcome back!</p>
</div>

<div else>
  <p>Please log in</p>
</div>

<!-- Conditionally show content -->
<p show.bind="hasMessages">You have new messages</p>
<p hide.bind="isLoading">Content loaded</p>
```

## List Rendering

Display dynamic lists with `repeat.for`:

```html
<ul>
  <li repeat.for="item of items">${item.name}</li>
</ul>

<!-- With index -->
<div repeat.for="product of products">
  <h3>${$index + 1}. ${product.title}</h3>
  <p>${product.description}</p>
</div>
```

## Template References

Access DOM elements directly:

```html
<input ref="searchInput" value.bind="query">
<button click.trigger="focusSearch()">Focus Search</button>
```

```typescript
export class MyComponent {
  searchInput: HTMLInputElement;

  focusSearch() {
    this.searchInput.focus();
  }
}
```

## Template Variables

Create local variables within templates:

```html
<div with.bind="user">
  <h2>${firstName} ${lastName}</h2>
  <p>${email}</p>
</div>

<!-- Using let for computed values -->
<div let="fullName.bind="firstName + ' ' + lastName">
  <h2>${fullName}</h2>
</div>
```

## What's Next

- Explore the complete [template syntax overview](../templates/template-syntax/overview.md)
- Learn about [value converters](../templates/value-converters.md) for data transformation
- Discover [custom attributes](../templates/custom-attributes.md) for reusable behaviors