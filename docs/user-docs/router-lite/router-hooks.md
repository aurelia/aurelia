---
description: >-
  How to implement router "guards" into your applications to protect routes from
  direct access.
---

# Router hooks

Router hooks are pieces of code that can be invoked at the different stages of routing lifecycle.
In that sense, these hooks are similar to the [lifecycle hooks](./routing-lifecycle.md) of the routed view models.
The difference is that these hooks are shared among multiple routed view models.
Therefore, even though the hook signatures are similar to that of the [lifecycle hooks](./routing-lifecycle.md), these hooks are supplied with an [additional argument](#anatomy-of-a-lifecycle-hook) that is the view model instance.

{% hint style="info" %}
If you worked with Aurelia 1, you might know these by their previous name: router pipelines.
{% endhint %}

## Anatomy of a lifecycle hook

Shared lifecycle hook logic can be defined by implementing one of the router lifecycle hooks (`canLoad`, `loading` etc.) on a class with the `@lifecycleHooks()` decorator. This hook will be invoked for each component where this class is available as a dependency.

While the router hooks are indeed independent of the components you are routing to, the functions are basically the same as you would use inside of an ordinary component.

This is the contract for ordinary route lifecycle hooks for components:

```typescript
import {
  IRouteViewModel,
  Params,
  RouteNode,
  NavigationInstruction,
} from '@aurelia/router-lite';

export class MyComponent implements IRouteViewModel {
  canLoad?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null
  ): boolean
    | NavigationInstruction
    | NavigationInstruction[]
    | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  loading?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null
  ): void | Promise<void>;
  canUnload?(
    next: RouteNode | null,
    current: RouteNode
  ): boolean | Promise<boolean>;
  unloading?(
    next: RouteNode | null,
    current: RouteNode
  ): void | Promise<void>;
}
```

And the following is the contract for shared lifecycle hooks.

```typescript
import { lifecycleHooks } from 'aurelia';
import {
  IRouteViewModel,
  Params,
  RouteNode,
  NavigationInstruction
} from '@aurelia/router-lite';

@lifecycleHooks()
class MySharedHooks {
  canLoad?(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode,
    current: RouteNode | null
  ): boolean
    | NavigationInstruction
    | NavigationInstruction[]
    | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  loading?(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode,
    current: RouteNode | null
  ): void | Promise<void>;
  canUnload?(
    viewModel: IRouteViewModel,
    next: RouteNode | null,
    current: RouteNode
  ): boolean | Promise<boolean>;
  unloading?(
    viewModel: IRouteViewModel,
    next: RouteNode | null,
    current: RouteNode
  ): void | Promise<void>;
}
```

The only difference is the addition of the first `viewModel` parameter. This comes in handy when you need the component instance since the `this` keyword won't give you access to the component instance like it would in ordinary instance hooks.

## Example: Authentication and Authorization

Before starting with the involved details of the shared/global lifecycle hooks, let us first create an example lifecycle hook.
To this end, we consider the typical use-case of authorization; that is restricting certain routes to users with certain permission claims.

{% hint style="info" %}
The example we are going to build in this section is just a toy example.
For your production code, perform due diligence to evaluate the potential security threats.
{% endhint %}

For this example, we will create two lifecycle hooks; one for authentication and another is for authorization.
However, before directly dive into that, let us briefly visit, how the routes are configured.

{% code title="my-app.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { Home } from './home';
import { About } from './about';
import { Login } from './login';
import { Forbidden } from './forbidden';
import { Restricted } from './restricted';

@route({
  routes: [
    { path: '', redirectTo: 'home' },
    {
      path: 'home',
      component: Home,
    },
    {
      path: 'login',
      component: Login,
    },
    {
      path: 'forbidden',
      component: Forbidden,
    },
    {
      path: 'about',
      component: About,
      data: {
        claim: { type: 'read', resource: 'foo' },
      },
    },
    {
      path: 'restricted',
      component: Restricted,
      data: {
        claim: { type: 'manage', resource: 'foo' },
      },
    },
  ],
})
export class MyApp {}
```
{% endcode %}

Note that the [`data` property](./configuring-routes.md#advanced-route-configuration-options) of the route configuration option is used here to define the routes' permission claim.
This is used by the auth hooks later to determine whether to allow or disallow the navigation.
With that we are now ready to discuss the hooks.

The first hook will check if the current route is protected by a claim and there is a currently logged in user.
When there is no logged in user, it performs a redirect to login page.
This is shown below.

{% code title="authentication-hook.ts" %}
```typescript
import { resolve } from 'aurelia';
import {
  IRouteViewModel,
  NavigationInstruction,
  Params,
  RouteNode,
} from '@aurelia/router-lite';
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IAuthenticationService } from './authentication-service';

@lifecycleHooks()
export class AuthenticationHook {
  private readonly authService: IAuthenticationService = resolve(IAuthenticationService)
  public canLoad(
    _viewmodel: IRouteViewModel,
    _params: Params,
    next: RouteNode
  ): boolean | NavigationInstruction {
    if (!next.data?.claim || this.authService.currentClaims != null)
      return true;
    // we add the current url to the return_url query to the login page,
    // so that login page can redirect to that url after successful login.
    return `login?return_url=${next.computeAbsolutePath()}`;
  }
}
```
{% endcode %}

The second hook will check if the current user has the permission claims to access the route.
Where the user does not satisfies the claims requirements the user is redirected to a forbidden page.
This is shown below.

{% code title="authorization-hook.ts" %}
```typescript
import { resolve } from 'aurelia';
import {
  IRouteViewModel,
  NavigationInstruction,
  Params,
  RouteNode,
} from '@aurelia/router-lite';
import { lifecycleHooks } from '@aurelia/runtime-html';
import { Claim } from './authentication-service';
import { IAuthenticationService } from './authentication-service';

@lifecycleHooks()
export class AuthorizationHook {
  private readonly authService: IAuthenticationService = resolve(IAuthenticationService)
  public canLoad(
    _viewmodel: IRouteViewModel,
    _params: Params,
    next: RouteNode
  ): boolean | NavigationInstruction {
    const claim = next.data?.claim as Claim;
    if (!claim) return true;
    if (this.authService.hasClaim(claim.type, claim.resource)) return true;
    return 'forbidden';
  }
}
```
{% endcode %}

Lastly, we need to register these two hooks to the DI container to bring those into action.

{% code title="main.ts" %}
```typescript
import { RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { AuthenticationHook } from './authentication-hook';
import { IAuthenticationService } from './authentication-service';
import { AuthorizationHook } from './authorization-hook';
import { MyApp as component } from './my-app';

(async function () {
  const host = document.querySelector<HTMLElement>('app');
  const au = new Aurelia();
  au.register(
    StandardConfiguration,
    RouterConfiguration,
    IAuthenticationService,

    // register the first lifecycle hook
    AuthenticationHook,
    // register the second lifecycle hook
    AuthorizationHook
  );
  au.app({ host, component });
  await au.start();
})().catch(console.error);
```
{% endcode %}

Note that the authentication hook is registered before the authorization hook.
This ensures that the authentication hook is invoked before than the authorization hook which is also semantically sensible.

{% hint style="info" %}
To know more about the order of invocation, please refer the respective [section](#order-of-invocations).
{% endhint %}

And that's the crux of it.
You can see this example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-lifecycle-hooks-auth?ctl=1&embed=1&file=src/my-app.ts" %}

Note that even though in the example we limit the the hooks to only `canLoad` method, more than one lifecycle methods/hooks can also be leveraged in a shared lifecycle hook (a class decorated by the `@lifecycleHooks()` decorator).

## Global registration vs local dependencies

The lifecycle hooks can be registered either globally (as it is done in the [previous example](#example-authentication-and-authorization) or as [local dependencies](../components/components.md#dependencies).

The globally registered lifecycle hooks are invoked for every components.
Thus, it is recommended to use those sparsely.
On the other hand, when a hook is registered as a dependency of a particular component, it is invoked only for that one component.

This is shown in the example below, where there are two globally registered hooks, which are invoked for every components.

{% embed url="https://stackblitz.com/edit/router-lite-globally-registered-hooks?ctl=1&embed=1&file=src/hooks.ts" %}

Note that the globally registered hooks in the example above do nothing significant other than logging the invocations.
This is shown below.

```typescript
import { ILogger, resolve } from '@aurelia/kernel';
import { IRouteViewModel, Params, RouteNode } from '@aurelia/router-lite';
import { lifecycleHooks } from '@aurelia/runtime-html';

@lifecycleHooks()
export class Hook1 {
  public static readonly scope = 'hook1';
  private readonly logger: ILogger = resolve(ILogger).scopeTo(Hook1.scope);

  public canLoad(_vm: IRouteViewModel, _params: Params, next: RouteNode): boolean {
    this.logger.debug(`canLoad '${next.computeAbsolutePath()}'`);
    return true;
  }
  public loading(_vm: IRouteViewModel, _params: Params, next: RouteNode) {
    this.logger.debug(`loading '${next.computeAbsolutePath()}'`);
  }
  public canUnload(_vm: IRouteViewModel, _next: RouteNode, current: RouteNode): boolean {
    this.logger.debug(`canUnload '${current.computeAbsolutePath()}'`);
    return true;
  }
  public unloading(_vm: IRouteViewModel, _next: RouteNode, current: RouteNode) {
    this.logger.debug(`unloading '${current.computeAbsolutePath()}'`);
  }
}

@lifecycleHooks()
export class Hook2 {
  public static readonly scope = 'hook2';
  private readonly logger: ILogger = resolve(ILogger).scopeTo(Hook1.scope);

  public canLoad(_vm: IRouteViewModel, _params: Params, next: RouteNode): boolean {
    this.logger.debug(`canLoad '${next.computeAbsolutePath()}'`);
    return true;
  }
  public loading(_vm: IRouteViewModel, _params: Params, next: RouteNode) {
    this.logger.debug(`loading '${next.computeAbsolutePath()}'`);
  }
  public canUnload(_vm: IRouteViewModel, _next: RouteNode, current: RouteNode): boolean {
    this.logger.debug(`canUnload '${current.computeAbsolutePath()}'`);
    return true;
  }
  public unloading(_vm: IRouteViewModel, _next: RouteNode, current: RouteNode) {
    this.logger.debug(`unloading '${current.computeAbsolutePath()}'`);
  }
}
```

The log entries are then enumerated on the view.
The following is one such example of log entries.

```log
2023-01-29T20:03:23.885Z [DBG hook1] canLoad ''
2023-01-29T20:03:23.887Z [DBG hook2] canLoad ''
2023-01-29T20:03:23.888Z [DBG hook1] loading ''
2023-01-29T20:03:23.888Z [DBG hook2] loading ''
2023-01-29T20:10:09.403Z [DBG hook1] canUnload ''
2023-01-29T20:10:09.407Z [DBG hook2] canUnload ''
2023-01-29T20:10:09.410Z [DBG hook1] canLoad 'c1/42'
2023-01-29T20:10:09.410Z [DBG hook2] canLoad 'c1/42'
2023-01-29T20:10:09.410Z [DBG hook1] unloading ''
2023-01-29T20:10:09.411Z [DBG hook2] unloading ''
2023-01-29T20:10:09.411Z [DBG hook1] loading 'c1/42'
2023-01-29T20:10:09.411Z [DBG hook2] loading 'c1/42'
```

You may get a different log depending on your test run.
However, it can still be clearly observed that both `hook1` and `hook2` are invoked for every components.
Depending on your use-case, that might not be optimal.

To achieve a granular control on the lifecycle hooks, you can register the hooks as the [`dependencies`](../components/components.md#dependencies) for individual routed view models.
This ensures that the lifecycle hooks are invoked only for the components where those are registered as dependencies.
This shown in the example below where there are three hooks, and one component has two hooks registered as `dependencies` and another component has only hook registered.

```typescript
// child1.ts
import { customElement } from '@aurelia/runtime-html';
import { Hook1, Hook3 } from './hooks';

@customElement({
  dependencies: [Hook1, Hook3],
})
export class ChildOne {}

// child2.ts
import { customElement } from '@aurelia/runtime-html';
import { Hook2 } from './hooks';

@customElement({
  dependencies: [Hook2],
})
export class ChildTwo {}
```

When `ChildOne` or `ChildTwo` is loaded or unloaded you can observe that only `Hook2` is invoked for `ChildTwo`, whereas both `Hook1` and `Hook2` are invoked for `ChildOne`.
Below is an example log from one of such test runs.

```log
2023-02-01T21:59:23.525Z [DBG hook2] canLoad 'c2/43'
2023-02-01T21:59:23.527Z [DBG hook2] loading 'c2/43'
2023-02-01T21:59:25.353Z [DBG hook2] canUnload 'c2/43'
2023-02-01T21:59:25.355Z [DBG hook1] canLoad 'c1/42'
2023-02-01T21:59:25.355Z [DBG hook3] canLoad 'c1/42'
2023-02-01T21:59:25.356Z [DBG hook2] unloading 'c2/43'
2023-02-01T21:59:25.356Z [DBG hook1] loading 'c1/42'
2023-02-01T21:59:25.357Z [DBG hook3] loading 'c1/42'
```

You can see the example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-hook-as-dependencies?ctl=1&embed=1&file=src/child1.ts" %}

You can of course choose to use both kind of registrations.
The following example shows that `Hook3` is registered globally and therefore is invoked for every components whereas `Hook1` is only invoked for `ChildOne` and `Hook2` is only invoked for `ChildTwo`.

{% embed url="https://stackblitz.com/edit/router-lite-hook-mixed-registration?ctl=1&embed=1&file=src/child1.ts" %}

## Preemption

When using multiple lifecycle hooks, if any hook returns a non-`true` value (either a `false` or a navigation instruction) from `canLoad` or `canUnload`, it preempts invocation of the other hooks in the routing pipeline.

This is shown in the following example.
The example shows that there are two hooks, namely `hook1` and `hook2`.
`hook1` return `false` if the path `c1` is navigated with a non-number and non-even number; for example it denies navigation to `c1/43` but allows `c1/42`.


You can see the example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-hooks-preemption?ctl=1&embed=1&file=src/hooks.ts" %}

If you run the example and try clicking the links, you can observe that once `hook1` returns `false`, `hook2` is not invoked.
One such example log is shown below.

```log
2023-02-02T19:12:51.503Z [DBG hook1] canLoad 'c1/42'
2023-02-02T19:12:51.505Z [DBG hook2] canLoad 'c1/42'
2023-02-02T19:12:51.506Z [DBG hook1] loading 'c1/42'
2023-02-02T19:12:51.506Z [DBG hook2] loading 'c1/42'
2023-02-02T19:12:55.287Z [DBG hook1] canUnload 'c1/42'
2023-02-02T19:12:55.288Z [DBG hook2] canUnload 'c1/42'
2023-02-02T19:12:55.288Z [DBG hook1] canLoad 'c1/43'
```

## Order of invocations

The thumb rule is that the hooks are invoked in the order they are registered.
That is if some `Hook1` is registered before `Hook2` in DI then `Hook1` will be invoked before the `Hook2`.
You can see this in the example of [globally registered hooks](https://stackblitz.com/edit/router-lite-globally-registered-hooks?ctl=1&embed=1&file=src/hooks.ts).

That is also true, when registering hooks as one of the `dependencies` for a custom element.
You can see this in the example of [hooks as dependencies](https://stackblitz.com/edit/router-lite-hook-as-dependencies?ctl=1&embed=1&file=src/child1.ts).

When using both globally registered hooks as well as local dependencies, the global hooks are invoked before the locally registered hooks.
You can see this in action in [this example](https://stackblitz.com/edit/router-lite-hook-mixed-registration?ctl=1&embed=1&file=src/child1.ts).

Lastly, the shared lifecycle hooks are invoked before the instance lifecycle hooks.
