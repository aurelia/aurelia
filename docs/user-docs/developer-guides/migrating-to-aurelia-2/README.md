# Migrating to Aurelia 2

Aurelia 2 is a complete rewrite of Aurelia that shares many of the same loved and familiar features of Aurelia 1. Understandably, in the spirit of progress, not everything is the same. In this section, we are going to guide you through what has changed and how you can migrate over your Aurelia 1 applications to Aurelia 2.

## COMPAT PACKAGE

An quickest way to get an application in v1 up an running in v2 is to include the compat package. It can be done via 2 steps:

1. installing the compat package via
  ```
  npm install @aurelia/compat-v1
  ```
2. include the compat package into your app:
  ```ts
  import { compatRegistration } from '@aurelia/compat-v1';

  ...
  Aurelia
    .register(compatRegistration, ...)
    .app(...)
    .start()
  ```

## BREAKING CHANGES

### Scope selection

In v2, when trying to bind with a non-existent property, the closest boundary scope will be selected, instead of the immediate scope of the binding (v1 behavior).

### Internal binding property `observeProperty` has been renamed to `observe`

In v1, if you happen to use `.observeProperty` method from bindings in your application/library, then change it to `observe` instead. The parameters of the signature remain the same.

### Internal binding property `sourceExpression` has been renamed to `ast`

In v1, if you happen to use `.sourceExpression` property from bindings in your application/library, then change it to `ast` instead. The type of the property remains the same.

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

### Call binding (some-prop.call="...")

The call binding no longer assigns properties of the first argument pass to the call to the calling override context. This is unreasonably dynamic and could result in hard-to-understand templates.

In Aurelia 1, you would have used call bindings like this:

```typescript
export class MyElement {
  onChange;

  onInternalButtonClick() {
    this.onChange({ value: this.value });
  }
}
```

```markup
<my-element on-change.call="propertyChanged(value)">
```

In Aurelia 2, the property name is now on the `$event` property passed to the callback. It's a minor change, but you now do this instead:

```markup
<my-element on-change.call="propertyChanged($event.value)">
```

### If attribute (if.bind="...")

* The primary property of `If` has been renamed from `condition` to `value`. If you are using `if.bind`, you are not affected. If you are using the multi prop binding syntax, the template looks like this:

```markup
<div if="condition.bind: yes">
```

Change it to:

```markup
<div if="value.bind: yes">
```

## General changes

* Templates no longer need to have `<template>` tags as the start and ending tags. Templates can be pure HTML with enhanced Aurelia markup but `<template>` doesn't need to be explicitly defined.
* `PLATFORM.moduleName` is gone. This was to address a limitation in Aurelia 1. Aurelia 2 now works well with all bundlers and does not require the addition of this code to use code splitting or tell the bundler where template code is.
* Better intellisense support for TypeScript applications. Using the new injection interfaces, you can now inject strongly typed Aurelia packages such as Fetch Client, Router or Internationalization. These packages are prefixed with an "I" such as `IHttpClient`, `IRouter` and so on.

## Plugins:

### Web-Components plugin

* Remove automatic au- prefix
* Remove auto-conversion of Aurelia element -> WC element. Applications need to explicitly define this. This should make mix-matching & controlling things easier.
