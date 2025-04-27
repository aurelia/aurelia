---
description: >-
  Learn how to define, use, and optimize local (inline) templates in Aurelia 2 to
  remove boilerplate and simplify your components.
---

# Local Templates (Inline Templates)

## Introduction

Most of the time, when working with templated views in Aurelia, you want to create reusable components. However, there are scenarios where reusability isn’t necessary or might cause unnecessary overhead. Local (inline) templates allow you to define a template as a "one-off" custom element, usable **only** within the scope of its parent view. This helps reduce boilerplate and fosters clear, localized organization of your code.

```html
<template as-custom-element="person-info">
  <bindable name="person"></bindable>
  <div>
    <label>Name:</label>
    <span>${person.name}</span>
  </div>
  <div>
    <label>Address:</label>
    <span>${person.address}</span>
  </div>
</template>

<h2>Sleuths</h2>
<person-info repeat.for="sleuth of sleuths" person.bind="sleuth"></person-info>

<h2>Nemeses</h2>
<person-info
  repeat.for="nemesis of nemeses"
  person.bind="nemesis"
></person-info>
```

By defining `<template as-custom-element="person-info">`, you create a local component named person-info, which can only be used in this file (my-app.html). It accepts a bindable property person (specified via the `<bindable>` tag). You can now reuse `<person-info>` repeatedly in this view without creating a separate file or global custom element.

```typescript
export class MyApp {
  public readonly sleuths: Person[] = [
    new Person("Byomkesh Bakshi", "66, Harrison Road"),
    new Person("Sherlock Holmes", "221b Baker Street"),
  ];
  public readonly nemeses: Person[] = [
    new Person("Anukul Guha", "unknown"),
    new Person("James Moriarty", "unknown"),
  ];
}

class Person {
  public constructor(public name: string, public address: string) {}
}
```

---

## Why Use Local Templates?

Local templates are similar to HTML-Only Custom Elements, with the major difference that local templates are scoped to the file that defines them. They are ideal for:

- One-off Components: When you need a snippet repeated multiple times in a single view but have no intention of reusing it elsewhere.
- Reducing Boilerplate: You don’t have to create a new .html and .ts file for every small piece of UI logic.
- Maintain High Cohesion: Local templates can be optimized for a specific context without worrying about external usage. They can contain deeply nested markup or references to local data without polluting your global component space.

That said, if you find your local template would be useful across multiple views or components, consider extracting it into a shared component.

---

## Syntax and Basic Usage

A local template must be declared with `<template as-custom-element="your-element-name">`. Inside this <template>, you can define:

- **Bindable Properties**: Using `<bindable name="property">` (and optionally attribute or mode).
- **Custom Markup**: The HTML that your inline custom element should render.
- **Data-Binding**: Standard Aurelia binding expressions.

Example:

```html
<template as-custom-element="my-inline-list">
  <bindable name="items"></bindable>
  <ul>
    <li repeat.for="item of items">${item}</li>
  </ul>
</template>

<my-inline-list items.bind="someArray"></my-inline-list>
```

### Bindable Tag Attributes

The `<bindable>` tag accepts:

- `name` (required): The property name in your view model.
- `attribute` (optional): The DOM attribute name. If unspecified, Aurelia will convert the property name to dash-case by default.
- `mode` (optional): The binding mode (e.g., oneWay, twoWay, or fromView). Defaults to one-way.

This is functionally equivalent to using the @bindable decorator in a separate .ts file.

---

## Local Templates vs. Regular Custom Elements

| Aspect              | Local Template                         | Regular/Global Custom Element                                          |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| **Scope**           | Only available in the file defining it | Available across the entire app (once imported/registered)             |
| **File Structure**  | No separate HTML/TS file required      | Typically has its own `.html` and `.ts` files                          |
| **Reusability**     | Intended for single-use scenarios      | Intended for wider reuse throughout the application                    |
| **Complexity**      | Lightweight, minimal boilerplate       | Potentially more complex (lifecycle hooks, dependency injection, etc.) |
| **Discoverability** | Less visible to future maintainers     | Easier to find and reuse (explicit file, naming, etc.)                 |

Use local templates when you’re sure they won’t need to be shared. If they grow larger or need to be referenced in multiple components, consider extracting them into a standard custom element.

---

## Advanced Usage Examples

### Nested Local Templates

A local template can be defined inside another local template, though this can become confusing if overused. For instance:

```html
<template as-custom-element="el-one">
  <template as-custom-element="inner-el">
    This is a nested local template.
  </template>
  Outer content.
  <inner-el></inner-el>
</template>

<el-one></el-one>
```

While Aurelia supports deeply nested local templates, it might be more readable to keep them at a reasonable nesting depth to avoid confusion.

### Reusing the Same Local Template Name in Different Files

Local templates are confined to their defining file or custom element. You can reuse the same local element name in different .html files without collisions:

```html
<!-- File: order-page.html -->
<template as-custom-element="order-details">
  <bindable name="order"></bindable>
  <!-- Markup for order details here -->
</template>

<!-- File: user-page.html -->
<template as-custom-element="order-details">
  <!-- Similarly named local template, but unique to user-page.html -->
</template>
```

These two `order-details` definitions do not conflict because each is scoped to its respective file.

---

## Common Pitfalls

### 1. Local Templates Must Be Hoisted

Local templates must be defined at the root of the file’s template:

```html
<foo-bar foo.bind="'John'"></foo-bar>

<template as-custom-element="foo-bar">
  <bindable name="foo"></bindable>
  <div>${foo}</div>
</template>
```

Placing `<template as-custom-element="foo-bar">` inside other tags (like `<div>`) will cause a compilation error.

### 2. Empty or Duplicate Names

You can’t define a local template without specifying a valid, unique name:

```html
<!-- This will fail. -->
<template as-custom-element=""> No name provided. </template>
```

Defining the same local template name more than once in the same file will also fail:

```html
<!-- This will fail as both are named foo-bar. -->
<template as-custom-element="foo-bar">One</template>
<template as-custom-element="foo-bar">Two</template>
```

### 3. Bindable Tags Belong at the Root

`<bindable>` tags need to be direct children of the `<template as-custom-element="...">`. They cannot be nested inside other HTML elements. For example, the following won’t compile:

```html
<template as-custom-element="foo-bar">
  <div>
    <bindable name="prop"></bindable>
  </div>
</template>
```

### 4. Don’t Create Empty Local Elements

If a custom element contains only local templates (and nothing else in the top-level template), Aurelia has nothing to render at runtime. This generally leads to errors and is typically not a valid use case.

---

## Performance Considerations

- **Compilation Overhead**: Local templates compile only within their defining scope. This can be more performant if you don’t need global registration for a small, repeated snippet.
- **Bundle Size**: By not creating multiple files or global custom elements, you avoid extra overhead in your build. However, the benefit is often marginal compared to other optimizations.
- **Nested Templates**: Deep nesting can become harder to maintain and debug. Keep local templates at a shallow depth unless there’s a compelling reason.

---

## Testing Local Templates

Even though local templates lack a dedicated .ts file, you can still test the parent component’s DOM interactions to ensure your inline template works as expected. For example, using a testing tool like Jest or Cypress, you would:

1. Render the parent component in a test environment.
2. Query or select the local element(s) (e.g., `<person-info>`, etc.).
3. Check that it renders and behaves correctly (bindable props, textual content, etc.).

Since the local template is compiled within the parent context, your tests just interact with the parent view’s rendered DOM.
