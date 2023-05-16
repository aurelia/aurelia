# Binding behaviors

Binding behaviors are a category of view resource, just like value converters, custom attributes and custom elements. Binding behaviors are most like [value converters](value-converters.md) in that you use them declaratively in binding expressions to affect the binding.

The primary difference between a binding behavior and a value converter is _binding behaviors have full access to the binding instance, throughout it's lifecycle_. Contrast this with a value converter which only has the ability to intercept values passing from the model to the view and visa versa.

The additional "access" afforded to binding behaviors gives them the ability to change the behavior of the binding, enabling a lot of interesting scenarios which you'll see below.

## Throttle

Aurelia ships with a handful of behaviors out of the box to enable common scenarios. The first is the throttle binding behavior which limits the rate at which the view-model is updated in two-way bindings or the rate at which the view is updated in to-view binding scenarios.

By default `throttle` will only allow updates every 200ms. You can customize the rate of course. Here are a few examples.

**Updating a property, at most, every 200ms**

HTML

```html
<input type="text" value.bind="query & throttle">
```

The first thing you probably noticed in the example above is the `&` symbol, which is used to declare binding behavior expressions. Binding behavior expressions use the same syntax pattern as value converter expressions:

* Binding behaviors can accept arguments: `firstName & myBehavior:arg1:arg2:arg3`
* A binding expression can contain multiple binding behaviors: `firstName & behavior1 & behavior2:arg1`.
* Binding expressions can also include a combination of value converters and binding behaviors: `${foo | upperCase | truncate:3 & throttle & anotherBehavior:arg1:arg2}`.

Here's another example using `throttle`, demonstrating the ability to pass arguments to the binding behavior:

**Updating a property, at most, every 850ms**

```html
<input type="text" value.bind="query & throttle:850">
```

The throttle behavior is particularly useful when binding events to methods on your view-model. Here's an example with the `mousemove` event:

**Handling an event, at most, every 200ms**

```html
<div mousemove.delegate="mouseMove($event) & throttle"></div>
```

### Flush pending throttled calls

Sometimes it's desirable to forcefully run the throttled update, so that the application syncs the latest values. This can happen in a form, when a user previously was typing into a throttled form field, and hit tab key to go to the next field, as an example.
The `throttle` binding behavior supports this scenario via signal. These signals can be added via the 2nd parameter, like the following example:

{% code title="my-app.html" lineNumbers="true" overflow="wrap" %}
```html
<input value.bind="value & throttle :200 :`finishTyping`" blur.trigger="signaler.dispatchSignal('finishTyping')">
<!-- or it can be a list of signals -->
<input value.bind="value & throttle :200 :[`finishTyping`, `newUpdate`]">
```
{% endcode %}

## Debounce

The debounce binding behavior is another rate-limiting binding behavior. Debounce prevents the binding from being updated until a specified interval has passed without any changes.

A common use case is a search input that triggers searching automatically. You wouldn't want to make a search API on every change (every keystroke). It's more efficient to wait until the user has paused typing to invoke the search logic.

**Update after typing stopped for 200ms**

```html
<input type="text" value.bind="query & debounce">
```

**Update after typing stopped for 850ms**

```html
<input type="text" value.bind="query & debounce:850">
```

Like throttle, the `debounce` binding behavior shines in event binding.

Here's another example with the `mousemove` event:

**Call mouseMove after mouse stopped moving for 500ms**

```html
<div mousemove.delegate="mouseMove($event) & debounce:500"></div>
```

### Flush pending debounced calls

