---
"@aurelia/runtime-html": major
"@aurelia/template-compiler": major
---

**BREAKING CHANGE:** Remove `defaultBindingMode` from custom attribute definitions.

This property was originally designed in Aurelia 1 to set the binding mode for the implicit `value` property of single-bindable custom attributes. In Aurelia 2, its behavior was unintentionally expanded to apply to all bindables on a custom attribute, which was never the intended design.

To configure binding modes, use the `mode` option on individual `@bindable` decorators instead:

```typescript
// Before (no longer supported)
@customAttribute({
  name: 'my-attr',
  defaultBindingMode: BindingMode.twoWay,
  bindables: ['value1', 'value2']
})
export class MyAttr { }

// After
@customAttribute({ name: 'my-attr' })
export class MyAttr {
  @bindable({ mode: BindingMode.twoWay }) value1: string;
  @bindable({ mode: BindingMode.twoWay }) value2: string;
}
```

For custom attributes without explicit bindables (using the implicit `value` property), declare the `value` bindable explicitly if you need a non-default binding mode:

```typescript
// Before
@customAttribute({
  name: 'my-attr',
  defaultBindingMode: BindingMode.twoWay
})
export class MyAttr {
  value: string; // implicit bindable with twoWay mode
}

// After
@customAttribute({ name: 'my-attr' })
export class MyAttr {
  @bindable({ mode: BindingMode.twoWay }) value: string;
}
```
