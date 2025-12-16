---
description: Change the binding context for a section of a template using Aurelia's built-in with template controller.
---

# `with.bind`

`with` is a **template controller** that creates a new binding scope for its content. It’s useful when you want to “zoom in” on an object so you don’t have to repeat a prefix like `user.` everywhere.

## Basic usage

```html
<template with.bind="user">
  <h2>${firstName} ${lastName}</h2>
  <p>${email}</p>
</template>
```

The inner template’s binding context becomes `user`, so `firstName` resolves as `user.firstName`, etc.

You can also put `with.bind` on a real element:

```html
<section with.bind="user">
  <h2>${firstName} ${lastName}</h2>
</section>
```

## “Shape” a small context object

Sometimes you don’t want to pass the whole object through — just a few values (or renamed values):

```html
<template with.bind="{ profile: user.profile, canEdit: permissions.admin }">
  <user-profile profile.bind="profile"></user-profile>
  <button disabled.bind="!canEdit">Edit</button>
</template>
```

## Updates and lifecycle

- `with` does **not** add/remove DOM like `if` or `repeat`.
- When the `with` value changes, Aurelia **re-binds** the existing view to the new scope (it does not recreate the view).

## Gotchas

- `with` expects an **object**. If your value can be `null`/`undefined`, guard it:

  ```html
  <template with.bind="user || {}">
    ${firstName}
  </template>
  ```

- Prefer `<let>` when you only need a couple of local aliases and don’t need to re-scope a whole block.

