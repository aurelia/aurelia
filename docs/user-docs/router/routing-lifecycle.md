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
import {
  IRouteViewModel,
  Params,
  RouteNode,
  NavigationInstruction,
} from '@aurelia/router';

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

Using the `canLoad` and `canUnload` hooks you can determine whether to allow or disallow navigation to and from a route respectively.
The `loading` and `unloading` hooks are meant to be used for performing setup and clean up activities respectively for a view.
Note that all of these hooks can return a promise, which will be awaited by the router pipeline.
These hooks are discussed in details in the following section.

{% hint style="info" %}
In case you are looking for the global/shared routing hooks, there is a separate [documentation section](./router-hooks.md) dedicated for that.
{% endhint %}

## `canLoad`

The `canLoad` method is called upon attempting to load the component.
It allows you to determine if the component should be loaded or not.
If your component relies on some precondition being fulfilled before being allowed to render, this is the method you would use.

To disallow loading the component you can return a `boolean` `false`.
You can also return a navigation instruction to navigate the user to a different view.
These are discussed in the following sections.

### Allow or disallowed loading components

The following example shows that a parameterized route, such as `/c1/:id?`, can only be loaded if the value of `id` is an even number.
Note that the value of the `id` parameter can be grabbed from the the first argument (`params`) to the `canLoad` method.

```typescript
import { Params } from '@aurelia/router';
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
import { NavigationInstruction, Params } from '@aurelia/router';
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

```typescript
import { NavigationInstruction, Params } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'c-one',
  template: `c1 \${id}`,
})
export class ChildOne {
  private id: number;
  public canLoad(params: Params): boolean | NavigationInstruction {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id % 2 != 0)
      return { component: 'r2', params: { id: params.id } };
    this.id = id;
    return true;
  }
}
```

{% embed url="https://stackblitz.com/edit/router-lite-canload-routeid-nav-instruction?ctl=1&embed=1&file=src/child1.ts" %}

Note that you can also choose to return a sibling navigation instructions.
This can be done by returning an array of navigation instructions.

```typescript
import { NavigationInstruction, Params } from '@aurelia/router';
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
import { NavigationInstruction, Params, RouteNode } from '@aurelia/router';
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

This lifecycle hook can be utilized to perform setup; for example, fetching data from backend API etc.

All of the above code examples for `canLoad` can be used with `load` and will work the same with the exception of being able to return `true` or `false` boolean values to prevent the component being loaded.

One of the examples is refactored using `loading` hook that is shown below.

{% embed url="https://stackblitz.com/edit/router-lite-loading?ctl=1&embed=1&file=src/child1.ts" %}

Following is an additional example, that shows that you can use the `next.title` property to dynamically set the route title from the `loading` hook.

```typescript
import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'c-one',
  template: `c1 \${msg}`,
})
export class ChildOne implements IRouteViewModel {
  private msg: string;
  public loading(params: Params, next: RouteNode) {
    this.msg = `loaded with id: ${params.id}`;
    next.title = 'Child One';
  }
}
```

{% embed url="https://stackblitz.com/edit/router-lite-loading-title?ctl=1&embed=1&file=src/main.ts" %}

### Accessing parent route parameters

If a child component needs to inspect parameters defined by its parent route, inject `IRouteContext` and use its `parent` property inside the `loading` hook.

```ts
import { resolve } from 'aurelia';
import { IRouteContext, type Params } from '@aurelia/router';

export class ChildTwo {
  private readonly ctx = resolve(IRouteContext);

  loading(params: Params) {
    console.log('child params', params);
    console.log('parent params', this.ctx.parent?.params);
  }
}
```

