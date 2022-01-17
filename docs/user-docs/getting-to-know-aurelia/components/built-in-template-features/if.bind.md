---
description: Conditionally show and hide elements in the dom
---

# if.bind

You can add or remove an element by specifying an `if.bind` on an element and passing in a true or false value.

When `if.bind` is passed `false` Aurelia will remove the element all of its children from the view. When an element is removed, if it is a custom element or has any events associated with it, they will be cleaned up, thus freeing up memory and other resources they were using.

In the following example, we are passing a value called `isLoading` which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div if.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be displayed and added to the DOM. When `isLoading` is falsy, the element will be removed from the DOM, disposing of any events or child components inside of it.

