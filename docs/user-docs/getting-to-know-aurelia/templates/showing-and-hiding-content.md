---
description: There are two ways to show and hide content in Aurelia.
---

# Showing & hiding content

## Conditionally add and remove elements using if.bind

You can add or remove an element by specifying an `if.bind` on an element and passing in a true or false value.

When `if.bind` is passed `false` Aurelia will remove the element all of its children from the view. When an element is removed, if it is a custom element or has any events associated with it, it will be cleaned up, thus freeing up memory and other resources they were using.

In the following example, we pass a value called `isLoading` which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div if.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be displayed and added to the DOM. When `isLoading` is falsy, the element will be removed from the DOM, disposing of any events or child components inside of it.

By default, the `if.bind` feature will cache the view-model/view of the element you are using `if.bind` on. Not being aware of this default behavior can lead to confusing situations where the previous state is retained, especially on custom elements.

You can opt out of caching if this becomes a problem by using verbose `if.bind` syntax.

```html
<some-element if="value.bind: showThis; cache: false"></some-element>
```

When using the verbose syntax, `value.bind` is the boolean condition that triggers your `if.bind` condition and `cache: false` is what disables the cache. Only disable the cache if it becomes a problem.

{% hint style="warning" %}
Be careful. Using if.bind takes your markup out of the flow of the page. There is causes both reflow and repaint events in the browser, which can be intensive for large applications with a lot of markup.
{% endhint %}

## Conditionally show and hide elements using show.bind

You can conditionally show or hide an element by specifying a `show.bind` and passing in a true or false value.

When `show.bind` is passed `false` the element will be hidden, but unlike `if.bind` it will not be removed from the DOM. Any resources, events or bindings will remain. It's the equivalent of `display: none;` in CSS, the element is hidden, but not removed.

In the following example, we are passing a value called `isLoading` which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div show.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be visible. When `isLoading` is falsy, the element will be hidden, but remain in the view.

## Switch/case statements in templates using switch.bind

In Javascript, we can use `switch/case` statements that act as neater `if` statements. We can use `switch.bind` to achieve the same thing within our templates.

```markup
<p switch.bind="selectedAction">
  <span case="mask">You are more protected from aerosol particles, and others are protected from you.</span>
  <span case="sanitizer">You are making sure viruses won't be spread easily.</span>
  <span case="wash">You are helping eliminate the virus.</span>
  <span case="all">You are protecting yourself and the people around you. You rock!</span>
  <span default-case>Unknown.</span>
</p>
```

The `switch.bind` controller will watch the bound value, which in our case is `selectedAction` and when it changes, match it against our case values. It is important to note that this will add and remove elements from the DOM like the `if.bind` does.

In the above example, you can see that we denote the container element where we use `switch.bind` followed by `case` with the value to match on. At the end, we have `default-case` which will be displayed if the provided value does not match any of the case values.