See [Customize the routing context](./navigating.md#customize-the-routing-context) for more on working with `IRouteContext`.

## `canUnload`

The `canUnload` method is called when a user attempts to leave a routed view.
The first argument (`next`) of this hook is a `RouteNode` which provides information about the next route.

This hook is like the `canLoad` method but inverse.
You can return a `boolean false` from this method, to disallow the router to navigate away from the current component.

The following example shows that before navigating away, the user is shown a confirmation prompt.
If the user agrees to navigate way, then the navigation is performed.
The navigation is cancelled, if the user does not confirm.

```typescript
import { resolve } from 'aurelia';
import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { IPlatform } from '@aurelia/runtime-html';

export class ChildOne implements IRouteViewModel {

  private readonly platform: IPlatform = resolve(IPlatform);

  public canUnload(next: RouteNode, current: RouteNode): boolean {
    const from = current.computeAbsolutePath();
    const to = next.computeAbsolutePath();
    return this.platform.window.confirm(
      `Do you want to navigate from '${from}' to '${to}'?`
    );
  }
}
```

You can see this example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-canunload?ctl=1&embed=1&file=src/child1.ts" %}

## `unloading`

The `unloading` hook is called when the user navigates away from the current component.
The first argument (`next`) of this hook is a `RouteNode` which provides information about the next route.

This hook is like the `loading` method but inverse.

The following example shows that a `unloading` hook logs the event of unloading the component.

```typescript
public unloading(next: RouteNode): void {
  this.logger.log(
    `unloading for the next route: ${next.computeAbsolutePath()}`
  );
}
```

This can also be seen in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-unloading?ctl=1&embed=1&file=src/child2.ts" %}

## Order of invocations

For completeness it needs to be noted that the `canLoad` hook is invoked before `loading` and `canUnload` hook is invoked before `unloading`.
In the context of swapping two views/components it is as follows.

- `canUnload` hook (when present) of the current component is invoked.
- `canLoad` hook (when present) of the next component (assuming that the `canUnload` returned `true`) is invoked.
- `unloading` hook (when present) of the current component is invoked.
- `loading` hook (when present) of the current component is invoked.

Note that the last 2 steps may run in parallel, if the hooks are asynchronous.

## Order of invocations of component lifecycle hooks

The component [lifecycle hooks](../components/component-lifecycles.md) are invoked bottom-up. As an example, let us assume that we have the following constellation of components.

```html
<app-root>
  <component-one>
    <component-two>
    </component-two>
  </component-one>
</app-root>
```

In this case, the component lifecycle hooks are invoked in the following order.

1. component-two `attached`.
2. component-one `attached`.
3. app-root `attached`.

This is also the same for the router, except for the "application root" component. Tweaking the example above slightly, let us assume that we have the following constellation of components.

```html
<app-root>
  <routed-view>
    <component-one>
      <component-two>
      </component-two>
    </component-one>
  </routed-view>
</app-root>
```

In this case, the component lifecycle hooks are invoked in the following order.

1. app-root `attached`.
2. component-two `attached`.
3. component-one `attached`.
4. routed-view `attached`.

Note that the application root is attached before any other components are attached. This happens because the router starts loading the first route only after the app-root, and thereby the viewport(s) it is hosting, are fully activated/attached. In order to load a route, the router needs registered viewports. The registration process of a viewport only happens during the `attaching` phase of a viewport. More details on this topic, can be found in this [GitHub issue](https://github.com/aurelia/aurelia/issues/2019).

## Inspecting current route and query inside lifecycle hooks

Within lifecycle hooks like `canLoad`, `loading`, etc., you can also inspect the `RouteNode`:

```typescript
import { IRouteViewModel, RouteNode, Params } from '@aurelia/router';

export class Product implements IRouteViewModel {
  public loading(params: Params, next: RouteNode): void {
    const queryParam = next.queryParams.get('discount');
    const rawPath = next.computeAbsolutePath();
    console.log('Raw path is:', rawPath, 'and discount param is:', queryParam);
  }
}
```

If you prefer, you can also inject `ICurrentRoute` for a global view of the route, query, and title. Combine these approaches as you see fit for your `canLoad`, `loading`, etc.
