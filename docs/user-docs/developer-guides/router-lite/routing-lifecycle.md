---
description: >-
  Learn about the different routing hooks and how to leverage those
  in terms of dis/allow loading or unloading as well as performing
  setup and teardown of a view.
---

# Routing lifecycle hooks

Inside your routable components which implement the `IRouteViewModel` interface, there are certain methods that are called at different points of the routing lifecycle. These lifecycle hooks allow you to run code inside of your components such as fetch data or change the UI itself.

{% hint style="info" %}
Router lifecycle hook methods are all completely optional. You only have to implement the methods you require. The router will only call a method if it has been specified inside of your routable component. All lifecycle hook methods also support returning a promise and can be asynchronous.
{% endhint %}

If you are working with components you are rendering, implementing `IRouteViewModel` will ensure that your code editor provides you with intellisense to make working with these lifecycle hooks in the appropriate way a lot easier.

```typescript
import { IRouteViewModel, Params, RouteNode, NavigationInstruction } from '@aurelia/router-lite';

export class MyComponent implements IRouteViewModel {
  canLoad?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null
  ): boolean
    | NavigationInstruction
    | NavigationInstruction[]
    | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  loading?(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
  canUnload?(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
  unloading?(next: RouteNode | null, current: RouteNode): void | Promise<void>;
}
```

Roughly speaking, using the `canLoad` and `canUnload` hooks you can determine whether to allow or prevent navigation to and from a route respectively.
The `loading` and `unloading` hooks are meant to be used for performing setup and clean up activities respectively for a view.
These hooks are discussed in details in the following section.
Note that all of these hooks can return a promise, which will be awaited by the router-lite pipeline.

{% hint style="info" %}
In case you are looking for the global/shared routing hooks, there is a separate [documentation section](./router-hooks.md) dedicated for that.
{% endhint %}

## `canLoad`

The `canLoad` method is called upon attempting to load the component.
It allows you to determine if the component should be loaded or not.
If your component relies on some precondition being fulfilled before being allowed to render, this is the method you would use.
Note that the `canLoad` method can also be asynchronous.

The component would be loaded if `true` (it has to be `boolean` `true` ) is returned from this method.
To disallow loading the component you can return `false`.
You can also return a navigation instruction to navigate the user to a different view.
These are discussed in the following sections.

{% hint style="warning" %}
Returning any value other than `boolean true`, from within the `canLoad` function will cancel the router navigation.
<!-- TODO(Sayan): add link to router events involving canLoad -->
{% endhint %}

### Allow or disallowed loading components

The following example shows that a parameterized route, such as `/c1/:id?`, can only be loaded if the value of `id` is an even number.
Note that the value of the `id` parameter can be grabbed from the the first argument (`params`) to the `canLoad` method.

```typescript
import { Params } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'c-one',
  template: `c1 \${id}`,
})
export class ChildOne {
  private id: number;
  public canLoad(params: Params): boolean {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id % 2 != 0) return false;
    this.id = id;
    return true;
  }
}
```

You can also see this example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-canload-true-false?ctl=1&embed=1&file=src/child1.ts" %}

### Redirect to another view from `canLoad`