Sometimes it's desirable to forcefully run the throttled update, so that the application syncs the latest values. This can happen in a form, when a user previously was typing into a throttled form field, and hit tab key to go to the next field, as an example.
Similar to the [`throttle` binding behavior](#throttle), The `debounce` binding behavior supports this scenario via signal. These signals can be added via the 2nd parameter, like the following example:

{% code title="my-app.html" lineNumbers="true" overflow="wrap" %}
```html
<input value.bind="value & debounce :200 :`finishTyping`" blur.trigger="signaler.dispatchSignal('finishTyping')">
<!-- or it can be a list of signals -->
<input value.bind="value & debounce :200 :[`finishTyping`, `newUpdate`]">
```
{% endcode %}

## UpdateTrigger

Update trigger allows you to override the input events that cause the element's value to be written to the view-model. The default events are `change` and `input`.

Here's how you would tell the binding to only update the model on `blur`:

**Update on blur**

```html
<input value.bind="firstName & updateTrigger:'blur'>  
```

Multiple events are supported:

**Update with multiple events**

```html
<input value.bind="firstName & updateTrigger:'blur':'paste'>
```

## **Signal**

The signal binding behavior enables you to "signal" the binding to refresh. This is especially useful when a binding result is impacted by global changes outside \*\*\*\* the observation path.

For example, if you have a "translate" value converter that converts a key to a localized string- eg `${'greeting-key' | translate}` and your site allows users to change the current language, how would you refresh the bindings when that happens?

Another example is a value converter that uses the current time to convert a record's datetime to a "time ago" value: `posted ${postDateTime | timeAgo}`. The moment this binding expression is evaluated it will correctly result in `posted a minute ago`. As time passes, it will eventually become inaccurate. How can we refresh this binding periodically so that it correctly displays `5 minutes ago`, then `15 minutes ago`, `an hour ago`, etc?

Here's how you would accomplish this using the `signal` binding behavior:

**Using a Signal**

```html
posted ${postDateTime | timeAgo & signal:'my-signal'}
```

In the binding expression above, we're using the `signal` binding behavior _to assign the binding a "signal name" of `my-signal`._ Signal names are arbitrary. You can give multiple bindings the same signal name if you want to signal multiple bindings simultaneously.

Here's how we can use the `ISignaler` to signal the bindings periodically:

**Signaling Bindings**

```typescript
import { ISignaler } from 'aurelia';
  
export class MyApp {
  constructor(@ISignaler readonly signaler: ISignaler) {
    setInterval(() => signaler.signal('my-signal'), 5000);
  }
}
```

## oneTime

With the `oneTime` binding behavior you can specify that string interpolated bindings should happen once. Simply write:

**One-time String Interpolation**

```html
<span>${foo & oneTime}</span>
```

This is an important feature to expose. One-time bindings are the most efficient type of binding because they don't incur any property observation overhead.

There are also binding behaviors for `toView` and `twoWay` which you could use like this:

**To-view and two-way binding behaviours**

```html
<input value.bind="foo & toView">
<input value.to-view="foo">
  
<input value.bind="foo & twoWay">
<input value.two-way="foo">  
```

{% hint style="warning" %}
The casing for binding modes is different depending on whether they appear as a **binding command** or as a **binding behavior**. Because HTML is case-insensitive, binding commands cannot use capitals. Thus, the binding modes, when specified in this place, use lowercase, dashed names. However, when used within a binding expression as a binding behavior, they must not use a dash because that is not a valid symbol for variable names in JavaScript. So, in this case, camel casing is used.
{% endhint %}

## Self

With the `self` binding behavior, you can specify that the event handler will only respond to the target to which the listener was attached, not its descendants.

For example, in the following markup

**Self-binding behavior**

```html
<panel>
  <header mousedown.delegate='onMouseDown($event)' ref='header'>
    <button>Settings</button>
    <button>Close</button>
  </header>
</panel>
```

`onMouseDown` is your event handler, and it will be called not only when user `mousedown` on header element, but also all elements inside it, which in this case are the buttons `settings` and `close`. However, this is not always desired behavior. Sometimes you want the component only to react when user clicks on the header itself, not the buttons. To achieve this, `onMouseDown` method needs some modification:

**Handler without self-binding behavior**

```typescript
// inside component's view model class
onMouseDown(event) {
  // if mousedown on the header's descendants. Do nothing
  if (event.target !== header) return;
  // mousedown on header, start listening for mousemove to drag the panel
  // ...
}
```

This works, but now business/ component logic is mixed up with DOM event handling, which is not necessary. Using `self` binding behavior can help you achieve the same goal without filling up your methods with unnecessary code:

**Using self-binding behavior**

```html
<panel>
  <header mousedown.delegate='onMouseDown($event) & self'>
    <button class='settings'></button>
    <button class='close'></button>
  </header>
</panel>
```

**Using self-binding behavior**

```typescript
// inside component's view model class
onMouseDown(event) {
  // No need to perform check, as the binding behavior will ensure check
  // if (event.target !== header) return;
  // mousedown on header, start listening for mousemove to drag the panel
  // ...
}
```

## Custom binding behaviors

You can build custom binding behaviors just like you can build value converters. Instead of `toView` and `fromView` methods you'll create `bind(binding, scope, [...args])` and `unbind(binding, scope)` methods. In the bind method you'll add your behavior to the binding and in the unbind method you should clean up whatever you did in the bind method to restore the binding instance to it's original state. The `binding` argument is the binding instance whose behavior you want to change. It's an implementation of the `Binding` interface. The `scope` argument is the binding's data context. It provides access to the model the binding will be bound to via it's `bindingContext` and `overrideContext` properties.

Here's a custom binding behavior that calls a method on your view model each time the binding's `updateSource` / `updateTarget` and `callSource` methods are invoked.

```typescript
  const interceptMethods = ['updateTarget', 'updateSource', 'callSource'];
  export class InterceptBindingBehavior {
    bind(scope, binding) {
      let i = interceptMethods.length;
      while (i--) {
        let methodName = interceptMethods[i];
        let method = binding[method];
        if (!method) {
          continue;
        }
        binding[`intercepted-${methodName}`] = method;
        binding[methodName] = method.bind(binding);
      }
    }
  
    unbind(scope, binding) {
      let i = interceptMethods.length;
      while (i--) {
        let methodName = interceptMethods[i];
        if (!binding[methodName]) {
          continue;
        }
        binding[methodName] = binding[`intercepted-${methodName}`];
        binding[`intercepted-${methodName}`] = null;
      }
    }
  }
  
```

```html
<import from="./intercept-binding-behavior"></import>

<div mousemove.delegate="mouseMove($event) & intercept:myFunc"></div>

<input value.bind="foo & intercept:myFunc">
```
