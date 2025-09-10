# Attributes transferring (or Spread Attributes)

## Introduction

Attribute transferring is a way to relay the binding(s) on a custom element to other element(s) inside it.

As an application grows, the components inside it also grow. Something that starts simple like the following component

```typescript
export class FormInput {
  @bindable label
  @bindable value
}
```

with the template

```html
<label>${label}
  <input value.bind="value">
</label>
```
can quickly grow out of hand with a number of needs for configuration: aria, type, min, max, pattern, tooltip, validation etc...

After a while, the `FormInput` component above will be come more and more like a relayer to transfer the bindings from outside, to the elements inside it. This often results in the increase of the number of `@bindable`. This is completely fine except that it's quite some boilerplate code that is not always desirable:

```typescript
export class FormInput {
  @bindable label
  @bindable value
  @bindable type
  @bindable tooltip
  @bindable arias
  @bindable etc
}
```

And the usage of such element may look like this

```html
<form-input
  label.bind="label"
  value.bind="message"
  tooltip.bind="Did you know Aurelia syntax comes from an idea of an Angular community member? We greatly appreciate Angular and its community for this."
  validation.bind="...">
```

to be repeated like this inside:

```html
<label>${label}
  <input value.bind tooltip.bind validation.bind min.bind max.bind>
</label>
```

To juggle all the relevant pieces for such relaying task isn't difficult, but somewhat tedious. With attribute transferring, which is roughly close to spreading in JavaScript, the above template should be as simple as:

```html
<label>${label}
  <input ...$attrs>
</label>
```

, which reads like this: for some bindings on `<form-input>`, change the targets of those bindings to the `<input>` element inside it.

## Aurelia Spread Operators Overview

Aurelia provides several spread operators for different use cases:

| Operator | Purpose | Example |
|----------|---------|---------|
| `...$attrs` | Spread captured attributes from parent element | `<input ...$attrs>` |
| `...$bindables` | Spread object properties to bindable properties | `<my-component ...$bindables="user">` |
| `...expression` | Shorthand for bindable spreading | `<my-component ...user>` |

Each operator serves a specific purpose in component composition and data flow.

## Usage

To transfer attributes & bindings from a custom element, there are two steps:

- Set `capture` to `true` on a custom element via `@customElement` decorator:

```typescript
@customElement({
  ...,
  capture: true
})
```

As the name suggests, this is to signal the template compiler that all the bindings & attributes, with some exceptions should be captured for future usages.

- Spread the captured attributes onto an element:

```html
<input ...$attrs>
```

{% hint style="warning" %}
It's recommended that this feature should not be overused in multi level capturing & transferring. This is often known as prop-drilling in React, and could have bad effect on overall & long term maintainability of a project. It's probably healthy to limit the max level of transferring to 2.
{% endhint %}


## How it works

### What attributes are captured

Everything except template controller and custom element bindables are captured. For the following example:

View model:
```typescript
export class FormInput {
  @bindable label
}
```

Usage:
```html
<form-input if.bind="needsComment" label.bind="label" value.bind="extraComment" class="form-control" style="background: var(--theme-purple)" tooltip="Hello, ${tooltip}">
```

What are captured:
  - `value.bind="extraComment"`
  - `class="form-control"`
  - `style="background: var(--theme-purple)"`
  - `tooltip="Hello, ${tooltip}"`
What are not captured:
  - `if.bind="needsComment"` (`if` is a template controller)
  - `label.bind="label"` (`label` is a bindable property)

### How will attributes be applied in ...$attrs

Attributes that are spread onto an element will be compiled as if it was declared on that element.

This means `.bind` command will work as expected when it's transferred from some element onto some element that uses `.two-way` for `.bind`.

It also means that spreading onto a custom element will also work: if a captured attribute is targeting a bindable property of the applied custom element. An example:

```html
app.html
<input-field value.bind="message">

input-field.html
<my-input ...$attrs>
```

if `value` is a bindable property of `my-input`, the end result will be a binding that connects the `message` property of the corresponding `app.html` view model with `<my-input>` view model `value` property. Binding mode is also preserved like normal attributes.

## Advanced Spread Patterns

### Mixed Binding Patterns

You can combine multiple spread operators and explicit bindings on the same element:

```html
<!-- Spread bindables, then attributes, then explicit bindings -->
<input-field ...user ...$attrs id.bind="fieldId" class="form-control">
```

