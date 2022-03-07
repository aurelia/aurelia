---
description: >-
  How to implement router "guards" into your applications to protect routes from
  direct access.
---

# Route hooks

You might know router hooks as guards in other routers. Their role is to determine how components are loaded, they're pieces of code that are run in between.

The lifecycle hooks sharing API can be used to define reusable hook logic. In principle there is nothing new that needs to be learned: their behavior is the same as described in [Lifecycle Hooks](router-hooks.md#lifecycle-hooks) with the only difference that the view model instance is added as the first parameter.

If you worked with Aurelia 1, you might know these by their previous name: router pipelines.

### Creating a custom lifecycle hook

```typescript
import Aurelia, { lifecycleHooks, Params, RouteNode, RouterConfiguration } from 'aurelia';

@lifecycleHooks()
class NoopAuthHandler {
    canLoad(viewModel, params: Params, next: RouteNode, current: RouteNode) { return true; }
}

Aurelia
    .register(RouterConfiguration, NoopAuthHandler)
    .app(component)
    .start();
```

Shared lifecycle hook logic can be defined by implementing a router lifecycle hook on a class with the `@lifecycleHooks()` decorator. This hook will be invoked for each component where this class is available as a dependency. This can be either via a global registration or via one or more component-local registrations, similar to how e.g. custom elements and value converters are registered.

In the example above we register `NoopAuthHandler` globally which means it will be invoked for each routed component and return `true` each time, effectively changing nothing. Please note that it is not recommended that you use global lifecycle hooks when you can avoid them, as they are run for each component.

{% hint style="warning" %}
Because lifecycle hooks are invoked for each component, it is considered best practice to ensure that you name your lifecycle hooks appropriately, especially if you're working in a team where developers might not be aware of hooks modifying global component lifecycle behaviors.
{% endhint %}

### Anatomy of a lifecycle hook

While lifecycle hooks are indeed their own thing independent of the components you are routing to, the functions are basically same as you would use inside of an ordinary component.

This is the contract for ordinary route lifecycle hooks for components:

```typescript
import { IRouteViewModel, Params, RouteNode } from "aurelia";

class MyComponent implements IRouteViewModel {
  canLoad(params: Params, next: RouteNode, current: RouteNode);
  load(params: Params, next: RouteNode, current: RouteNode);
  canUnload(next: RouteNode, current: RouteNode);
  unload(next: RouteNode, current: RouteNode);
}
```

And this is the contract for shared lifecycle hooks

```typescript
import { Params, RouteNode } from "aurelia";

class MySharedHooks {
  canLoad(viewModel, params: Params, next: RouteNode, current: RouteNode);
  load(viewModel, params: Params, next: RouteNode, current: RouteNode);
  canUnload(viewModel, next: RouteNode, current: RouteNode);
  unload(viewModel, next: RouteNode, current: RouteNode);
}
```

The only difference is the addition of the first `viewModel` parameter. This comes in handy when you need the component instance since the `this` keyword won't give you access to the component instance like it would in ordinary component methods.

### Restricting hooks to specific components

When dealing with route hooks, you might only want to apply those to specific components. Imagine an authentication workflow where you would want to allow unauthenticated users to access your login or contact page.&#x20;

To do this, we can specify our route hook as a dependency in the component itself via the `static dependencies` property which takes an array of one or more dependencies.

```typescript
import { IRouteViewModel } from "aurelia";
import { AuthHook } from './route-hook';

export class SettingsPage implements IRouteViewModel {
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
    canLoad(viewModel, params, next, current) {
        console.log(`invoking canLoad on ${next.component.name}`);
        return true;
    }
    
    load(viewModel, params, next, current) {
        console.log(`invoking load on ${next.component.name}`);
    }
}
```

## Authentication using lifecycle hooks

One of the most common scenarios you will use router lifecycle hooks for is adding authentication to your applications. Whether you use a third-party service such as Auth0 or Firebase Auth, or your own authentication implementation, the process is mostly the same.

In this example, we will create a service class that will contain our methods for logging in and out. We will also create a hook that will do the checks when our route loads.

In a real application, your login and logout methods would obtain a token and authentication data. For the purposes of this example, we have an if statement which checks for a specific username and password being supplied.

{% hint style="warning" %}
This is only an example. Please use this code as a guide for creating your own solutions. Never blindly copy and paste code without taking the time to understand it first, especially when it comes to authentication.
{% endhint %}

{% tabs %}
{% tab title="src/router-hooks/auth-hook.ts" %}
```typescript
import { lifecycleHooks, Params, RouteNode } from 'aurelia';
import { Api } from './services/api';

@lifecycleHooks()
export class AuthHook {

    constructor(readonly api: Api) {
    }
    
    canLoad(viewModel, params: Params, next: RouteNode, current: RouteNode) {
        const canProceed = next.data.isAuth && this.auth.isLoggedIn;
        
        if (canProceed) {
            return true;
        }
        
        return 'no-access';
    }
}
```
{% endtab %}

{% tab title="src/services/auth-service.ts" %}
```typescript
import { IRouter} from '@aurelia/router';

export class AuthService {
    isLoggedIn = false;
    private _user = null;

    constructor(@IRouter private router: IRouter) {

    }

    async login(username: string, password: string): Promise<void> {
        if (username === 'user' && password === 'password') {
            this.isLoggedIn = true;

            this._user = {
                username: 'user',
                email: 'user@domain.com'
            };
        } else {
            this.router.load('/login');
        }
    }

    logout(redirect = null): void {
        this.isLoggedIn = false;
        this._user = null;

            if (redirect) {
                this.router.load(redirect);
            }
    }

    getCurrentUser() {
        return this._user;
    }
}
```
{% endtab %}

{% tab title="settings-page.ts" %}
```typescript
import { IRouteViewModel } from "aurelia";

// Import our hook
import { AuthHook } from './router-hooks/auth-hook'; 

export class SettingsPage implements IRouteViewModel {
    // Register the hook with this component
    
    static dependencies = [AuthHook];
    
    static data = { isAuth: true };
}
```
{% endtab %}

{% tab title="login-page.ts" %}
```typescript
import { IRouteViewModel } from "aurelia";

// Our login component view model has no registered hooks,
// so it will always be accessible
export class LoginPage implements IRouteViewModel {}
```
{% endtab %}
{% endtabs %}

This code will run for all routed components and if the component has a `isAuth` data property and the `isLoggedIn` property is not truthy, then we will redirect the user to a route called `no-access` which we did not create in this example.
