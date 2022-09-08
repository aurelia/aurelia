# Routing Lifecycle

Inside your routable components which implement the `IRouteViewModel` interface, there are certain methods that are called at different points of the routing lifecycle. These lifecycle hooks allow you to run code inside of your components such as fetch data or change the UI itself.

{% hint style="info" %}
Router lifecycle hook methods are all completely optional. You only have to implement the methods you require. The router will only call a method if it has been specified inside of your routable component. All lifecycle hook methods also support returning a promise and can be asynchronous.
{% endhint %}

If you are working with components you are rendering, implementing `IRouteViewModel` will ensure that your code editor provides you with intellisense to make working with these lifecycle hooks in the appropriate way a lot easier.

```typescript
import { IRouteableComponent, Parameters, Navigation, RoutingInstruction } from '@aurelia/router';

export class MyComponent implements IRouteableComponent {
    canLoad(params: Parameters, instruction: RoutingInstruction, navigation: Navigation);
    load(params: Parameters, instruction: RoutingInstruction, navigation: Navigation);
    canUnload(instruction: RoutingInstruction, navigation: Navigation);
    unload(instruction: RoutingInstruction, navigation: Navigation);
}
```

### **canLoad**

The `canLoad` method is called upon attempting to load the component. If your route has any parameters supplied, they will be provided to the `canLoad` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you were loading data from an API based on values provided in the URL, you would most likely do that inside of `canLoad` if the view is dependent on the data successfully loading.
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

#### Redirecting

Not only can we allow or disallow the component to be loaded, but we can also redirect. If you want to redirect to the root route, return a string with a `/` inside it. You can return a route ID, route path match or navigation instruction from inside this callback to redirect.

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

If you wanted to load data from an API, you could make the `canLoad` method async, which would make it a promise-based method. You would be awaiting an actual API call of some kind in place of `....load data`

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyProduct implements IRouteableComponent {
    async canLoad(params: Parameters) {
        await ....load data
    }
}
```

### **load**

The `load` method is called when your component is navigated to. If your route has any parameters supplied, they will be provided to the `load` method as an object with one or more parameters as the first argument.

{% hint style="info" %}
If you are loading data from an API based on values provided in the URL and the rendering of this view is not dependent on the data being successfully returned, you can do that inside of `load`.
{% endhint %}

In many ways, the `load` method is the same as `canLoad` with the exception that `load` cannot prevent the component from loading. Where `canLoad` can be used to redirect users away from the component, the `load` method cannot.

All of the above code examples for `canLoad` can be used with `load` and will work the same with exception of being able to return `true` or `false` boolean values to prevent the component being loaded (as we just mentioned).

### canUnload

The `canUnload` method is called when a user attempts to leave a routed view. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route. You can return a component, boolean or string value from this method.

Like the `canLoad` method, this is just the inverse. It determines if we can navigate away from the current component.

### **unload**

The `unload` method is called if the user is allowed to leave and in the process of leaving. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route.

Like the `load` method, this is just the inverse. It is called when the component is being unloaded (provided `canUnload` wasn't false).

## Loading data inside of components

A common router scenario is you want to route to a specific component, say a component that displays product information based on the ID in the URL. You make a request to the API to get the information and display it.

There are two asynchronous lifecycles that are perfect for dealing with loading data: `canLoad` and `load` - both supporting returning a promise (or async/await).

If the component you are loading absolutely requires the data to exist on the server and be returned, the `canLoad` lifecycle method is the best place to do it. Using our example of a product page, if you couldn't load product information, the page would be useful, right?

From the inside of `canLoad` you can redirect the user elsewhere or return false to throw an error.

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyComponent implements IRouteableComponent {
    async canLoad(params: Parameters) {
        this.product = await this.api.getProduct(params.productId);
    }
}
```

Similarly, if you want the view to still load even if we can't get the data, you would use the `load` lifecycle callback.

```typescript
import { IRouteableComponent, Parameters } from "@aurelia/router";

export class MyComponent implements IRouteableComponent {
    async load(params: Parameters) {
        this.product = await this.api.getProduct(params.productId);
    }
}
```

When you use `load` and `async` the component will wait for the data to load before rendering.

## Setting the title from within components

While you would in many cases, set the title of a route in your route configuration object using the `title` property, sometimes you want the ability to specify the title property from within the routed component itself.

You can achieve this from within the `canLoad` and `load` methods in your component. By setting the `next.title` property, you can override or transform the title.

```typescript
import { IRouteableComponent, Parameters, RoutingInstruction, Navigation } from "@aurelia/router";

export class ProductPage implements IRouteableComponent {
  load(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation) {
    instruction.route.match.title = 'COOL BEANS';
  }
}
```
