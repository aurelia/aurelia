---
description: >-
  There are two ways to show and hide content in Aurelia. Conditional rendering
  allows you to use boolean logic to show and hide things inside Aurelia
  applications.
---

# Conditional Rendering

Aurelia supports two different ways of conditionally showing and hiding content.

## if.bind

You can add or remove an element by specifying an `if.bind` on an element and passing in a true or false value.

When `if.bind` is passed `false` Aurelia will remove the element and all of its children from view. When an element is removed, if it is a custom element or has any associated events, it will be cleaned up, thus freeing up memory and other resources they were using.

In the following example, we pass a value called `isLoading` , which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div if.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be displayed and added to the DOM. When `isLoading` is falsy, the element will be removed from the DOM, disposing of any events or child components.

### else

There is also a `else` binding that allows you to create `if/else` statements too. The `if/else` functionality works how you might expect. Like Javascript, it allows you to say, "If this, otherwise that."

```html
<div if.bind="showThis">Hello, there.</div>
<div else>Or else.</div>
```

The `else` value must be used on an element directly proceeding  `if.bind` , or it will not work.

{% hint style="warning" %}
**A note on caching behavior:** By default, the `if.bind` feature will cache the view model/view of the element you are using `if.bind` . Not being aware of this default behavior can lead to confusing situations where the previous state is retained, especially on custom elements.
{% endhint %}

Using verbose syntax, you can opt out of caching if this becomes a problem.

```html
<some-element if="value.bind: showThis; cache: false"></some-element>
```

When using the verbose syntax, `value.bind` is the boolean condition that triggers your `if.bind` condition and `cache: false` is what disables the cache. Only disable the cache if it becomes a problem.

{% hint style="warning" %}
Be careful. Using `if.bind` takes your markup out of the flow of the page. This causes both reflow and repaint events in the browser, which can be intensive for large applications with a lot of HTML markup.
{% endhint %}

## show.bind

You can conditionally show or hide an element by specifying a `show.bind` and passing in a true or false value.

When `show.bind` is passed `false` , the element will be hidden, but unlike `if.bind` it will not be removed from the DOM. Any resources, events or bindings will remain. It's the equivalent of `display: none;` CSS, the element is hidden but not removed.

In the following example, we are passing a value called `isLoading` , which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div show.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be visible. When `isLoading` is falsy, the element will be hidden but remain in view.

## switch.bind

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
```html
<span if.bind="status === 'received'">Order received.</span>
<span if.bind="status === 'processing'">Processing your order.</span>
<span if.bind="status === 'dispatched'">On the way.</span>
<span if.bind="status === 'delivered'">Delivered.</span>
```
{% endcode %}

Also if there are new statuses added to the `Status` enum in future, this markup will end up more verbose, and possibly difficult to understand. Moreover, the semantics of the code might as well be somewhat lost. With the usage of the `switch/case` template controller, the above markup can be written as following.

{% code title="my-app.html" %}
```html
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
```html
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
```html
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
```html
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
  ```html
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
  ```html
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
  ```html
  <template as-custom-element="foo-bar">
    <bindable name="status"></bindable>
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
  ```html
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
  ```html
  <!-- this works! -->
  <div switch.bind="status">
    the curious case of \${status}
  </div>

  <!-- this throws error! -->
  <span case="foo"></span>
  ```
  {% endcode %}

* In fact, it is worth noting that `case` should be the direct child of `switch`. For most of the cases Aurelia will throw error otherwise; for other cases, it might lead to unexpected results. If you think, any of the following should be supported, then let us know your use-case.

  {% code title="my-app.html" %}
  ```html
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
