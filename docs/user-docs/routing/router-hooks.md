---
description: >-
  How to implement router "guards" into your applications to protect routes from
  direct access.
---

# Shared Lifecycle Hooks

{% hint style="info" %}
`Please note that we currently have an interim router implementation and that some (minor) changes to application code might be required when the original router is added back in.`
{% endhint %}

The lifecycle hooks sharing API can be used to define reusable hook logic. In principle there is nothing new that needs to be learned: their behavior is the same as described in [Lifecycle Hooks](lifecycle-hooks.md) with the only difference that the view model instance is added as the first parameter.

{% hint style="success" %}
**What you will learn in this section**

* How to define shared hook logic
* How to specify which components use the shared hook logic
* How to implement authentication using shared hooks
{% endhint %}

## A Basic Example

```typescript
import Aurelia, { RouterConfiguration, lifecycleHooks } from 'aurelia';

@lifecycleHooks()
class NoopAuthHandler {
    canLoad(vm, params, next, current) { return true; }
}

Aurelia
    .register(RouterConfiguration, NoopAuthHandler)
    .app(component)
    .start();
```

Shared lifecycle hook logic can be defined by implementing a router lifecycle hook on a class with the `@lifecycleHooks()` decorator. This hook will be invoked for each component where this class is available as a dependency. This can be either via a global registration or via one or more component-local registrations, similar to how e.g. custom elements and value converters are registered.

In the example above we register `NoopAuthHandler` globally which means it will be invoked for each routed component and return `true` each time, effectively changing nothing.

## The viewModel parameter

This is the contract for ordinary route lifecycle hooks for components:

```typescript
class MyComponent {
  canLoad(params, next, current);
  load(params, next, current);
  canUnload(next, current);
  unload(next, current);
}
```

And this is the contract for shared lifecycle hooks

```typescript
class MySharedHooks {
  canLoad(viewModel, params, next, current);
  load(viewModel, params, next, current);
  canUnload(viewModel, next, current);
  unload(viewModel, next, current);
}
```

The only difference is the addition of the first `viewModel` parameter. This comes in handy when you need the component instance, since the `this` keyword won't give you access to the component instance like it would in ordinary component methods.

## Specifying the applicable components

A simple way to narrow down which components a hook should be applied to, is via conditionals inside the hook itself:

```typescript
import Aurelia, { RouterConfiguration, lifecycleHooks } from 'aurelia';

@lifecycleHooks()
class AuthHandler {
    canLoad(vm, params, next, current) {
        switch (next.component.name) {
            case 'home':
            case 'login':
                return true;
            default:
                return this.isAuthenticated();
            
        }
    }
    
    isAuthenticated() {
        return true; // auth magic here
    }
}

Aurelia
    .register(RouterConfiguration, AuthHandler)
    .app(component)
    .start();
```

While this works fine for many common scenarios, it makes certain types of static analysis impossible, for example:

* Webpack won't be able to tree-shake or extract common chunks properly
* The IDE can't resolve component references via strings - you lose a degree of type-safety as well as various auto-refactoring capabilities

In short, this approach does not scale very well in larger-scale projects with potentially dozens of these shared classes. A more scalable approach is to import the shared lifecycle hooks classes where you need them and add them to the `dependencies` of the dependent components, like so:

```typescript
import { AuthHandler } from './auth';

export class SettingsPage {
    static dependencies = [AuthHandler];
}
```

Now the `AuthHandler`'s `canLoad` method will only be invoked for the `SettingsPage` component.

## Multiple hooks per component/class

Shared lifecycle hooks run in parallel with \(but are started _before_\) component instance hooks, and multiple of the same kind can be applied per component. When multiple hooks are registered per component they are invoked in registration order.

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
    }
    load(viewModel, params, next, current) {
        console.log(`invoking load on ${next.component.name}`);
    }
    canUnload(viewModel, next, current) {
        console.log(`invoking canUnload on ${current.component.name}`);
    }
    unload(viewModel, next, current) {
        console.log(`invoking unload on ${current.component.name}`);
    }
}
```

## Authentication

One of the most common scenarios you will use router hooks for is adding authentication to your applications. Whether you use a third-party service such as Auth0 or Firebase Auth, or your own authentication implementation, the process is mostly the same.

In this example, we will create a service class that will contain our methods for logging in and out.

In a real application, your login and logout methods would obtain a token and authentication data and check. For the purposes of this example, we have an if statement which checks for a specific username and password being supplied.

{% hint style="warning" %}
This is only an example. It is by no means an officially recommended way in how you should handle authentication using router hooks. Please use this code as a guide for creating your own solutions.
{% endhint %}

{% tabs %}
{% tab title="src/services/auth-service.ts" %}
```typescript
import { IRouter, lifecycleHooks } from 'aurelia';

@lifecycleHooks()
export class AuthService {
    isLoggedIn = false;
    private _user = null;

    constructor(@IRouter private router: IRouter) {

    }
    
    canLoad(vm, params, next, current) {
        return !next.data.isAuth || this.isLoggedIn;
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
export class SettingsPage {
    static data = { isAuth: true };
}
```
{% endtab %}

{% tab title="login-page.ts" %}
```typescript
export class LoginPage {}
```
{% endtab %}
{% endtabs %}

This code will run for all routed components and if the component has a `isAuth` data property and the `isLoggedIn` property is not truthy, then the route will not be allowed to load. However, this is probably not the expected outcome. In a real application, you would probably redirect the user to a different route.

## Redirecting

More often than not, you will probably want to redirect users who do not have permission to access a particular area to a permission denied screen or a login screen. We can do this by return an array containing a viewport instruction to tell the router what to do.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { lifecycleHooks } from 'aurelia';
import { LoginPage } from './login-page';


@lifecycleHooks()
export class AuthService {
    isLoggedIn = false;
    
    // ...
    
    canLoad(vm, params, next, current) {
        if (!next.data.isAuth || this.isLoggedIn) {
            return true;
        }
        return LoginPage; // redirect to the login page
    }
    
    // ...
}
```
{% endtab %}
{% endtabs %}

In our code, we return true if our `isLoggedIn` property is truthy or if the component does not require authentication. Otherwise, we return an instruction to which to redirect \(can be a component name, a component type, a viewport instruction or an array thereof\).

