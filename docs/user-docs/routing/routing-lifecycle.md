---
description: >-
  The routing lifecycle allows you to run code at different points of the
  routing lifecycle such as fetching data or changing the UI.
---

# Routing Lifecycle

Inside your routable components which implement the `IRouteableComponent` interface, certain methods are called at different points of the routing lifecycle. These lifecycle hooks allow you to run code inside of your components, such as fetching data or changing the UI itself.

{% hint style="info" %}
**Router lifecycle hook methods are all completely optional.** You only have to implement the methods you require. The router will only call a method if it has been specified inside of your routable component. All lifecycle hook methods also support returning a promise and can be asynchronous.
{% endhint %}

If you are working with components you are rendering, implementing `IRouteableComponent` will ensure that your code editor provides you with intellisense to make working with these lifecycle hooks easier.

```typescript
import { IRouteableComponent, Parameters, Navigation, RoutingInstruction } from '@aurelia/router';

export class MyComponent implements IRouteableComponent {
    canLoad(params: Parameters, instruction: RoutingInstruction, navigation: Navigation);
    loading(params: Parameters, instruction: RoutingInstruction, navigation: Navigation);
    canUnload(instruction: RoutingInstruction, navigation: Navigation);
    unloading(instruction: RoutingInstruction, navigation: Navigation);
}
```

### **canLoad**

The `canLoad` method is called upon attempting to load the component. If your route has any parameters supplied, they will be provided to the `canLoad` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you were loading data from an API based on values provided in the URL, you would most likely do that inside  `canLoad` if the view is dependent on the data successfully loading.
{% endhint %}

The `canLoad` method allows you to determine if the component should be loaded or not. If your component relies on data being present from the API or other requirements being fulfilled before being allowed to render, this is the method you would use.

When working with the `canLoad` method, you can use promises to delay loading the view until a promise and/or promises have been resolved. The component would be loaded if we were to return `true` from this method.

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyProduct implements IRouteableComponent {
    canLoad(params: Parameters) {
        return true;
    }
}
```

#### Required data

If you wanted to load data from an API, you could make the `canLoad` method async, which would make it a promise-based method. You would be awaiting an actual API call of some kind in place of `....load data`

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyProduct implements IRouteableComponent {
    async canLoad(params: Parameters) {
        await ....load data (Fetch call, etc)
    }
}
```

Unlike other async methods, if the promise does not resolve, the component will not load. The `canLoad` lifecycle method tells the router if the component is allowed to load. It's a great router method for components that rely on data loading such as product detail or user profile pages.

#### Redirecting

Not only can we allow or disallow the component to be loaded, but we can also redirect it. If you want to redirect to the root route, return a string with an `/` inside it. You can return a route ID, route path match or navigation instruction from inside this callback to redirect.

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyProduct implements IRouteableComponent {
    canLoad(params: Parameters) {
        return '/'; // Matches default empty route
    }
}
```

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyProduct implements IRouteableComponent {
    canLoad(params: Parameters) {
        return 'products'; // Matches route with ID 'products'
    }
}
```

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyProduct implements IRouteableComponent {
    canLoad(params: Parameters) {
        return '/products/54'; // Matches route path for product/:productId
    }
}
```

{% hint style="warning" %}
Returning a boolean false, string or RoutingInstruction from within the `canLoad` function will cancel the router navigation.
{% endhint %}

### **loading**

The `loading` method is called when your component is navigated to. If your route has any parameters supplied, they will be provided to the `load` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you are loading data from an API based on values provided in the URL and the rendering of this view is not dependent on the data being successfully returned, you can do that inside of `load`.
{% endhint %}

In many ways, the `loading` method is the same as `canLoad` with the exception that `loading` cannot prevent the component from loading. Where `canLoad` can be used to redirect users away from the component, the `loading` method cannot.

All of the above code examples for `canLoad` can be used with `loading` and will work the same, with exception of being able to return `true` or `false` boolean values to prevent the component being loaded (as we just mentioned).

### canUnload

The `canUnload` method is called when a user attempts to leave a routed view. The first argument of this callback is a `INavigatorInstruction` it provides information about the next route. You can return a component, boolean or string value from this method.

Like the `canLoad` method, this is just the inverse. It determines if we can navigate away from the current component.

### **unloading**

The `unloading` method is called if the user is allowed to leave and is in the process of leaving. The first argument of this callback is a `INavigatorInstruction` it provides information about the next route.

Like the `loading` method, this is just the inverse. It is called when the component is unloaded (provided `canUnload` wasn't false).

## Loading data inside of components

A common router scenario is you want to route to a specific component, say a component that displays product information based on the ID in the URL. You request the API to get the information and display it.

Two asynchronous lifecycles are perfect for dealing with loading data: `canLoad` and `load` - both supporting returning a promise (or async/await).

If the component you are loading absolutely requires the data to exist on the server and be returned, the `canLoad` lifecycle method is the best place to do it. Using our example of a product page, if you couldn't load product information, the page would be useful, right?

From the inside  `canLoad` you can redirect the user elsewhere or return false to throw an error.

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyComponent implements IRouteableComponent {
    async canLoad(params: Parameters) {
        this.product = await this.api.getProduct(params.productId);
    }
}
```

Similarly, if you still want the view to load, even if we can't get the data, you would use the `loading`lifecycle callback.

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyComponent implements IRouteableComponent {
    async loading(params: Parameters) {
        this.product = await this.api.getProduct(params.productId);
    }
}
```

When you use `load` and `async` the component will wait for the data to load before rendering.

## Getting information about the currently active route

If you worked with routing in Aurelia 1, you might be accustomed to a `currentInstruction` property available on the router. In Aurelia 2, this property does not exist. There are, however, two properties on the router called `activeNavigation` and `activeComponents` which can be used to achieve a similar result. You can also reference the instruction itself from within route lifecycle functions.

The `activeNavigation` property contains quite a few properties but most notably has the current URL path, query parameters and other navigation-specific values. You might want to get information about the current route.

#### Get current route details

We can get information about the current route by accessing the `activeComponents` array and determining the active component. Still, it is possible that more than one component will be in this array. An easier way is to get the route instruction on the `canLoad` and `loading` lifecycle methods.

```typescript
import { IRouteableComponent, IRouter, Navigation, Parameters, RoutingInstruction } from '@aurelia/router';

loading(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation): void | Promise<void> {
    console.log(instruction.endpoint.instance.getContent().instruction);
}
```

It might seem like a mouthful, but to get the current instruction that resulted in the viewport's current content, this is the current approach to take from within those aforementioned methods inside your components.

#### Get query parameters from the URL

The `parameters` object contains a Javascript object of any URL parameters. If your URL contains `/?myprop=22&frag=0` then this object would contain `{myprop: '22', frag: '0'}` , allowing you to get fragment values.

```typescript
loading() {
    console.log(this.router.activeNavigation.parameters);
}
```

## Setting the title from within components

While you would often set the title of a route in your route configuration object using the `title` property, sometimes you want the ability to specify the title property from within the routed component itself.

You can achieve this from within the `canLoad` and `load` methods in your component. By setting the `next.title` property, you can override or transform the title.

```typescript
import { IRouteableComponent, Parameters, RoutingInstruction, Navigation } from "@aurelia/router";

export class ProductPage implements IRouteableComponent {
  loading(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation) {
    instruction.route.match.title = 'COOL BEANS';
  }
}
```
