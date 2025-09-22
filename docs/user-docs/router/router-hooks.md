---
description: >-
  How to implement router hooks into your applications to protect routes,
  control navigation, and implement cross-cutting concerns like authentication and authorization.
---

# Router Hooks

{% hint style="warning" %}
**Important Security Note:** Router hooks provide client-side route protection and should never be your only line of defense. Always implement proper authentication and authorization on your server-side APIs, as client-side code can be bypassed or manipulated.
{% endhint %}

Router hooks are pieces of code that can be invoked at different stages of the routing lifecycle to control navigation flow. If you're familiar with Angular or other frameworks, router hooks serve the same purpose as "router guards" - they allow you to intercept and control navigation. In Aurelia 2, these are called router hooks and they enable you to:

- **Authenticate users** before accessing protected routes
- **Authorize access** based on user permissions
- **Prevent navigation** from forms with unsaved changes
- **Load data** required before displaying a component
- **Transform route parameters** or implement custom logic

In Aurelia 2, these hooks are similar to the [lifecycle hooks](./routing-lifecycle.md) of individual routed view models, but they are shared among multiple components and provide an additional `viewModel` parameter for access to the component instance.

{% hint style="info" %}
If you worked with Aurelia 1, you might know these by their previous name: router pipelines.
{% endhint %}

## Types of Router Hooks

Aurelia 2 provides four types of router hooks (similar to router guards in other frameworks) that correspond to different stages of the navigation lifecycle:

### canLoad
**Purpose:** Controls whether a component can be loaded (activated) for a route.
**Use Cases:**
- Authentication checks
- Authorization based on user permissions
- Conditional routing based on application state
- Redirecting users to login or error pages

**Returns:** `boolean`, `NavigationInstruction`, `NavigationInstruction[]`, or Promise of these types

### loading
**Purpose:** Performs actions after navigation is confirmed but before the component is fully loaded.
**Use Cases:**
- Loading required data
- Setting up application state
- Showing loading indicators
- Preparing resources

**Returns:** `void` or `Promise<void>`

### canUnload
**Purpose:** Controls whether the current component can be unloaded (deactivated).
**Use Cases:**
- Preventing navigation away from unsaved forms
- Confirming destructive actions
- Validating required fields before leaving

**Returns:** `boolean` or `Promise<boolean>`

### unloading
**Purpose:** Performs cleanup actions before the component is unloaded.
**Use Cases:**
- Saving draft data
- Cleaning up subscriptions
- Logging analytics events
- Performing final validations

**Returns:** `void` or `Promise<void>`

## Anatomy of a lifecycle hook

Shared lifecycle hook logic can be defined by implementing one of the router lifecycle hooks (`canLoad`, `loading` etc.) on a class with the `@lifecycleHooks()` decorator. This hook will be invoked for each component where this class is available as a dependency.

While the router hooks are indeed independent of the components you are routing to, the functions are basically the same as you would use inside of an ordinary component.

The component-level hook signatures are identical to the ones described in [Routing lifecycle hooks](./routing-lifecycle.md). Router hooks reuse those signatures but execute outside the component, letting you centralise cross-cutting policies.

```typescript
import { lifecycleHooks } from 'aurelia';
import {
  IRouteViewModel,
  INavigationOptions,
  Params,
  RouteNode,
  NavigationInstruction
} from '@aurelia/router';

@lifecycleHooks()
class MySharedHooks {
  canLoad?(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: INavigationOptions
  ): boolean
    | NavigationInstruction
    | NavigationInstruction[]
    | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  loading?(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: INavigationOptions
  ): void | Promise<void>;
  canUnload?(
    viewModel: IRouteViewModel,
    next: RouteNode | null,
    current: RouteNode,
    options: INavigationOptions
  ): boolean | Promise<boolean>;
  unloading?(
    viewModel: IRouteViewModel,
    next: RouteNode | null,
    current: RouteNode,
    options: INavigationOptions
  ): void | Promise<void>;
}
```

The only difference is the addition of the first `viewModel` parameter. This comes in handy when you need the component instance since the `this` keyword won't give you access to the component instance like it would in ordinary instance hooks.

## Quick Start Guide

