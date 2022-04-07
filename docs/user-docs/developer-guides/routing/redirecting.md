# Redirecting

The router allows you to redirect to other parts of your application using the `redirectTo` property. By specifying the path in the `redirectTo` property, the route will navigate to the specified value.

```typescript
@route({
  routes: [
    { path: '', redirectTo: 'products' },
    { path: 'products', component: import('./products'), title: 'Products' },
    { path: 'product/:id', component: import('./product'), title: 'Product' }
  ]
})
export class MyApp {

}
```

More often than not, you will probably want to redirect users who do not have permission to access a particular area to a permission denied screen or a login screen. The above redirection example allows you to created alias routes, but these are not guard type redirects.

You can redirect from within a lifecycle hook (great for authentication checks), or you can redirect from within components themselves.

## Redirect from within lifecycle hooks

In our code, we return true if our `isLoggedIn` property is truthy or if the component does not require authentication. Otherwise, we return an instruction to which to redirect (can be a component name, a component type, a viewport instruction or an array thereof).

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { lifecycleHooks, Params, RouteNode } from 'aurelia';
import { LoginPage } from './login-page';


@lifecycleHooks()
export class AuthHook {
    isLoggedIn = false;
    
    canLoad(viewModel, params: Params, next: RouteNode, current: RouteNode) {
        if (!instruction.data.isAuth || this.isLoggedIn) {
            return true;
        }
        
        return 'login'; // redirect to the login page
    }
    
    // ...
}
```
{% endtab %}
{% endtabs %}

## Redirect from within components

Sometimes you want to redirect from within a component itself. A good example of wanting to redirect is from within the `canLoad` method (which is asynchronous). If you want to load something from the API like a product page and the ID isn't valid, you would redirect to an error page of some kind most likely.

You might have noticed that this example looks kind of familiar. The `canLoad` method is used within lifecycle hooks as well and is a global router lifecycle method.

```typescript
import { IRouteViewModel, Params } from "aurelia";

export class UserDashboard implements IRouteViewModel {
    isLoggedIn = false;
    
    canLoad(params: Params, next: RouteNode, current: RouteNode) {
        if (!next.data.isAuth || this.isLoggedIn) {
            return true;
        }
        
        return 'login';
    }
}
```

What's interesting about the `canUnload` method, is that you can return a boolean to indicate if the component should load. You can also return a `LoadInstruction` which can be a Component or Routing Instruction. In our example above, we return a boolean if we can load the component, or return the login page component if we can't (which acts as a redirect of sorts).