Not only can we allow or disallow the component to be loaded, but we can also redirect.
The simplest way is to return a string path from `canLoad`.
In the following example, we re-write the [previous example](#allow-or-disallowed-loading-components), but instead of returning `false`, we return a path, where the user will be redirected.

```typescript
import { NavigationInstruction, Params } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'c-one',
  template: `c1 \${id}`,
})
export class ChildOne {
  private id: number;
  public canLoad(params: Params): boolean | NavigationInstruction {
    const id = Number(params.id);
    // If the id is not an even number then redirect to c2
    if (!Number.isInteger(id) || id % 2 != 0) return `c2/${params.id}`;
    this.id = id;
    return true;
  }
}
```

You can also see this example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-canload-string-nav-instruction?ctl=1&embed=1&file=src/child1.ts" %}

If you prefer a more [structured navigation instructions](./navigating.md) then you can also do so.
Following is the same example using route-id and parameters object.

{% embed url="https://stackblitz.com/edit/router-lite-canload-routeid-nav-instruction?ctl=1&embed=1&file=src/child1.ts" %}

Note that you can also choose to return a sibling navigation instructions.
This can be done by returning an array of navigation instructions.

```typescript
import { NavigationInstruction, Params } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';
import { Workaround } from './workaround';

@customElement({
  name: 'c-one',
  template: `c1 \${id}`,
})
export class ChildOne {
  private id: number;
  public canLoad(params: Params): boolean | NavigationInstruction {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id % 2 != 0)
      return [
        { component: Workaround },
        { component: 'r2', params: { id: params.id } },
      ];
    this.id = id;
    return true;
  }
}
```

You can also see the example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-canload-sibling-nav-instructions?ctl=1&embed=1&file=src/child1.ts" %}

### Accessing fragment and query

Apart from accessing the route parameter, the query and the fragment associated with the URL can also be accessed inside the `canLoad` hook.
To this end, you can use the second argument (`next`) to this method.

The following example shows that `id` query parameter is checked whether that is an even number or not.
If that condition does not hold, then user is redirected to a different view with the query and fragment.

```typescript
import { NavigationInstruction, Params, RouteNode } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'c-one',
  template: `c1 \${id} fragment: \${fragment}`,
})
export class ChildOne {
  private id: number;
  private fragment: string;
  public canLoad(
    params: Params,
    next: RouteNode
  ): boolean | NavigationInstruction {
    this.fragment = next.fragment;
    const query = next.queryParams;
    const rawId = query.get('id');
    const redirectPath = `c2?${next.queryParams.toString()}${
      next.fragment ? `#${next.fragment}` : ''
    }`;
    if (rawId === null) return redirectPath;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id % 2 != 0) return redirectPath;
    this.id = id;
    return true;
  }
}
```

You can also see the example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-canload-accessing-fragment-and-query?ctl=1&embed=1&file=src/child1.ts" %}

## `loading`

The `loading` method is called when your component is navigated to. If your route has any parameters supplied, they will be provided to the `loading` method as an object with one or more parameters as the first argument.

In many ways, the `loading` method is the same as `canLoad` with the exception that `loading` cannot prevent the component from loading. Where `canLoad` can be used to redirect users away from the component, the `loading` method cannot.

This lifecycle hook can be utilized to

All of the above code examples for `canLoad` can be used with `load` and will work the same with exception of being able to return `true` or `false` boolean values to prevent the component being loaded.

One of the examples is refactored using `loading` hook that is shown below.

{% embed url="https://stackblitz.com/edit/router-lite-loading?ctl=1&embed=1&file=src/child1.ts" %}

## `canUnload`

The `canUnload` method is called when a user attempts to leave a routed view.
The first argument (`next`) of this hook is a `RouteNode` which provides information about the next route.

This hook is like the `canLoad` method but inverse.
You can return a `boolean true` from this method, allowing the router-lite to navigate away from the current component.
Returning any other value from this method will disallow the router-lite to unload this component.

The following example shows that before navigating away, the

TODO(sayan): add example

### **unload**

The `unload` method is called if the user is allowed to leave and in the process of leaving. The first argument of this callback is a `INavigatorInstruction` which provides information about the next route.

Like the `load` method, this is just the inverse. It is called when the component is being unloaded (provided `canUnload` wasn't false).

## Loading data inside of components

A common router scenario is you want to route to a specific component, say a component that displays product information based on the ID in the URL. You make a request to the API to get the information and display it.

There are two asynchronous lifecycles that are perfect for dealing with loading data: `canLoad` and `load` - both supporting returning a promise (or async/await).

If the component you are loading absolutely requires the data to exist on the server and be returned, the `canLoad` lifecycle method is the best place to do it. Using our example of a product page, if you couldn't load product information, the page would be useful, right?

From the inside of `canLoad` you can redirect the user elsewhere or return false to throw an error.

```typescript
import { IRouteViewModel, Parameters } from "@aurelia/router";

export class MyComponent implements IRouteViewModel {
    async canLoad(params: Parameters) {
        this.product = await this.api.getProduct(params.productId);
    }
}
```

Similarly, if you want the view to still load even if we can't get the data, you would use the `load` lifecycle callback.

```typescript
import { IRouteViewModel, Parameters } from "@aurelia/router";

export class MyComponent implements IRouteViewModel {
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
import { IRouteViewModel, Parameters, RoutingInstruction, Navigation } from "@aurelia/router";

export class ProductPage implements IRouteViewModel {
  load(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation) {
    instruction.route.match.title = 'COOL BEANS';
  }
}
```
