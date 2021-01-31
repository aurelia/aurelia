---
description: Change what is rendered or shown based on conditions in your code.
---

# Conditional Rendering

Have you ever needed to hide or show part of a UI based on some condition? Well, that's what conditional rendering is all about! Let's dig in and see how it works.

{% hint style="success" %}
**Here's what you'll learn...**

* Adding and removing DOM with `if`/`else`.
* Hiding and showing DOM with `show`/`hide`.
* Choosing between `if`/`else` and `show`/`hide`.
{% endhint %}

## if/else

Aurelia has two major tools for conditional display: `if` and `show`. Let's look at `if` first. Here's a basic "Hello World" that asks the user if they want to greet the world:

{% code title="my-app.html" %}
```markup
<label for="greet">Would you like me to greet the world?</label>
<input type="checkbox" id="greet" checked.bind="greet">
<div if.bind="greet">
  Hello, World!
</div>
```
{% endcode %}

If the value of `greet` is `true`, then the `div` with the message "Hello, World!" will be inserted into the DOM. If it's `false`, the `div` will be removed \(or never added in the first place\).

Conditionals can also be `one-time` bound, so that parts of the template are fixed once they're instantiated:

{% tabs %}
{% tab title="my-app.html" %}
```markup
<div if.one-time="greet">
  Hello, World!
</div>
<div if.one-time="!greet">
  Some other time.
</div>
```
{% endtab %}

{% tab title="my-app.js" %}
```javascript
export class MyApp {
  greet = (Math.random() > 0.5);
}
```
{% endtab %}
{% endtabs %}

There's a 50-50 chance that we'll greet the world, or put it off until later. Once the page loads, this is fixed, because the data is `one-time` bound.

Complementing `if`, there is `else`. Used in conjunction with `if`, `else` will render its content when `if` does not evaluate to `true`.

{% code title="my-app.html" %}
```markup
<div if.bind="showMessage">
  <span>${message}</span>
</div>
<div else>
  <span>Nothing to see here</span>
</div>
```
{% endcode %}

Elements using the `else` template modifier must follow an `if` bound element to make contextual sense and function properly.

### Caching View Instances

{% hint style="danger" %}
**Not Yet Implemented in Aurelia 2**
{% endhint %}

By default, `if` caches the underlying view instance. Although the element is being removed from the DOM and the component goes through the `detached` and `unbind` lifecyle events, its instance is kept in memory for further condition changes. Therefore, when the element is hidden and then shown again, `if` does not need to initialize the component again.

You can opt-out this default behavior by setting the `cache` binding of the `if` attribute explicitly. This is especially useful when using `if` on custom elements where initializing them on every appearance is crucial.

{% code title="my-app.html" %}
```markup
<div if="condition.bind: showMessage; cache: false">
  <span>${message}</span>
</div>
```
{% endcode %}

## show/hide

{% hint style="danger" %}
**Note Yet Implemented in Aurelia 2**
{% endhint %}

The difference between `if` and `show` is that `if` removes the element entirely from the DOM, and `show` toggles the `aurelia-hide` CSS class which controls the element's visibility only.

This difference is subtle but important in terms of speed and usability. When the state changes in `if`, the template and all of its children are deleted from the DOM, which is computationally expensive if it's being done over and over. However, if `show` is being used for a very large template, such as a dashboard containing thousands of elements with their own bound data, then keeping those elements loaded-but-hidden may not end up being a useful approach.

If we just want to hide the element from view instead of removing it from the DOM completely, we should use `show` instead of `if`. Let's look at the same basic "Hello World" from above that asks the user if they want to greet the world, this time with `show` instead of `if`.

{% code title="my-app.html" %}
```markup
<label for="greet">Would you like me to greet the world?</label>
<input type="checkbox" id="greet" checked.bind="greet">
<div show.bind="greet">
  Hello, World!
</div>
```
{% endcode %}

When unchecked, our "Hello World" div will have the `aurelia-hide` class, which sets `display: none` if you're using Aurelia's default CSS. However, if you don't want to do that, you can also define your own CSS rules that treat `aurelia-hide` differently, like setting `visibility: none` or `height: 0px`.

What about the scenario above with `one-time`? Should we use `show.one-time` in the same way? If we think about what `show` does, it doesn't really make sense. We're saying we want a CSS class to be applied that will hide an element, and that it will never change. In most cases, we want `if` to refuse to create an element we'll never use in the first place.

## switch

To deal with conditional rendering Aurelia also provides the `switch` template controller. It behaves like `if/else` in terms of that it does detach the elements from DOM, when the condition does not satisfy. The difference being is that it brings the intrinsic flexibility and semantics of using a `switch` statement with it.

