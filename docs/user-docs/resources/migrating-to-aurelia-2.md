# Migrating to Aurelia 2

Introduction Placeholder...

## BREAKING CHANGES

### Scope selection

In v2, when trying to bind with a non-existent property, the closest boundary scope will be selected, instead of the immediate scope of the binding \(v1 behavior\). Thanks [@Sayan](https://github.com/sayan751) for this important change.

TODO: examples + pros & cons...

### Internal binding property `observeProperty` has been renamed to `observe`

In v1, if you happen to use `.observeProperty` method from bindings in your application/library, then change it to `observe` instead. The parameters of the signature remain the same.

### Enhance API changes:

In v1, `enhance` method on an `Aurelia` instance has the signature:

```typescript
class Aurelia {
  ...

  enhance(elementOrConfig: Element | IEnhancementConfig): View;
}
```

In v2, `enhance` method on an `Aurelia` instance has the signature:

```typescript
interface IAurelia {
  ...

  enhance(enhancementConfig: IEnhancementConfig): IEnhancedView;
}
```

Parent container and resources can be specified through this config.

### Call binding \(some-prop.call="..."\)

* Call binding no longer assign properties of the first argument pass to the call to the calling override context. This is unreasonably dynamic and could result in hard-to-understand templates. Example:

```typescript
export class MyElement {
  onChange;

  onInternalButtonClick() {
    this.onChange({ value: this.value });
  }
}
```

v1:

```markup
<my-element on-change.call="elValue = value">
```

v2:

```markup
<my-element on-change.call="elValue = $event.value">
```

### If attribute \(if.bind="..."\)

* Primary property of `If` has been renamed from `condition` to `value`. If you are using `if.bind`, you are not affected. If you are using the multi prop binding syntax, that the template looks like this:

```markup
<div if="condition.bind: yes">
```

Change it to:

```markup
<div if="value.bind: yes">
```

## Plugins:

### Web-Components plugn

* Remove automatic au- prefix
* Remove auto-conversion of Aurelia element -&gt; WC element. Applications need to explicitly define this. This should make mix-matching & controlling things easier.