The fastest way to create a router hook is to implement a class with the `@lifecycleHooks()` decorator:

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IRouteViewModel, INavigationOptions, Params, RouteNode } from '@aurelia/router';

@lifecycleHooks()
export class AuthenticationHook {
  canLoad(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: INavigationOptions
  ): boolean {
    // Simple authentication check
    const isLoggedIn = !!localStorage.getItem('authToken');

    // Optional: Log navigation direction
    console.log(`Navigation direction: ${options.isBack ? 'back' : 'forward'}`);

    return isLoggedIn;
  }
}
```

Then register it in your main configuration:

```typescript
import { RouterConfiguration } from '@aurelia/router';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { AuthenticationHook } from './authentication-hook';

const au = new Aurelia();
au.register(
  StandardConfiguration,
  RouterConfiguration,
  AuthenticationHook  // Register the hook globally
);
```

## Comprehensive Examples

### Example 1: Authentication and Authorization

This example demonstrates the typical use-case of protecting routes with authentication and authorization checks.

{% hint style="info" %}
The examples in this section are simplified for illustration. In production code, perform due diligence to evaluate potential security threats and always validate permissions on the server side.
{% endhint %}

For this example, we will create two lifecycle hooks; one for authentication and another is for authorization.
However, before directly dive into that, let us briefly visit, how the routes are configured.

{% code title="my-app.ts" %}
```typescript
import { route } from '@aurelia/router';
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
} from '@aurelia/router';
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
} from '@aurelia/router';
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
import { RouterConfiguration } from '@aurelia/router';
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

### Example 2: Form Hook (Preventing Data Loss)

This example shows how to prevent users from accidentally leaving a form with unsaved changes:

```typescript
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IRouteViewModel, RouteNode } from '@aurelia/router';

interface IFormViewModel extends IRouteViewModel {
  hasUnsavedChanges?: boolean;
  isDirty?: boolean;
}

@lifecycleHooks()
export class FormHook {
  canUnload(
    viewModel: IFormViewModel,
    next: RouteNode | null,
    current: RouteNode
  ): boolean | Promise<boolean> {
    // Check if the component has unsaved changes
    if (viewModel.hasUnsavedChanges || viewModel.isDirty) {
      // Show confirmation dialog
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }

  unloading(
    viewModel: IFormViewModel,
    next: RouteNode | null,
    current: RouteNode
  ): void {
    // Save draft data to localStorage before leaving
    if (viewModel.hasUnsavedChanges) {
      const formData = (viewModel as any).getFormData?.();
      if (formData) {
        localStorage.setItem(`draft_${current.computeAbsolutePath()}`, JSON.stringify(formData));
        console.log('Draft saved before navigation');
      }
    }
  }
}
```

### Example 3: Data Loading Hook

This example demonstrates loading required data before the component is displayed:

```typescript
import { resolve } from 'aurelia';
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';

interface IDataService {
  loadUserProfile(userId: string): Promise<any>;
  loadUserPermissions(userId: string): Promise<string[]>;
}

@lifecycleHooks()
export class DataLoadingHook {
  private readonly dataService: IDataService = resolve(IDataService);

  async loading(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode
  ): Promise<void> {
    // Show loading state
    (viewModel as any).isLoading = true;

    try {
      // Load required data based on route parameters
      const userId = params.id as string;
      if (userId) {
        const [profile, permissions] = await Promise.all([
          this.dataService.loadUserProfile(userId),
          this.dataService.loadUserPermissions(userId)
        ]);

        // Attach data to the view model
        (viewModel as any).userProfile = profile;
        (viewModel as any).userPermissions = permissions;
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      (viewModel as any).loadError = error;
    } finally {
      (viewModel as any).isLoading = false;
    }
  }
}
```

### Example 4: Role-Based Authorization Hook

This example shows how to implement fine-grained role-based access control:

