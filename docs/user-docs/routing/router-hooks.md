---
description: >-
  How to implement router "guards" into your applications to protect routes from
  direct access.
---

# Router Hooks

{% hint style="info" %}
`Please note that we currently have an interim router implementation and that some (minor) changes to application code might be required when the original router is added back in.`
{% endhint %}

As the name implies, route hooks allow you to guard specific routes and redirect the user or cancel navigation entirely. In most cases, you will want to use route hooks to protect certain areas of your application from people who do not have the required permission.

{% hint style="success" %}
**What you will learn in this section**

* How to create router hooks
* How to allow and deny certain routable components from within hooks
* How to implement authentication using route hooks
* How to redirect from within a route hook
{% endhint %}

{% hint style="info" %}
If you want to protect specific routes in your application behind authentication checks such as "Only allow user to view this part of my app if they are logged in and have permission", this is the section for you.
{% endhint %}

## A Basic Example

```typescript
import { IRouter, IViewModel } from 'aurelia';

export class MyApp implements IViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    afterBind() {
        this.router.addHook(async (instructions: ViewportInstruction[]) => {
            return true;
        });
    }
}
```

A router hook allows you to run middleware in the routing process. Which you can then use to redirect a user, perform additional checks \(token, permission calls\) and other application scenarios.

Returning `true` will allow the instruction to be processed, and returning `false` will disallow it. This will apply to every processed component, which for many purposes, is a little heavy-handed and not what you want to do. You'll want to be specific when using a router hook so you know when it runs and what it will apply to.

Running the above code will allow all route instructions to proceed, so nothing will change.

## Using The Include and Exclude Properties

As we mentioned previously, our hook will apply to every component in our application. You might only have a couple of areas of your app you want to protect behind hook checks. There is two properties `include` which is a allow list property and `exclude` which is a deny list property.

```typescript
import { IRouter, IViewModel } from 'aurelia';

export class App implements IViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    afterBind() {
        this.router.addHook(async (instructions: ViewportInstruction[]) => {

        }, {
            include: ['admin']
        });
    }
}
```

In this example, we are telling the router we only want to apply the hook to a component called admin, all other routed components will be ignored when this hook is run. It is recommended that you use the allow list approach using `include` where only a few components need to use a hook and `exclude` when mostly all components need to be run through the hook.

## Authentication

One of the most common scenarios you will use router hooks for is adding in authentication to your applications. Whether you use a third-party service such as Auth0 or Firebase Auth or your own authentication implementation, the process is mostly the same.

In this example, we will create a service class which will contain our methods for logging in and out.

In a real application, your login and logout methods would obtain a token and authentication data, and check. For the purposes of this example, we have an if statement which checks for a specific username and password being supplied.

{% hint style="warning" %}
This is only an example. It is by no means any officially recommended way in how you should handle authentication using router hooks. Please use this code as a guide for creating your own solutions.
{% endhint %}

{% tabs %}
{% tab title="src/services/auth-service.ts" %}
```typescript
import { IRouter } from 'aurelia';

export class AuthService {
    public isLoggedIn = false;
    private _user = null;

    constructor(@IRouter private router: IRouter) {

    }

    public async login(username: string, password: string): Promise<void> {
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

    public logout(redirect = null): void {
        this.isLoggedIn = false;
        this._user = null;

            if (redirect) {
                this.router.load(redirect);
            }
    }

    public getCurrentUser() {
        return this._user;
    }
}
```
{% endtab %}

{% tab title="my-app.ts" %}
```text
import { IRouter, IViewModel, ViewportInstruction } from 'aurelia';
import { AuthService } from './services/auth-service';

export class MyApp implements IViewModel {
    constructor(@IRouter private router: IRouter, private auth: AuthService) {

    }

    afterBind() {
        this.router.addHook((instructions: ViewportInstruction[]) => {
            return this.auth.isLoggedIn;
        });
    }
}
```
{% endtab %}
{% endtabs %}

This code will run for all routed components and if the `isLoggedIn` property is not truthy, then the route will not be allowed to load. However, this is probably not the expected outcome. In a real application, you would probably redirect the user to a different route.

## Redirecting

More often than not, you will probably want to redirect users who do not have permission to access a particular area to a permission denied screen or a login screen. We do can do this by return an array containing a viewport instruction to tell the router what to do.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { IRouter, IViewModel, ViewportInstruction } from 'aurelia';
import { AuthService } from './services/auth-service';

export class MyApp implements IViewModel {
    constructor(@IRouter private router: IRouter, private auth: AuthService) {

    }

    afterBind() {
        this.router.addHook(async (instructions: ViewportInstruction[]) => {
            if (this.auth.isLoggedIn) {
                return true;
            }

            // User is not logged in, so redirect them back to login page
            return [this.router.createViewportInstruction('login', instructions[0].viewport)];
        });
    }
}
```
{% endtab %}
{% endtabs %}

In our code, we return true if our `isLoggedIn` property is truthy. Otherwise, we return an array containing a viewport instruction. The first argument is the component and the second is the viewport. We reference the first instruction and its viewport here. If you have multiple viewports, your code will look a bit different.

## Setting The Title From Within Router Hooks

You can specify a router hook is to change the title of your application that gets called every time a route is triggered. By specifying the type of hook in our router hook configuration, passing in `HookTypes.SetTitleHookFunction` denotes this hook is for setting titles.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { IRouter, IViewModel, ViewportInstruction } from 'aurelia';
import { HookTypes, INavigatorInstruction } from '@aurelia/router';

export class MyApp implements IViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    afterBind() {
        this.router.addHook(async (title: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction) => {
            return 'My Title';
        }, {
            type: HookTypes.SetTitleHookFunction
        });
    }
}
```
{% endtab %}
{% endtabs %}

In this example we return a string, but in a real application you will probably want to check the component being rendered and then selectively set the title based on what is being rendered.

