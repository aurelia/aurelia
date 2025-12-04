# Spread Binding (`.spread`)

The `.spread` binding command allows you to bind multiple properties from an object to a custom element's bindable properties or to an HTML element's attributes in a single, concise expression. This is particularly useful when you have an object with multiple properties that match the bindable properties of a custom element or attributes of an HTML element.

## Overview

Instead of binding each property individually:

```html
<user-card
  name.bind="user.name"
  email.bind="user.email"
  avatar.bind="user.avatarUrl"
  role.bind="user.role">
</user-card>
```

You can use `.spread` to bind all matching properties at once:

```html
<user-card user.spread="user"></user-card>
```

## Basic Usage with Custom Elements

The `.spread` binding is most powerful when used with custom elements that have multiple bindable properties:

```typescript
// user-card.ts
import { bindable } from 'aurelia';

export class UserCard {
  @bindable name: string;
  @bindable email: string;
  @bindable avatarUrl: string;
  @bindable role: string;
}
```

```html
<!-- my-app.html -->
<user-card user.spread="currentUser"></user-card>
```

```typescript
// my-app.ts
export class MyApp {
  currentUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: 'Administrator'
  };
}
```

**Result:** The `user-card` component receives all matching properties from `currentUser`. Properties like `name`, `email`, `avatarUrl`, and `role` are automatically bound to their respective bindable properties.

## How It Works

The `.spread` binding:

1. **Evaluates the expression** to get an object
2. **Identifies matching properties** between the object and the target's bindable properties (for custom elements) or valid attributes (for HTML elements)
3. **Creates individual bindings** for each matching property
4. **Updates dynamically** when the source object changes

### Property Matching

For **custom elements**, only properties that are declared as `@bindable` are bound:

```typescript
export class ProductCard {
  @bindable name: string;     // Will be bound if exists in spread object
  @bindable price: number;    // Will be bound if exists in spread object
  description: string;        // Won't be bound (not @bindable)
}
```

```html
<product-card data.spread="product"></product-card>
```

```typescript
export class MyApp {
  product = {
    name: 'Laptop',
    price: 999,
    description: 'A powerful laptop',  // This won't be bound (not @bindable)
    category: 'Electronics'             // This won't be bound (not @bindable)
  };
}
```

For **HTML elements**, all standard HTML attributes can be bound:

```html
<input attrs.spread="inputConfig">
```

```typescript
export class MyApp {
  inputConfig = {
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
    maxlength: 100
  };
}
```

## Dynamic Object Updates

When the source object changes, the bindings update automatically:

```typescript
import { resolve } from '@aurelia/kernel';

export class DynamicProfile {
  user = {
    name: 'John',
    email: 'john@example.com',
    role: 'User'
  };

  upgradeToAdmin() {
    // This will automatically update the spread bindings
    this.user = {
      name: 'John',
      email: 'john@example.com',
      role: 'Administrator'  // Changed
    };
  }

  updateName(newName: string) {
    // This will also update the spread bindings
    this.user = {
      ...this.user,
      name: newName
    };
  }
}
```

```html
<user-card profile.spread="user"></user-card>
<button click.trigger="upgradeToAdmin()">Upgrade to Admin</button>
<button click.trigger="updateName('Jane')">Change Name</button>
```

## Combining Spread with Individual Bindings

You can mix `.spread` bindings with individual property bindings. Individual bindings take precedence:

```typescript
export class MyApp {
  userDefaults = {
    name: 'Guest',
    email: 'guest@example.com',
    role: 'Visitor'
  };

  adminEmail = 'admin@example.com';
}
```

```html
<!-- Spread provides defaults, but email is overridden -->
<user-card
  defaults.spread="userDefaults"
  email.bind="adminEmail">
</user-card>
```

**Result:** The `user-card` receives `name` and `role` from `userDefaults`, but `email` is bound to `adminEmail` specifically.

## Spreading HTML Element Attributes

The `.spread` binding works with regular HTML elements too:

```typescript
export class FormBuilder {
  textInputConfig = {
    type: 'text',
    placeholder: 'Enter text',
    class: 'form-control',
    required: true,
    minlength: 3,
    maxlength: 50
  };

  emailInputConfig = {
    type: 'email',
    placeholder: 'Enter email',
    class: 'form-control',
    required: true
  };
}
```

