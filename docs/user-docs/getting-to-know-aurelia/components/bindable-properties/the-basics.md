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

```text
<loader loading="true"></loader>
```

You can also bind to the value:

```text
<loader loading.bind="loadingVal"></loader>
```

## Binding modes

To change how your bindable works, the binding mode can be changed to denote it being oneWay, twoWay and so forth. Head on over to the binding modes section to learn more about binding modes.

{% page-ref page="binding-modes.md" %}