A typical use-case of `switch` involves dealing with enums. For example, let's consider the following `Status` enum.

{% code title="Status.ts" %}
```typescript
const enum Status {
  received   = 'received',
  processing = 'processing',
  dispatched = 'dispatched',
  delivered  = 'delivered',
  unknown    = 'unknown',
}
```
{% endcode %}

When tasked with displaying a specific text for a specific member \(status\) of the `Status` enum, with only `if` bind at our disposal, we may end up with the following markup.

{% code title="my-app.html" %}
```markup
<span if.bind="status === 'received'">Order received.</span>
<span if.bind="status === 'processing'">Processing your order.</span>
<span if.bind="status === 'dispatched'">On the way.</span>
<span if.bind="status === 'delivered'">Delivered.</span>
```
{% endcode %}

Also if there are new statuses added to the `Status` enum in future, this markup will end up more verbose, and possibly difficult to understand. Moreover, the semantics of the code might as well be somewhat lost. With the usage of the `switch/case` template controller, the above markup can be written as following.

{% code title="my-app.html" %}
```markup
<template switch.bind="status">
  <span case="received">Order received.</span>
  <span case="processing">Processing your order.</span>
  <span case="dispatched">On the way.</span>
  <span case="delivered">Delivered.</span>
</template>
```
{% endcode %}

This behaves in similar fashion a `switch` in JavaScript behaves. That is it renders the first match, and ignores the rest. For example if the `status` has a value `Status.processing`, it will render `<span>Processing your order.</span>`. Note that it intrinsically avoids matching the following `case`s after the first match and consequently binding and rendering those elements. That is the basic and typical use-case of the `switch/case` template controllers. Now let's see some other features of this as well.

### default-case

The `switch` also supports `default-case`; i.e. this "case" will be matched, if nothing else is matched.

{% code title="my-app.html" %}
```markup
<template switch.bind="status">
  <span case="received">Order received.</span>
  <span case="processing">Processing your order.</span>
  <span case="dispatched">On the way.</span>
  <span default-case>Unknown.</span>
</template>
```
{% endcode %}

With this markup, if the `status` is set to `Status.unknown` or `Status.delivered`, `<span>Unknown.</span>` will be rendered.

### multi-case

It is possible to map a single element to multiple cases, by binding an array to the `case`.

{% code title="my-app.html" %}
```markup
<template switch.bind="status">
  <span case.bind="['received', 'processing']">Order received.</span>
  <span case="dispatched">On the way.</span>
  <span case="delivered">Delivered.</span>
</template>
```
{% endcode %}

For either of `Status.received` or `Status.processing`, it will render `<span>Order received.</span>`. A JavaScript equivalent of this would be the following.

{% code title="my-app.ts" %}
```typescript
switch(status) {
  case Status.received:
  case Status.processing:
    return 'Order received.';
  case Status.dispatched:
    return 'On the way.';
  case Status.delivered:
    return 'Delivered.';
}
```
{% endcode %}

{% hint style="info" %}
When an array is bound to the `case`, the value of the `switch` is matched against the items in the array and not with the array reference.
{% endhint %}

### fall-through

It is also possible to have the switch-case fallthrough in the markup, where you don't want to break after a case has been executed. This means something like this.

{% code title="my-app.ts" %}
```typescript
let ret: string = "";
switch(status) {
  case Status.received:
    ret = 'Order received.';
  case Status.processing:
    ret =`${ret}, Order received.`;
    break;
  case Status.dispatched:
    ret = 'On the way.';
    break;
  case Status.delivered:
    ret = 'Delivered.';
    break;
}
return ret;
```
{% endcode %}

Aurelia equivalent of this will be the following.

{% code title="my-app.html" %}
```markup
<template switch.bind="status">
  <span case="value.bind:'received'; fall-through.bind: true">Order received.</span>
  <span case="processing">Processing your order.</span>
  <span case="dispatched">On the way.</span>
  <span case="delivered">Delivered.</span>
</template>
```
{% endcode %}

Assuming that `status` is set to `Status.received`, it will end up the rendering the first two `<span>`s.

{% hint style="info" %}
* By default for every `case` `fallThrough` is set to `false`. If needed, you need to set it to `true` explicitly. This the reason why we don't need to write the following: `<span case="value.bind:'processing'; fall-through.bind: false">Processing your order.</span>`.
* `fall-through: true` is a less verbose syntax for binding the value of `fallThrough`. In this case, the string `'true'` and `'false'` are converted to boolean `true`, and `false` respectively.
{% endhint %}

### Miscellaneous examples

This section includes few more interesting examples that you might encounter in real life, and the statutory warnings.

