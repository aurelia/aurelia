---
description: Bind an element's focus state with Aurelia's built-in focus custom attribute.
---

# `focus` custom attribute

`focus` is a built-in custom attribute that lets you bind an element’s focus state to a view-model property.

By default it’s **two-way**:

- setting the property focuses/blurs the element
- focusing/blurring the element updates the property

## Basic usage (two-way)

```html
<input focus.bind="isFocused">

<button click.trigger="isFocused = true">Focus the input</button>
<button click.trigger="isFocused = false">Blur the input</button>
```

```ts
export class MyPage {
  public isFocused = false;
}
```

## One-way focus (recommended for “open a thing, focus an input”)

Two-way focus can be surprising if you don’t want a `blur` to change your state. In that case, make it one-way:

```html
<input focus.to-view="shouldFocusSearch">
```

Now the input won’t write back to `shouldFocusSearch` when it blurs.

## Common pattern: focus when showing a panel

```html
<button click.trigger="isOpen = !isOpen">Toggle</button>

<div if.bind="isOpen">
  <input focus.to-view="isOpen" placeholder="Type to search...">
  <!-- Focuses when opened; does not auto-close on blur -->
</div>
```

## Notes

- The target must be focusable. For non-input elements, you may need `tabindex="0"`.
- Focusing can only happen once the element is connected to the document; `focus` handles this automatically (it will apply focus after attach if needed).