**Binding Priority (last wins):**
1. `...$bindables` / `...expression` (first)
2. `...$attrs` (second) 
3. Explicit bindings (last, highest priority)

Note: According to the existing documentation, `...$attrs` will always result in bindings after `...$bindables`/`$bindables.spread`/`...expression`, regardless of their order in the template.

```html
<!-- The explicit value.bind will override any value from spreading -->
<input ...$attrs value.bind="explicitValue">
```

### Complex Member Access

Spread operators support complex expressions:

```html
<!-- Deep property access -->
<user-card ...user.profile.details>
<user-card ...user.addresses[0]>

<!-- Method calls and computed properties -->
<user-card ...user.getDetails()>
<user-card ...user.details | processUser>

<!-- For complex expressions, use the full syntax -->
<user-card ...$bindables="user.addresses.find(addr => addr.primary)">
```

### Conditional Spreading

You can conditionally spread attributes based on expressions:

```html
<!-- Only spread if user exists -->
<user-card ...$bindables="user || {}">

<!-- Spread different objects based on condition -->
<user-card ...$bindables="isAdmin ? adminUser : regularUser">

<!-- Combine with template controllers -->
<user-card if.bind="user" ...user>
```

## Automatic Expression Inference

Aurelia can automatically infer property names in certain binding scenarios:

### Shorthand Binding Syntax

```html
<!-- These are equivalent -->
<input value.bind="value">
<input value.bind>  <!-- Auto-infers 'value' property -->

<!-- Works with different binding commands -->
<input value.two-way="value">
<input value.two-way>  <!-- Auto-infers 'value' property -->

<!-- Attribute binding -->
<div textcontent.bind="textcontent">
<div textcontent.bind>  <!-- Auto-infers 'textcontent' property -->

<!-- Custom attributes -->
<div tooltip.bind="tooltip">
<div tooltip.bind>  <!-- Auto-infers 'tooltip' property -->
```

### Inference Rules

- Property name must match the attribute name exactly
- Only works with simple property access (no expressions)
- Works with all binding commands (`.bind`, `.two-way`, `.one-way`, etc.)
- Case-sensitive: `firstName.bind` infers `firstName`, not `firstname`

## Performance Considerations

### Binding Creation Optimization

Spread operators include several performance optimizations:

```typescript
// Aurelia optimizes repeated spread operations
class UserCard {
  @bindable user = { name: 'John', age: 30 };
  
  updateUser() {
    // If the same object reference is returned, bindings aren't recreated
    this.user = this.user; // No rebinding
    
    // New object reference triggers binding recreation
    this.user = { ...this.user, age: 31 }; // Rebinding occurs
  }
}
```

### One-time Change Detection

Spread operations are optimized to prevent unnecessary binding updates:

```html
<!-- Bindings are created once and reused when possible -->
<user-card ...user>
```

### Memory Usage Guidelines

- Spread operators create bindings for each property accessed
- Large objects with many properties create many bindings
- Consider using specific bindable properties for frequently changing data
- Use spreading primarily for configuration and setup data

## Error Handling & Edge Cases

### Null and Undefined Handling

Spread operators handle null and undefined values gracefully:

```html
<!-- Safe spreading - handles null/undefined gracefully -->
<user-card ...user>           <!-- Safe even if user is null/undefined -->
<user-card ...$bindables="user || {}">  <!-- Explicit fallback -->

<!-- Member access on null/undefined -->
<user-card ...user?.profile>  <!-- Safe with optional chaining -->
```

### Invalid Expressions

```html
<!-- These will be handled gracefully -->
<user-card ...undefined>      <!-- No bindings created -->
<user-card ...nonExistentVar> <!-- No bindings created -->
<user-card ...user.invalid>   <!-- No bindings created -->
```

### Type Safety with TypeScript

TypeScript provides compile-time validation for spread operations:

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

export class UserCard {
  @bindable name: string;
  @bindable email: string;
  // age is not a bindable, so it won't be bound even if present in the object
}

