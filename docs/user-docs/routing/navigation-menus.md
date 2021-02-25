---
description: The Aurelia Router comes with support for easily creating navigation menus.
---

# Navigation Menus

{% hint style="info" %}
`Please note that we currently have an interim router implementation and that some (minor) changes to application code might be required when the original router is added back in.`
{% endhint %}

## Creating Navigation Menus

Injecting the router into your application and calling the `addNav` method, you can create navigation menus without needing to manually create the HTML yourself. Furthermore, navigation is highly configurable and allows you to work with strings, component instances and specify the target viewport.

Inside of our `my-app` file we inject the router instance and then create our navigation menu.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { IRouter, IViewModel } from 'aurelia';

export class MyApp implements IViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    afterBind() {
        this.router.addNav('main-nav', [
            { 
                title: 'Baz', 
                route: Baz, 
                children: [
                    { 
                        title: 'Bar', 
                        route: ['bar', Baz] 
                    }
                ]
            },
            {
                title: 'Bar',
                route: 'bar'
            },
            {
                title: 'Foo', 
                route: { 
                    component: Foo, 
                    viewport: 'main-viewport' 
                } 
            }
        ]);
    }
}
```
{% endtab %}

{% tab title="my-app.html" %}
```markup
<au-nav name="main-nav"></au-nav>
<au-viewport></au-viewport>
```
{% endtab %}
{% endtabs %}

As you can see, we can create a navigation menu by specifying the name of the menu as the first argument and then the second argument, passing an array of routes which can be a mixture of components or objects specifying the component instance as well as the viewport name itself.

There are a few things to unpack here. The `route` property as you can see can accept components, objects or strings with the name of the component as the value. This level of flexibility allows you to work with routes the way you want too.

The `<au-nav>` custom element allows us to add in custom router navigation menus with ease. Similar to the `<au-viewport>` element, the `<au-nav>` element accepts a name property so we can reference it from within our code when creating navigation menus.

## Updating Navigation Menus

In some instances, you will want to update your menu with new routes. The `updateNav` method allows you to dynamically add in new routes from anywhere in your application. The syntax is basically the same as `addNav`, routes are passed the same way and you reference the name of your nav as the first argument.

```typescript
import { IRouter, IViewModel } from 'aurelia';

export class MyComponent implements IViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    afterBind() {
        this.router.updateNav('main-nav', [
            {
                title: 'New Route',
                route: 'new-route'
            }
        ]);
    }
}
```

In our code example, we are updating our nav `main-nav` with a new route called `new-route` which dynamically gets updated in the view.

## Replacing Navigation Menus

We can add new navigation menus, update them and we can also entirely replace them using `setNav`. Once again, the API is largely the same and works similar to that of `addNav` except it will not add new routes, it will replace any existing routes and add your new ones instead.

```typescript
import { IRouter, IViewModel } from 'aurelia';

export class MyComponent implements IViewModel {
    constructor(@IRouter private router: IRouter) {

    }

    afterBind() {
        this.router.setNav('main-nav', [
            {
                title: 'New Route',
                route: 'new-route'
            }
        ]);
    }
}
```

In our code example, we are calling `setNav` which will replace any existing routes we have with our one newly supplied route. It is convenient if you navigate to a section of your application and want to reuse your existing `<au-nav>` element.