```typescript
import { resolve } from 'aurelia';
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IRouteViewModel, Params, RouteNode, NavigationInstruction } from '@aurelia/router';

interface IUserService {
  getCurrentUser(): { roles: string[]; permissions: string[] } | null;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}

@lifecycleHooks()
export class RoleHook {
  private readonly userService: IUserService = resolve(IUserService);

  canLoad(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode
  ): boolean | NavigationInstruction {
    const requiredRoles = next.data?.roles as string[];
    const requiredPermissions = next.data?.permissions as string[];
    const fallbackRoute = next.data?.fallbackRoute as string;

    const user = this.userService.getCurrentUser();
    if (!user) {
      return 'login';
    }

    // Check required roles
    if (requiredRoles?.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => this.userService.hasRole(role));
      if (!hasRequiredRole) {
        return fallbackRoute || 'forbidden';
      }
    }

    // Check required permissions
    if (requiredPermissions?.length > 0) {
      const hasRequiredPermission = requiredPermissions.some(permission =>
        this.userService.hasPermission(permission)
      );
      if (!hasRequiredPermission) {
        return fallbackRoute || 'forbidden';
      }
    }

    return true;
  }
}
```

Usage with route configuration:

```typescript
@route({
  routes: [
    {
      path: 'admin',
      component: AdminDashboard,
      data: {
        roles: ['admin', 'super-admin'],
        fallbackRoute: 'unauthorized'
      },
    },
    {
      path: 'user-management',
      component: UserManagement,
      data: {
        permissions: ['users.read', 'users.write'],
        fallbackRoute: 'access-denied'
      },
    },
  ],
})
export class MyApp {}
```

### Example 5: Navigation Direction-Aware Animations

