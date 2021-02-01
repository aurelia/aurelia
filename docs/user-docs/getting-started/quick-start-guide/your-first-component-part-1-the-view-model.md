---
description: As easy as pie.
---

# Your First Component - Part 1: The View-Model

Aurelia as a default convention works on the premise of a view and view-model, both of which are tied together. The view-model is where your business logic lives and, if you have ever worked with .NET before, you might refer to this as the controller.

In the previous section, we briefly spoke about `my-app(.ts/.js)` -- which is where your business logic lives. If you open it up in a code editor, you will see there is not much going on there.

```text
export class MyApp {
  public message = 'Hello World!';
}
```

The class property `message` contains a string and within our view, we are displaying it using interpolation.

```text
<div class="message">${message}</div>
```

We are now going to create a new component which will be a smarter hello component. Inside of `src` create a new file called `hello-name` and use the appropriate file extension depending on whether you are using TypeScript or not.

```text
export class HelloNameCustomElement {
  public name = 'Person';
}
```

Notice how our new component doesn't look much different than the default? That's intentional. We are going to bind to this name property using `two-way` binding.

Nice one! You just created a custom element view-model. In the next chapter, we will hook this up with our view and allow a text input to change this value.

