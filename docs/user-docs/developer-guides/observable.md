---
description: The basics of the observable plugin for Aurelia.
---

# Observable

{% hint style="info" %}
**Status:** Experimental

{% endhint %}

## Introduction

This article covers the observable plugin for Aurelia. This plugin is created for seamless integration with observable, with the most well known implementation is [Rxjs](https://rxjs.dev/). The plugin enables a simple stream subscription in the template with a `$` character at the end of the variable names.

## Installing The Plugin

The plugin can be installed by registering the configuration export from `@aurelia/observable` with an Aurelia app:

```typescript
import { ObservableConfiguration } from '@aurelia/observable';
import { Aurelia } from 'aurelia';

Aurelia.register(ObservableConfiguration).app(MyApp).start();
```

The `ObservableConfiguration` will register:

- a `subscribe` binding command
- a `subscribe` binding behavior
so to handle stream subscription in the template. They both will scan their corresponding expressions and make appropriate adjustment to ensure that the binding created is aware of `Observable` subscription.

## Usages

1. property binding with a subscribe command

```html
<div textcontent.subscribe="`${obs$.x} ${obs$.y} ${obs$.i}`"></div>
```

2. text content binding with subscribe binding behavior

```html
<strong>${obs$.x & subscribe} ${obs$.y & subscribe} ${obs$.i & subscribe}</strong>
```

## Notes

It's not possible to combine `subscribe` binding behavior with the expressions of a `.for` command, which means the following won't work as expected:

```html
<div repeat.for="item of item$ & subscribe">...
```

Instead, do:

```html
<let items.bind="items$ & subscribe">
<div repeat.for="item of items">...
```
