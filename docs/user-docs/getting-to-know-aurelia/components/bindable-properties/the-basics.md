---
description: The basics of using the @bindable decorator
---

# The basics

## A basic example using @bindable

Bindable properties on components are denoted by the `@bindable` decorator on the view model of a component.

{% tabs %}
{% tab title="loader.ts" %}
```typescript
import { bindable } from 'aurelia';

export class Loader {
    @bindable loading = false;
}
```
{% endtab %}
{% endtabs %}

This will allow our component to be passed in values. Our specified bindable property here is called `loading` and can be used like this:

```html
<loader loading.bind="true"></loader>
```

In the example above, we are binding the boolean literal `true` to the `loading` property.

Instead of literal, you can also bind another property (`loadingVal` in the following example) to the `loading` property.

```html
<loader loading.bind="loadingVal"></loader>
```

You can also bind values without the `.bind` part, as can be seen the following example.

```html
<loader loading="true"></loader>
```

However, there is a subtle difference. In this case, Aurelia considers the attribute value as a string. Thus, instead of a boolean `true` value the string `'true'` gets bound to the `loading` property. This might cause some unexpected issues. However, you can apply coercion using a [bindable setter](bindable-setter.md) or [defining the bindable datatype explicitly](bindable-coercion.md).

## Attribute naming

As can be seen in the examples above, the `@bindable`s defined inside a custom element can be used as an HTML attribute while using the custom element. For example, the `@bindable loading` property is used as the attribute `loading.bind` in the view.

By convention the property name is converted to kebab-case and used as the attribute name. For example, a bindable property named `fooBar` will be converted to `foo-bar` attribute.

You can override this using the `attribute` property in the bindable definition, as shown in the following example.

{% tabs %}
{% tab title="loader.ts" %}
```typescript
import { bindable } from 'aurelia';

export class MyEL {
    @bindable({attribute: 'foo-bar'})
    public fizzBuzz: string;
}
```
{% endtab %}
{% endtabs %}

## Binding modes

To change how your bindable works, the binding mode can be changed to denote it being oneWay, twoWay and so forth. Head on over to the binding modes section to learn more about binding modes.

{% page-ref page="binding-modes.md" %}



