# Observing property changes with @observable

Unlike the `@watch` decorator, the `@observable` decorator allows you to decorate properties in a component and then optionally call a change callback when the value changes. It works quite similar to the `@bindable` property.

By convention, the change handler is a method whose name is composed of the property\_name and the literal value 'Changed'. For example, if you decorate the property `color` with `@observable`, you have to define a method named `colorChanged()` to be the change handler.

This is what a basic observable would look like using conventions:

```typescript
import { observable } from '@aurelia/runtime';

export class Car {
  @observable color = 'blue';

  colorChanged(newValue, oldValue) {
    // this will fire whenever the 'color' property changes
  }
}
```

If you prefer, can also put the `@observable` decorator on classes:

```typescript
import { observable } from '@aurelia/runtime';

@observable('color')
@observable({ name: 'speed', callback: 'speedCallback' })
export class Car {
  color = 'blue';
  speed = 300;

  colorChanged(newValue, oldValue) {
    // this will fire whenever the 'color' property changes
  }

  speedCallback(newValue, oldValue) {
    // this will fire whenever the 'speed' property changes
  }
}
```

{% hint style="info" %}
You do not have to check if `newValue` and `oldValue` are different. The change handler will not be called if you assign a value that the property already has.
{% endhint %}

## Specifying a different change callback

If you do not want to use the convention, you can define the callback name for the change handler by setting the `callback` property of the `@observable` decorator:

```typescript
import { observable } from '@aurelia/runtime';

export class Car {
  @observable({ callback: 'myCallback' })
  color = 'blue';

  myCallback(newValue, oldValue) {
    // this will fire whenever the 'color' property changes
  }
}
```



