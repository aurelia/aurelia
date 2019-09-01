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

\`\`\`HTML if-template.html

Would you like me to greet the world?

 Hello, World!

```text
If the value of `greet` is `true`, then the `div` with the message "Hello, World!" will be inserted into the DOM. If it's `false`, the `div` will be removed.

Conditionals can also be `one-time` bound, so that parts of the template are fixed once they're instantiated:

```JavaScript bind-template.js
export class ConditionalOneTimeTemplate {
  greet = (Math.random() > 0.5);
}
```

\`\`\`TypeScript bind-template.ts \[variant\] export class ConditionalOneTimeTemplate { greet = \(Math.random\(\) &gt; 0.5\); }

```text
```HTML conditional-one-time-template.html
<div if.one-time="greet">
  Hello, World!
</div>
<div if.one-time="!greet">
  Some other time.
</div>
```

There's a 50-50 chance that we'll greet the world, or put it off until later. Once the page loads, this is fixed, because the data is `one-time` bound.

Complementing `if`, there is `else`. Used in conjunction with `if`, `else` will render its content when `if` does not evaluate to `true`.

\`\`\`HTML if-else-template.html

 ${message}

 Nothing to see here...

```text
Elements using the `else` template modifier must follow an `if` bound element to make contextual sense and function properly.

### Caching View Instances

> Info
> Not Implemented: View cache control is not yet implemented in vNext.

By default, `if` caches the underlying view instance. Although the element is being removed from the DOM and
the component goes through `detached` and `unbind` lifecyle events, its instance is kept in memory for further condition
changes. Therefore, when the element is hidden and then shown again, `if` does not need to initialize the component
again.

You can opt-out this default behavior by setting the `cache` binding of the `if` attribute explicitly. This is
especially useful when using `if` on [custom elements](./components) and initializing them on every appearance is
crucial.

```HTML if-template-without-cache.html
<div if="condition.bind: showMessage; cache: false">
  <span>${message}</span>
</div>
```

## show/hide

The difference between `if` and `show` is that `if` removes the element entirely from the DOM, and `show` toggles the `aurelia-hide` CSS class which controls the element's visibility only.

This difference is subtle but important in terms of speed and usability. When the state changes in `if`, the template and all of its children are deleted from the DOM, which is computationally expensive if it's being done over and over. However, if `show` is being used for a very large template, such as a dashboard containing thousands of elements with their own bound data, then keeping those elements loaded-but-hidden may not end up being a useful approach.

If we just want to hide the element from view instead of removing it from the DOM completely, we should use `show` instead of `if`. Let's look at the same basic "Hello World" from above that asks the user if they want to greet the world, this time with `show` instead of `if`.

\`\`\`HTML show-template.html

 Would you like me to greet the world? Hello, World!

\`\`\`

When unchecked, our "Hello World" div will have the `aurelia-hide` class, which sets `display: none` if you're using Aurelia's default CSS. However, if you don't want to do that, you can also define your own CSS rules that treat `aurelia-hide` differently, like setting `visibility: none` or `height: 0px`.

What about the scenario above with `one-time`? Should we use `show.one-time` in the same way? If we think about what `show` does, it doesn't really make sense. We're saying we want a CSS class to be applied that will hide an element, and that it will never change. In most cases, we want `if` to refuse to create an element we'll never use in the first place.

