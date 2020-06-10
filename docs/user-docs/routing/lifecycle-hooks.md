---
description: >-
  The Router lifecycle explained. Various lifecycle functions which get called
  throughout the router at different points.
---

# Lifecycle Hooks

Inside of your routeable components which implement the `IRouteableComponent` interface, there are certain methods which are called at different points of the routing lifecycle. These lifecycle hooks allow you to run code inside of your components such as fetch data or change the UI itself.

{% hint style="info" %}
Router lifecycle hook methods are all completely optional. You only have to implement the methods you require. The router will only call a method if it has been specified inside of your routeable component. All lifecycle hook methods also support returning a promise and can be asynchronous.
{% endhint %}

### **canEnter**

The `canEnter` method is called upon attempting to load the component. If your route has any parameters supplied, they will be provided to the `canEnter` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you were loading data from an API based on values provided in the URL, you would most likely do that inside of `canEnter` if the view is dependent on the data successfully loading.
{% endhint %}

### **enter**

The `enter` method is called when your component is navigated to. If your route has any parameters supplied, they will be provided to the `enter` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you are loading data from an API based on values provided in the URL and the rendering of this view is not dependent on the data being successfully returned, you can do that inside of `enter`.
{% endhint %}

### **canLeave**

The `canLeave` method is called when a user attempts to leave a routed view. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route.

### **leave**

The `leave` method is called if the user is allowed to leave and in the process of leaving. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route.

If you are working with components you are rendering, implementing `IRouteableComponent` will ensure that your code editor provides you with intellisense to make working with these lifecycle hooks in the appropriate way a lot easier.

```typescript
export class MyComponent implements IRouteableComponent {
    public canEnter(parameters) {}
    public enter(parameters) {}
    public canLeave() {}
    public leave() {}
}
```

