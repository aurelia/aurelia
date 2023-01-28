---
description: >-
  How to implement router "guards" into your applications to protect routes from
  direct access.
---

# Router hooks

Router hooks are pieces of code that can be invoked at the different stages of routing lifecycle.
In that sense, these hooks are similar to the [lifecycle hooks](./routing-lifecycle.md) of the route view-model.
The difference is that these hooks are shared among all the route view models.
Therefore, even though the hook signatures are similar to that of the [lifecycle hooks](./routing-lifecycle.md), these hooks are supplied with an [additional argument](#anatomy-of-a-lifecycle-hook) that is the view model instance.

{% hint style="info" %}
If you worked with Aurelia 1, you might know these by their previous name: router pipelines.
{% endhint %}

## Anatomy of a lifecycle hook

While lifecycle hooks are indeed their own thing independent of the components you are routing to, the functions are basically same as you would use inside of an ordinary component.

This is the contract for ordinary route lifecycle hooks for components:

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

And this is the contract for shared lifecycle hooks

```typescript
import { lifecycleHooks } from 'aurelia';
import { IRouteViewModel, Params, RouteNode, NavigationInstruction } from '@aurelia/router-lite';

@lifecycleHooks()
class MySharedHooks {
  loading(viewModel, params: Parameters, instruction: RoutingInstruction, navigation: Navigation);
  canLoad(viewModel, params: Parameters, instruction: RoutingInstruction, navigation: Navigation);
  load(viewModel, params: Params, instruction: RoutingInstruction, navigation: Navigation);
  canUnload(viewModel, instruction: RoutingInstruction, navigation: Navigation);
  unloading(viewModel, instruction: RoutingInstruction, navigation: Navigation);
  unload(viewModel, instruction: RoutingInstruction, navigation: Navigation);
  canLoad?(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode,
    current: RouteNode | null
  ): boolean
    | NavigationInstruction
    | NavigationInstruction[]
    | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  loading?(viewModel: IRouteViewModel, params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
  canUnload?(viewModel: IRouteViewModel, next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
  unloading?(viewModel: IRouteViewModel, next: RouteNode | null, current: RouteNode): void | Promise<void>;
}
```

The only difference is the addition of the first `viewModel` parameter. This comes in handy when you need the component instance since the `this` keyword won't give you access to the component instance like it would in ordinary component methods.

## Example: Authentication and Authorization

Before starting with the involved details of the shared/global lifecycle hooks, let us first create an example lifecycle hook.
To this end, we consider the typical use-case of authorization; that is restricting certain routes to users with certain permission claims.

{% hint style="info" %}
The example we are going to build in this section is just a toy example.
For your production code, perform due diligence to evaluate the security threats possible.
{% endhint %}

For this example, we will create two lifecycle hooks; one for authentication and another is for authorization.
However, before directly dive into that, let us briefly visit, how the routes are conigured.

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

Note that the [`data` property](./configuring-routes.md#advanced-route-configuration-options) of the route configuration option is used here to define the routes' permission claim.
These is used by the auth hooks later to determine whether to allow or disallow the navigation.
With that we are now ready to discuss the hooks.

The first hook will check if the current route is protected and there is a currently logged in user.
When there is no logged in user, it performs a redirect to login page.
This is shown below.

```typescript
// authentication-hook.ts
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
  public constructor(
    @IAuthenticationService private readonly authService: IAuthenticationService
  ) {}
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

The second hook will check if the current user has the permission claims to access the route.
Where the user does not satisfies the claims requirements the user is redirected to a forbidden page.
This is shown below.

```typescript
// authorization-hook
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
  public constructor(
    @IAuthenticationService private readonly authService: IAuthenticationService
  ) {}
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

Lastly, we need to register these two hooks to the DI container to bring those into action.

```typescript
// main.ts
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

Note that the authentication hook is registered first and then the authorization hook.
This ensures that the authentication hook is invoked before than the authorization hook.
And that's the crux of it.
You can see this example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-lifecycle-hooks-auth?ctl=1&embed=1&file=src/my-app.ts" %}

### Creating a custom lifecycle hook

```typescript
import Aurelia, { lifecycleHooks } from 'aurelia';
import { IRouteViewModel, Params, RouteNode, RouterConfiguration } from '@aurelia/router-lite';

@lifecycleHooks()
class NoopAuthHandler {
  canLoad(viewModel: IRouteViewModel, params: Params, next: RouteNode, current: RouteNode | null) {
    return true;
  }
}

Aurelia
    .register(RouterConfiguration, NoopAuthHandler)
    .app(component)
    .start();
```

Shared lifecycle hook logic can be defined by implementing a router lifecycle hook on a class with the `@lifecycleHooks()` decorator. This hook will be invoked for each component where this class is available as a dependency. This can be registered either via a global registration or via one or more component-local registrations, similar to how e.g. custom elements and value converters are registered.

In the example above we register `NoopAuthHandler` globally which means it will be invoked for each routed component and return `true` each time, effectively changing nothing. As the global lifecycle hooks are run for each component, it is recommended to use those sparsely.

{% hint style="warning" %}
Because lifecycle hooks are invoked for each component, it is considered best practice to ensure that you name your lifecycle hooks appropriately, especially if you're working in a team where developers might not be aware of hooks modifying global component lifecycle behaviors.
{% endhint %}

### Restricting hooks to specific components

When dealing with route hooks, you might only want to apply those to specific components. Imagine an authentication workflow where you would want to allow unauthenticated users to access your login or contact page.

To do this, we can specify our route hook as a dependency in the component itself via the `static dependencies` property which takes an array of one or more dependencies.

```typescript
import { IRouteableComponent } from "@aurelia/router";
import { AuthHook } from './route-hook';

export class SettingsPage implements IRouteableComponent {
    static dependencies = [ AuthHook ];
}
```

Whenever someone tries to route to the `SettingsPage` component, they will trigger the authentication hook you created. This per-component approach allows you to target the needed components you want behind a route hook.

### Multiple hooks per component/class

Shared lifecycle hooks run in parallel with (but are started _before_) component instance hooks, and multiple of the same kind can be applied per component. When multiple hooks are registered per component they are invoked in registration order.

```typescript
import { lifecycleHooks } from 'aurelia';

@lifecycleHooks()
class Log1 {
    async load() {
        console.log('1.start');
        await Promise.resolve();
        console.log('1.end');
    }
}

@lifecycleHooks()
class Log2 {
    async load() {
        console.log('2.start');
        await Promise.resolve();
        console.log('2.end');
    }
}

export class MyComponent {
    static dependencies = [Log1, Log2];

    async load() {
        console.log('3.start');
        await Promise.resolve();
        console.log('3.end');
    }
}

// Will log, in order:
// 1.start
// 2.start
// 3.start
// 1.end
// 2.end
// 3.end
```

It is also permitted to define more than one hook per shared hook class:

```typescript
@lifecycleHooks()
export class LifecycleLogger {
    canLoad(viewModel, params, instruction, navigation) {
        console.log(`invoking canLoad on ${instruction.component.name}`);
        return true;
    }

    load(viewModel, params, instruction, navigation) {
        console.log(`invoking load on ${instruction.component.name}`);
    }
}
```
