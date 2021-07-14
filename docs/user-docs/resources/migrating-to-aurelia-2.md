# Migrating to Aurelia 2

Introduction Placeholder...

## BREAKING CHANGES

### Scope selection

In v2, when trying to bind with a non-existent property, the closest boundary scope will be selected, instead of the immediate scope of the binding (v1 behavior). Thanks [@Sayan](https://github.com/sayan751) for this important change.

TODO: examples + pros & cons...

### Call binding \(some-prop.call="..."\)

- Call binding no longer assign properties of the first argument pass to the call to the calling override context. This is unreasonably dynamic and could result in hard-to-understand templates. Example:

```ts
export class MyElement {
  onChange;

  onInternalButtonClick() {
    this.onChange({ value: this.value });
  }
}
```

v1:
```html
<my-element on-change.call="elValue = value">
```

v2:
```html
<my-element on-change.call="elValue = $event.value">
```

### If attribute \(if.bind="..."\)

- Primary property of `If` has been renamed from `condition` to `value`. If you are using `if.bind`, you are not affected. If you are using the multi prop binding syntax, that the template looks like this:

```html
<div if="condition.bind: yes">
```

Change it to:

```html
<div if="value.bind: yes">
```
