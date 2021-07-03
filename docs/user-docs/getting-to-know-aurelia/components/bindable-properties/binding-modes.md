---
description: Bindable properties can work in different modes.
---

# Binding modes

Bindable properties support many different binding modes determining the direction the data is bound in as well as how it is bound.

## One way binding

By default, bindable properties will be one-way binding. This means values flow into your component, but not back out of it \(hence the name, one way\).

Specifying a `bindable` property without any configuration will result in it being one-way. You can also explicitly specify the binding mode.

```text
import { bindable, BindingMode } from 'aurelia';

export class Loader {
    @bindable({ mode: BindingMode.oneWay })
}
```

## Two way binding

Unlike the default, the two-way binding mode allows data to flow in both directions. If the value is changed with your component it flows back out and so forth.

```text
import { bindable, BindingMode } from 'aurelia';

export class Loader {
    @bindable({ mode: BindingMode.twoWay})
}
```

