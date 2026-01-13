---
"@aurelia/runtime-html": minor
"@aurelia/template-compiler": minor
"@aurelia/router": patch
"@aurelia/validation-html": patch
"@aurelia/ui-virtualization": patch
---

**BREAKING CHANGE:** Replace `primary` on bindable definitions with `defaultProperty` on custom attribute definitions.

**Before (no longer supported):**

```typescript
@customAttribute('tooltip')
export class TooltipAttribute {
  @bindable({ primary: true }) message: string;
  @bindable position: string;
}
```

**After:**

```typescript
@customAttribute({ name: 'tooltip', defaultProperty: 'message' })
export class TooltipAttribute {
  @bindable message: string;
  @bindable position: string;
}
```

If `defaultProperty` is not specified, it defaults to `'value'`.

### Migration

For custom attributes that used `@bindable({ primary: true })`:

1. Remove `primary: true` from the `@bindable` decorator
2. Add `defaultProperty: 'propertyName'` to the `@customAttribute` decorator

For attributes using `CustomAttribute.define()`:

```typescript
// Before
CustomAttribute.define({
  name: 'my-attr',
  bindables: { prop: { primary: true } }
}, MyAttr);

// After
CustomAttribute.define({
  name: 'my-attr',
  defaultProperty: 'prop',
  bindables: { prop: {} }
}, MyAttr);
```