* Another usage of switch that we often see in the wild, is to use a static expression for `switch` and more dynamic expression for `case`. Therefore, the following is a valid usage of `switch`.

  {% code title="my-app.html" %}
  ```markup
  <template>
    <template repeat.for="num of 100">
      <template switch.bind="true">
        <span case.bind="num % 3 === 0 && num % 5 === 0">FizzBuzz</span>
        <span case.bind="num % 3 === 0">Fizz</span>
        <span case.bind="num % 5 === 0">Buzz</span>
      </template>
    </template>
  </template>
  ```
  {% endcode %}

* The `switch` can be used to provide conditional projection to `au-slot`. The following markup is rendered as `'<foo-bar> <span>Order received.</span> </foo-bar>'` with `status` set to `Status.received`.

  {% code title="my-app.html" %}
  ```markup
  <template as-custom-element="foo-bar">
    <au-slot name="s1"></au-slot>
  </template>

  <foo-bar>
    <template au-slot="s1">
      <template switch.bind="status">
        <span case="received">Order received.</span>
        <span case="dispatched">On the way.</span>
        <span case="processing">Processing your order.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>
  </foo-bar>
  ```
  {% endcode %}

* The `case` can be used with `<au-slot>` element as well. The following markup is rendered as `'<foo-bar> <div> <span>Projection</span> </div> </foo-bar>'` with `status` set to `Status.received`.

  {% code title="my-app.html" %}
  ```markup
  <template as-custom-element="foo-bar">
    <bindable property="status"></bindable>
    <div switch.bind="status">
      <au-slot name="s1" case="received">Order received.</au-slot>
      <au-slot name="s2" case="dispatched">On the way.</au-slot>
      <au-slot name="s3" case="processing">Processing your order.</au-slot>
      <au-slot name="s4" case="delivered">Delivered.</au-slot>
    </div>
  </template>

  <foo-bar status.bind="status">
    <span au-slot="s1">Projection</span>
  </foo-bar>
  ```
  {% endcode %}

* `switch`s can be nested. For example, the following markup is rendered as `<span> Expected to be delivered in 2 days. </span>` with `status` set to `Status.delivered`.

  {% code title="my-app.html" %}
  ```markup
  <template>
    <let day.bind="2"></let>
    <template switch.bind="status">
      <span case="received">Order received.</span>
      <span case="dispatched">On the way.</span>
      <span case="processing">Processing your order.</span>
      <span case="delivered" switch.bind="day">
        Expected to be delivered
        <template case.bind="1">tomorrow.</template>
        <template case.bind="2">in 2 days.</template>
        <template default-case>in few days.</template>
      </span>
    </template>
  </template>
  ```
  {% endcode %}

* `switch` can work without any `case` attribute in it. However, the `case` cannot be used with the `switch` applied to its parent. This applies to the `default-case` as well.

  {% code title="my-app.html" %}
  ```markup
  <!-- this works! -->
  <div switch.bind="status">
    the curious case of \${status}
  </div>

  <!-- this throws error! -->
  <span case="foo"></span>
  ```
  {% endcode %}

* In fact, it is worth noting that `case` should be the direct child of `switch`. In most of the cases Aurelia will throw error otherwise in most of the cases; for other cases, it might lead to unexpected results. If you think, any of the following should be supported, then let us know your use-case.

  {% code title="my-app.html" %}
  ```markup
  <!-- These do NOT work! -->
  <!-- #1: usage with `if` -->
  <template>
    <template switch.bind="status">
      <template if.bind="true">
        <span case="delivered">delivered</span>
      </template>
    </template>
  </template>

  <!-- #2: usage with `repeat.for` -->
  <template>
    <template switch.bind="status">
      <template repeat.for="s of ['received','dispatched','processing','delivered',]">
        <span case.bind="s">\${s}</span>
      </template>
    </template>
  </template>

  <!-- #3: usage with `au-slot` -->
  <template as-custom-element="foo-bar">
    <au-slot name="s1"></au-slot>
  </template>

  <foo-bar switch.bind="status">
    <template au-slot="s1">
      <span case="dispatched">On the way.</span>
      <span case="delivered">Delivered.</span>
    </template>
  </foo-bar>

  <!--
    The following example does produce some sort of output;
    but such usage is not supported.
  -->
  <template as-custom-element="foo-bar">
    foo bar
  </template>

  <template switch.bind="status">
    <foo-bar>
      <span case="dispatched">On the way.</span>
      <span case="delivered">Delivered.</span>
    </foo-bar>
  </template>
  <!--
    With `status` set to 'dispatched' it produces this output:
    `<foo-bar> <span>On the way.</span> foo bar </foo-bar>`
  -->
  ```
  {% endcode %}

