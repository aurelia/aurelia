---
description: >-
  A view-model is where your business logic will live for your components.
  Follow along as you create your first view-model.
---

# Your first component - part 1: the view model

Aurelia as a default convention works on the premise of a view and view-model, both of which are tied together. The view-model is where your business logic lives and, if you have ever worked with .NET before \(or other frameworks\), you might refer to this as the controller.

Navigate to the `src` directory where your application code lives and open up the `my-app(.ts/.js` file. This is the main entry point for the application and this file is where business logic would live. As you can see, there is not a lot going on at the moment.

```typescript
export class MyApp {
  message = 'Hello World!';
}
```

The class property `message` contains a string and within our view, we are displaying it using interpolation.

```html
<div class="message">${message}</div>
```

We are now going to create a new component which will be a smarter hello component. Inside of `src` create a new file called `hello-name` and use the appropriate file extension depending on whether you are using TypeScript or not. So, `hello-name.ts` or `hello-name.js`.

```typescript
export class HelloName {
  name = 'Person';
}
```

Notice how our new component doesn't look much different than the generated one? That's intentional. We are going to bind to this name property using `two-way` binding from within our view. We don't need any callback functions to update this value either.

Nice one! You just created a custom element view-model. It might not look like much, but you just learned a very core fundamental concept of building Aurelia applications. A view-model can be as simple and complex as you want it to be.

In the next chapter, we will hook this up with our view and allow a text input to change this value.

