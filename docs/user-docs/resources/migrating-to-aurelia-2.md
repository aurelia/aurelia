# Migrating to Aurelia 2

Introduction Placeholder...

## BREAKING CHANGES

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
