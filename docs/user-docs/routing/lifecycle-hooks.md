---
description: >-
  The Router lifecycle explained. Various lifecycle functions which get called
  throughout the router at different points.
---

# Lifecycle Hooks

Inside of your routeable components which implement the `IRouteableComponent` interface, there are certain methods which are called at different points of the routing lifecycle. These lifecycle hooks allow you to run code inside of your components such as fetch data or change the UI itself.

{% hint style="success" %}
**What you will learn in this section**

* What router lifecycle hooks are available
* Which hooks you should use to load data and perform other actions
{% endhint %}

{% hint style="info" %}
Router lifecycle hook methods are all completely optional. You only have to implement the methods you require. The router will only call a method if it has been specified inside of your routeable component. All lifecycle hook methods also support returning a promise and can be asynchronous.
{% endhint %}

## **canLoad**

The `canLoad` method is called upon attempting to load the component. If your route has any parameters supplied, they will be provided to the `canLoad` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you were loading data from an API based on values provided in the URL, you would most likely do that inside of `canLoad` if the view is dependent on the data successfully loading.
{% endhint %}

## **load**

The `load` method is called when your component is navigated to. If your route has any parameters supplied, they will be provided to the `load` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you are loading data from an API based on values provided in the URL and the rendering of this view is not dependent on the data being successfully returned, you can do that inside of `load`.
{% endhint %}

## **canUnload**

The `canUnload` method is called when a user attempts to leave a routed view. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route.

## **unload**

The `unload` method is called if the user is allowed to leave and in the process of leaving. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route.

If you are working with components you are rendering, implementing `IRouteableComponent` will ensure that your code editor provides you with intellisense to make working with these lifecycle hooks in the appropriate way a lot easier.

```typescript
export class MyComponent implements IRouteableComponent {
    public canLoad(parameters) {}
    public load(parameters) {}
    public canUnload() {}
    public unload() {}
}
```

