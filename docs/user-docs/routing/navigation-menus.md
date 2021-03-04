---
description: The Aurelia Router comes with support for easily creating navigation menus.
---

# Navigation Menus

{% hint style="info" %}
`Please note that we currently have an interim router implementation and that some (minor) changes to application code might be required when the original router is added back in.`
{% endhint %}

## Creating Navigation Menus

As the number of \(nested\) routes in an application grows, so does the maintenance burden with manually keeping the navigation menu template in sync with the route configuration.

Using `RouteConfig`, you can easily traverse the route configuration tree to recursively build a navigation menu with full control over styling, layout and behavior.

{% hint style="info" %}
In order for `RouteConfig.getConfig` to work as demonstrated, the `routes` property must be an array of imported component types \(rather than strings\).
{% endhint %}

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { IRouter, IViewModel } from 'aurelia';

export class MyApp {
    static routes = [ProductsPage];

    config = RouteConfig.getConfig(MyApp);
    routes = (this.config.routes as Constructable[]).map(RouteConfig.getConfig);
}
```
{% endtab %}

{% tab title="my-app.html" %}
```markup
<ul>
    <li repeat.for="route of routes">
        <nav-item config.bind="route"></nav-item>
    </li>
</ul>
<au-viewport></au-viewport>
```
{% endtab %}

{% tab title="nav-item.ts" %}
```typescript
import { RouteConfig, Constructable } from 'aurelia';

export class NavItem {
    @bindable config: RouteConfig;
    routes: RouteConfig[] = [];

    binding() {
        this.routes = (this.config.routes as Constructable[]).map(RouteConfig.getConfig);
    }
}
```
{% endtab %}

{% tab title="nav-item.html" %}
```markup
<a load.bind="config.path">${config.title}</a>
<ul if.bind="routes.length">
    <li repeat.for="route of routes">
        <nav-item config.bind="route"></nav-item>
    </li>
</ul>
```
{% endtab %}
{% endtabs %}