const user: User = { name: 'John', email: 'john@example.com', age: 30 };
```

```html
<!-- Only name and email will be bound based on component's @bindable properties -->
<user-card ...user>
```

## Advanced Capture Patterns

### Capture Filtering

Filter which attributes are captured using a function:

```typescript
@customElement({
  name: 'secure-input',
  template: '<input ...$attrs>',
  capture: attr => !attr.startsWith('on') // Exclude event handlers
})
export class SecureInput {
  @bindable value: string;
}
```

```typescript
@customElement({
  name: 'styled-input',
  template: '<input ...$attrs>',
  capture: attr => ['class', 'style', 'disabled'].includes(attr) // Only style-related
})
export class StyledInput {
  @bindable value: string;
}
```

### Multi-level Capture Guidelines

```html
<!-- Level 1: App uses form-group -->
<form-group title="User Info" ...validation>
  <!-- Level 2: form-group uses input-field -->
  <input-field label="Email" ...validation>
    <!-- Level 3: input-field uses input -->
    <input ...$attrs>
  </input-field>
</form-group>
```

{% hint style="warning" %}
**Best Practice**: Limit capture levels to 2-3 maximum to maintain code clarity and avoid prop-drilling anti-patterns.
{% endhint %}

### Template Controller Compatibility

Spread operators work with template controllers:

```html
<!-- Template controllers are not captured -->
<input-field if.bind="showField" ...fieldProps>

<!-- Multiple template controllers -->
<input-field if.bind="showField" repeat.for="field of fields" ...field>
```

## Integration Examples

### Component Composition

```typescript
// Base input component
export class BaseInput {
  @bindable value: string;
  @bindable placeholder: string;
  @bindable disabled: boolean;
}

// Specialized email input
@customElement({
  name: 'email-input',
  template: '<base-input type="email" ...$attrs>',
  capture: true
})
export class EmailInput {}

// Form field wrapper
@customElement({
  name: 'form-field',
  template: `
    <div class="form-field">
      <label if.bind="label">\${label}</label>
      <div class="input-wrapper">
        <div class="content-replaceable" replaceable part="input">
          <input ...$attrs>
        </div>
      </div>
      <div class="error" if.bind="error">\${error}</div>
    </div>
  `,
  capture: true
})
export class FormField {
  @bindable label: string;
  @bindable error: string;
}
```

Usage:
```html
<!-- Complex composition -->
<form-field label="Email Address" error.bind="emailError">
  <email-input au-slot="input" value.bind="email" placeholder="Enter email">
</form-field>
```

### Working with Third-party Components

```typescript
// Wrapper for third-party component
@customElement({
  name: 'material-input',
  template: '<mat-input ...$attrs>',
  capture: attr => !attr.startsWith('au-') // Exclude Aurelia-specific attributes
})
export class MaterialInput {
  @bindable value: string;
}
```

### Dynamic Component Creation

```typescript
export class DynamicForm {
  @bindable fieldConfigs: FieldConfig[];
  
  createField(config: FieldConfig) {
    return {
      component: config.component,
      props: config.props
    };
  }
}
```

```html
<div repeat.for="config of fieldConfigs">
  <compose 
    view-model.bind="config.component"
    ...$bindables="config.props">
  </compose>
</div>
```

## Common Patterns and Best Practices

### 1. Configuration Objects

```typescript
// Good: Use spreading for configuration
interface ButtonConfig {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  icon?: string;
}

const submitConfig: ButtonConfig = {
  variant: 'primary',
  size: 'medium',
  icon: 'save'
};
```

```html
<custom-button ...submitConfig>Submit</custom-button>
```

### 2. Conditional Properties

```typescript
// Good: Build objects conditionally
const inputProps = {
  value: userInput,
  ...(isRequired && { required: true }),
  ...(hasError && { 'aria-invalid': true }),
  ...(isDisabled && { disabled: true })
};
```

```html
<input ...$bindables="inputProps">
```

### 3. Proxy Objects for Transformation

```typescript
// Good: Transform data before spreading
const transformedUser = {
  displayName: user.fullName,
  email: user.contactInfo.email,
  isActive: user.status === 'active'
};
```

```html
<user-card ...transformedUser>
```

### 4. Default Values with Spreading

```typescript
// Good: Provide defaults
const defaultFieldProps = {
  size: 'medium',
  variant: 'outline'
};

const fieldProps = {
  ...defaultFieldProps,
  ...customProps
};
```

```html
<form-field ...$bindables="fieldProps">
```

This comprehensive documentation now covers all the advanced patterns and edge cases developers might encounter when working with Aurelia's spread operators.
