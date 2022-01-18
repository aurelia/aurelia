---
description: Show and hide elements in the dom
---

# show.bind

You can conditionally show or hide an element by specifying a `show.bind` and passing in a true or false value.

When `show.bind` is passed `false` the element will be hidden, but unlike `if.bind` it will not be removed from the DOM. Any resources, events or bindings will remain. It's the equivalent of `display: none;` in CSS, the element is hidden, but not removed.

In the following example, we are passing a value called `isLoading` which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div show.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be visible. When `isLoading` is falsy, the element will be hidden, but remain in the view.