```html
<form>
  <input config.spread="textInputConfig">
  <input config.spread="emailInputConfig">
</form>
```

## Spreading to Multiple Custom Elements

You can use the same object with different custom elements:

```typescript
export class Dashboard {
  cardData = {
    title: 'Sales Report',
    subtitle: 'Q4 2024',
    value: '$1.2M',
    change: '+15%',
    icon: 'trending-up'
  };
}
```

```html
<info-card data.spread="cardData"></info-card>
<metric-widget data.spread="cardData"></metric-widget>
<summary-panel data.spread="cardData"></summary-panel>
```

Each component receives only the properties it defines as `@bindable`.

## Strict Mode

By default, `.spread` operates in non-strict mode, which means it silently ignores properties that don't match bindable properties. In development builds, warnings may be logged when spreading non-object values.

```typescript
export class MyApp {
  // This will work but only matching properties are bound
  userData = {
    name: 'Alice',
    email: 'alice@example.com',
    unknownProp: 'ignored'  // Silently ignored if not @bindable
  };

  // This will log a warning in dev mode
  invalidData = null;
}
```

```html
<user-card data.spread="userData"></user-card>
<user-card data.spread="invalidData"></user-card> <!-- Warning in dev -->
```

## Performance Considerations

### Efficient Updates

The `.spread` binding uses caching to minimize unnecessary work:
- **Binding cache**: Bindings for each property are created once and reused
- **Scope cache**: Binding scopes are cached per object instance
- **Smart updates**: Only properties that exist in both the source object and target are bound

### When to Use Spread

**Use `.spread` when:**
- You have an object with multiple properties that map to bindable properties
- You're working with data from APIs or state management
- You want to reduce template verbosity
- The source object structure matches the target's bindable properties

**Avoid `.spread` when:**
- You only need to bind one or two properties (use individual bindings)
- You need fine-grained control over each binding's mode (`.two-way`, `.one-time`, etc.)
- The source object has many properties that don't match the target (creates unnecessary overhead)

## Complete Example: Dynamic Form

Here's a comprehensive example showing how to build dynamic forms with `.spread`:

```typescript
// form-field.ts
import { bindable } from 'aurelia';

export class FormField {
  @bindable label: string;
  @bindable type: string = 'text';
  @bindable value: string;
  @bindable placeholder: string;
  @bindable required: boolean = false;
  @bindable disabled: boolean = false;
  @bindable error: string;
}
```

```html
<!-- form-field.html -->
<div class="form-field">
  <label if.bind="label">${label}</label>
  <input
    type.bind="type"
    value.bind="value"
    placeholder.bind="placeholder"
    required.bind="required"
    disabled.bind="disabled">
  <span class="error" if.bind="error">${error}</span>
</div>
```

```typescript
// registration-form.ts
export class RegistrationForm {
  fields = {
    username: {
      label: 'Username',
      type: 'text',
      placeholder: 'Enter username',
      required: true,
      value: ''
    },
    email: {
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter email',
      required: true,
      value: ''
    },
    password: {
      label: 'Password',
      type: 'password',
      placeholder: 'Enter password',
      required: true,
      value: ''
    },
    bio: {
      label: 'Biography',
      type: 'textarea',
      placeholder: 'Tell us about yourself',
      required: false,
      value: ''
    }
  };

  submit() {
    const formData = Object.keys(this.fields).reduce((acc, key) => {
      acc[key] = this.fields[key].value;
      return acc;
    }, {} as Record<string, string>);

    console.log('Form submitted:', formData);
  }
}
```

```html
<!-- registration-form.html -->
<form>
  <form-field field.spread="fields.username"></form-field>
  <form-field field.spread="fields.email"></form-field>
  <form-field field.spread="fields.password"></form-field>
  <form-field field.spread="fields.bio"></form-field>

  <button type="button" click.trigger="submit()">Submit</button>
</form>
```

## Spreading with Repeaters

Combine `.spread` with `repeat.for` to dynamically generate components from data:

```typescript
export class DataGrid {
  columns = [
    { name: 'id', label: 'ID', sortable: true, width: 60 },
    { name: 'name', label: 'Name', sortable: true, width: 200 },
    { name: 'email', label: 'Email', sortable: false, width: 250 },
    { name: 'role', label: 'Role', sortable: true, width: 120 }
  ];
}
```

```html
<table>
  <thead>
    <tr>
      <table-header
        repeat.for="column of columns"
        config.spread="column">
      </table-header>
    </tr>
  </thead>
</table>
```

## Nested Spread Bindings

The `.spread` binding can be nested to handle captured attributes in parent-child custom element scenarios:

```html
<!-- parent-component.html -->
<child-component outer.spread="..."></child-component>
```

The spread binding will automatically handle captured attributes and pass them through the component hierarchy. This is particularly useful when building wrapper components.

## Integration with State Management

Spread bindings work naturally with state management solutions:

```typescript
import { Store } from '@aurelia/store-v1';
import { connectTo } from '@aurelia/store-v1';

@connectTo()
export class UserProfile {
  state: State;

  // User object from store
  get user() {
    return this.state.currentUser;
  }
}
```

```html
<!-- Spread the user from the store -->
<user-details data.spread="user"></user-details>
<user-preferences settings.spread="user.preferences"></user-preferences>
```

## Debugging Spread Bindings

In development mode, you can inspect which properties were bound:

```typescript
export class DebugComponent {
  @bindable name: string;
  @bindable email: string;
  @bindable role: string;

  binding() {
    // Check what was bound
    console.log('Name:', this.name);
    console.log('Email:', this.email);
    console.log('Role:', this.role);
  }
}
```

If properties aren't binding as expected:

1. **Verify @bindable decorators**: Ensure target properties are decorated with `@bindable`
2. **Check property names**: Property names must match exactly (case-sensitive)
3. **Inspect the source object**: Log the object being spread to verify it contains expected properties
4. **Watch for warnings**: Development mode logs warnings for non-object values

## Comparison with Other Approaches

### Traditional Individual Bindings

```html
<!-- Verbose but explicit -->
<user-card
  name.bind="user.name"
  email.bind="user.email"
  role.bind="user.role">
</user-card>
```

**Pros:** Clear, explicit, supports different binding modes per property
**Cons:** Verbose, repetitive, harder to maintain

### Spread Binding

```html
<!-- Concise and maintainable -->
<user-card data.spread="user"></user-card>
```

**Pros:** Concise, reduces repetition, easy to maintain
**Cons:** Less explicit, all properties use `.to-view` binding mode

### Passing Whole Object as Bindable

```html
<!-- Pass entire object -->
<user-card user.bind="user"></user-card>
```

**Pros:** Very concise, passes all data
**Cons:** Requires component to accept object, tighter coupling

## Best Practices

1. **Use descriptive names**: Name the spread binding to indicate what it spreads (e.g., `user.spread`, `config.spread`, `props.spread`)

2. **Document expected properties**: In your custom element, document which properties are expected from a spread binding

```typescript
/**
 * User card component
 *
 * @spread user - Expects: name, email, avatarUrl, role
 */
export class UserCard {
  @bindable name: string;
  @bindable email: string;
  @bindable avatarUrl: string;
  @bindable role: string;
}
```

3. **Provide defaults**: Use default values for optional properties

```typescript
export class ConfigurableCard {
  @bindable title: string = 'Untitled';
  @bindable size: string = 'medium';
  @bindable color: string = 'blue';
}
```

4. **Validate in lifecycle hooks**: Validate required properties in `binding()` or `bound()` hooks

```typescript
export class UserCard {
  @bindable name: string;
  @bindable email: string;

  binding() {
    if (!this.name || !this.email) {
      throw new Error('UserCard requires name and email properties');
    }
  }
}
```

## See Also

- [Bindable Properties](../components/bindable-properties.md) - Defining bindable properties on custom elements
- [Custom Elements](../components/components.md) - Building custom elements
- [Attribute Binding](./template-syntax/attribute-binding.md) - Standard attribute binding syntax
- [Property Binding](../getting-to-know-aurelia/components/creating-components/consuming-a-custom-element.md) - Binding to component properties
