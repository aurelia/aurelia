# Spread Operators

Aurelia supports two different spread features in templates:

1. **Bindables spreading**: bind multiple properties from an object onto a custom element’s bindable properties.
2. **Attribute transferring**: forward captured attributes/bindings from a custom element usage to an element inside its template.

This page focuses on the **template syntax** and common gotchas. For the deeper conceptual guide, see:

- [Bindable Properties](../components/bindable-properties.md) (Bindables spreading, Attributes Transferring)
- [Attribute Transferring](../getting-to-know-aurelia/introduction/attribute-transferring.md)

---

## 1) Bindables spreading

Bindables spreading is for **custom element usage**. It creates one-way (`to-view`) bindings from an object’s properties to matching bindable properties on the custom element.

### Syntax options

```html
<!-- Recommended: put the expression in the attribute value -->
<user-card ...$bindables="user"></user-card>

<!-- Equivalent: explicit binding command form -->
<user-card $bindables.spread="user"></user-card>

<!-- Shorthand: put the expression in the attribute name (no spaces!) -->
<user-card ...user></user-card>
```
<!-- Recommended: put the expression in the attribute value -->
<user-card ...$bindables="user"></user-card>

<!-- Equivalent: explicit binding command form -->
<user-card $bindables.spread="user"></user-card>

<!-- Shorthand: put the expression in the attribute name (no spaces!) -->
<user-card ...user></user-card>
```

### Example

```ts
import { bindable } from 'aurelia';

export class UserCard {
  @bindable name!: string;
  @bindable email!: string;
  @bindable avatarUrl!: string;
}
```

```ts
export class MyApp {
  user = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    extra: 'ignored'
  };
}
```

```html
<user-card ...$bindables="user"></user-card>
```

Only keys that match bindable **property names** (`name`, `email`, `avatarUrl`) create bindings. Extra keys are ignored.

### Important gotchas

- **Keys are property names, not attribute names**: `firstName` matches `@bindable firstName`, but `first-name` does not.
- **Shorthand is HTML-case-sensitive in a bad way**: HTML lowercases attribute names, so `...firstName` becomes `...firstname` and won’t match your view-model property. Prefer `...$bindables="firstName"` when case matters.
- **No spaces in shorthand**: `...a + b` becomes multiple attributes (`...a`, `+`, `b`) and will not work. Use `...$bindables="a + b"`.
- **Direction is always one-way (`to-view`)**: bindables spreading does not support `two-way`/`from-view`. Binding behaviors can’t change direction, but can still affect evaluation (e.g. `...$bindables="user & debounce:200"`).
- **Bindings are based on existing keys**: if the object did not have a key at the time it was evaluated, no binding is created for that property. To “add” bindings, assign a **new object**.

### Avoid double-binding the same property

You can technically combine spread syntax with explicit bindings, but it creates multiple bindings targeting the same property and can be confusing.

Prefer one approach, or ensure the intent is obvious and well-documented. If you do mix them, the last declared binding typically “wins” at update time.

---

## 2) Attribute transferring (`...$attrs`)

Attribute transferring is for **inside a component template**: it forwards “captured” attributes and bindings from the component’s usage to an element inside the component.

### Minimal example

Enable capturing on the custom element definition:

```ts
import { customElement, bindable } from 'aurelia';

@customElement({
  name: 'form-input',
  capture: true,
  template: `
    <label>
      \${label}
      <input ...$attrs>
    </label>
  `
})
export class FormInput {
  @bindable label!: string;
  @bindable value!: string;
}
```

Use it like a normal input:

```html
<form-input
  label="Email"
  value.bind="email"
  placeholder="name@example.com"
  input.trigger="validate($event)">
</form-input>
```

Everything that is captured from `<form-input ...>` will be applied to the inner `<input ...$attrs>`.

### What gets captured?

When `capture: true` is enabled, Aurelia captures (for later spreading) **everything except**:

- **custom element bindables** (those are handled as bindables, not captured)
- **template controllers** (like `if`, `repeat.for`, `with`, `portal`, etc.)

You can also supply a capture filter function if you only want to capture certain attributes.

### Restrictions

- You **cannot** transfer template controllers via `...$attrs` (you’ll get a compile error).
- Don’t overuse deep “pass-through” chains; one or two layers is usually plenty.