You can leverage the `isBack` property from the `options: INavigationOptions` parameter in the lifecycle hooks to animate page transitions for forward and backward navigation.
The `isBack` property will be `true` if the navigation is a backward navigation (e.g., user clicked the browser's back button) and `false` for forward navigation.

Here's a comprehensive example that implements smooth page transitions using AnimeJS, with different animations based on navigation direction:

```typescript
import { lifecycleHooks } from 'aurelia';
import { INavigationOptions, IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import { animate, eases } from 'animejs';
import { IController } from '@aurelia/runtime-html';

const durationMs = 900;

// Page entering animations
const enterFromRight = (el: HTMLElement) =>
  animate(el, {
    translateX: ['150%', '0%'],
    duration: durationMs,
    ease: eases.outCubic,
  });

const enterFromLeft = (el: HTMLElement) =>
  animate(el, {
    translateX: ['-150%', '0%'],
    duration: durationMs,
    ease: eases.outCubic,
  });

// Page exiting animations
const exitToRight = (el: HTMLElement) =>
  animate(el, {
    translateX: ['0%', '150%'],
    duration: durationMs,
    ease: eases.inCubic,
  });

const exitToLeft = (el: HTMLElement) =>
  animate(el, {
    translateX: ['0%', '-150%'],
    duration: durationMs,
    ease: eases.inCubic,
  });

@lifecycleHooks()
export class AnimationHooks {
  private element: HTMLElement;
  private isBack: boolean = false;

  public created(vm: IRouteViewModel, controller: IController): void {
    this.element = controller.host;
  }

  public loading(
    vm: IRouteViewModel,
    params: Params,
    next: RouteNode,
    current: RouteNode,
    options: INavigationOptions
  ): void | Promise<void> {
    // Store the navigation direction for use in the attaching hook
    this.isBack = options.isBack;
  }

  public async unloading(
    vm: IRouteViewModel,
    next: RouteNode,
    current: RouteNode,
    options: INavigationOptions
  ): Promise<void> {
    // Apply exit animation based on navigation direction
    // Forward navigation: exit to the left
    // Backward navigation: exit to the right
    await (options.isBack ? exitToRight(this.element).then() : exitToLeft(this.element).then());
  }

  public attaching(): Promise<void> {
    // Apply enter animation based on navigation direction
    // Forward navigation: enter from the right
    // Backward navigation: enter from the left
    return this.isBack ? enterFromLeft(this.element) : enterFromRight(this.element);
  }
}
```

To use these animation hooks, register them as dependencies on your routed components:

```typescript
import { customElement } from '@aurelia/runtime-html';
import { AnimationHooks } from './animation-hooks';
import template from './home.html';

@customElement({
  name: 'home',
  template,
  dependencies: [AnimationHooks]
})
export class Home {}
```

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
import { IRouteViewModel, Params, RouteNode } from '@aurelia/router';
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

## Reading raw route or query parameters in hooks

Here is a small snippet added to the `canLoad` or `loading` hook, demonstrating how to read query parameters. The `next` argument contains the `queryParams` which can be read directly:

```typescript
import { lifecycleHooks, IRouteViewModel, RouteNode } from '@aurelia/router';

@lifecycleHooks()
export class QueryReadingHooks {
  public canLoad(
    viewModel: IRouteViewModel,
    params: Record<string, unknown>,
    next: RouteNode
  ): boolean {
    // e.g. /product/42?foo=bar
    console.log('Raw route path:', next.computeAbsolutePath());
    console.log('Query parameter "foo":', next.queryParams.get('foo'));
    return true;
  }
}
```

You can also do similar reading in `loading`, `canUnload`, etc. This approach can be combined with injecting `ICurrentRoute` if your logic is broader than a single hook.

## Best Practices

### Security Considerations

1. **Never rely solely on client-side hooks for security**: Always validate permissions on the server side
2. **Sanitize route parameters**: Validate and sanitize any data extracted from route parameters
3. **Handle authentication tokens securely**: Use secure storage and validate tokens on each request
4. **Implement proper error handling**: Gracefully handle authentication/authorization failures

### Performance Optimizations

1. **Cache permission checks**: Avoid repeated API calls for the same user permissions
2. **Use async hooks judiciously**: Only make hooks async when necessary, as they can slow navigation
3. **Implement hook preemption**: Design hooks to fail fast when conditions aren't met
4. **Minimize hook logic**: Keep hook logic simple and focused on their specific purpose

### Code Organization

1. **Separate concerns**: Create focused hooks for specific purposes (auth, form validation, data loading)
2. **Use TypeScript interfaces**: Define clear interfaces for your view models to improve type safety
3. **Follow naming conventions**: Use descriptive names like `AuthenticationHook`, `FormHook`, etc.
4. **Document hook behavior**: Comment complex hook logic and document expected return values

### Example: Combined Hook Pattern

For complex applications, you might want to combine multiple concerns in a single hook:

```typescript
import { resolve } from 'aurelia';
import { lifecycleHooks } from '@aurelia/runtime-html';
import { IRouteViewModel, Params, RouteNode, NavigationInstruction } from '@aurelia/router';

@lifecycleHooks()
export class ComprehensiveHook {
  private readonly authService = resolve(IAuthService);
  private readonly dataService = resolve(IDataService);

  async canLoad(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode
  ): Promise<boolean | NavigationInstruction> {
    // 1. Check authentication
    if (!this.authService.isAuthenticated()) {
      return `login?returnUrl=${encodeURIComponent(next.computeAbsolutePath())}`;
    }

    // 2. Check authorization
    const requiredPermissions = next.data?.permissions as string[];
    if (requiredPermissions && !this.authService.hasPermissions(requiredPermissions)) {
      return 'forbidden';
    }

    // 3. Validate route parameters
    if (params.id && !this.isValidId(params.id as string)) {
      return 'not-found';
    }

    return true;
  }

  async loading(
    viewModel: IRouteViewModel,
    params: Params,
    next: RouteNode
  ): Promise<void> {
    // Pre-load any required data
    if (params.id) {
      try {
        const data = await this.dataService.loadById(params.id as string);
        (viewModel as any).data = data;
      } catch (error) {
        (viewModel as any).loadError = error;
      }
    }
  }

  private isValidId(id: string): boolean {
    return /^[a-zA-Z0-9-_]+$/.test(id) && id.length > 0 && id.length <= 50;
  }
}
```

This pattern allows you to handle authentication, authorization, validation, and data loading in a single, well-organized hook.

## Common Troubleshooting

### Hook Not Executing
- Ensure the hook is properly registered in your DI container
- Check that the `@lifecycleHooks()` decorator is applied
- Verify the hook is in the correct registration order

### Infinite Redirect Loops
- Ensure redirect targets don't have hooks that redirect back
- Implement proper base cases in your hook logic
- Use debugging tools to trace navigation flow

### Performance Issues
- Avoid heavy computation in synchronous hooks
- Cache frequently accessed data (user permissions, configuration)
- Consider using local dependencies instead of global registration for rarely-used hooks

### Type Safety Issues
- Define proper interfaces for your view models
- Use generics when creating reusable hooks
- Leverage TypeScript's strict type checking
