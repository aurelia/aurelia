---
description: >-
  This section details how you can use the load method on the router instance or
  load attribute to navigate to other parts of your application.
---

# Navigating With Load

{% hint style="info" %}
`Please note that we currently have an interim router implementation and that some (minor) changes to application code might be required when the original router is added back in.`
{% endhint %}

## Router Instance

To use the `load` method, you have to first inject the router into your component. This can be done easily by using the `IRouter` decorator on your component constructor method. The following code will add a property to your component called `router` which we can reference.

```typescript
import { IRouter } from 'aurelia';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }
}
```

### Navigating Without Options

The `load` method can accept a simple string value allowing you to navigate to another component without needing to supply any configuration options.

```typescript
import { IRouter } from 'aurelia';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }

    viewProducts() {
        this.router.load('products');
    }
}
```

### Navigating With Parameters

In this example, we are navigating to a component called `product` and passing a parameter value of `12` which is the product ID we will check for from within the product component.

```typescript
import { IRouter } from 'aurelia';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }

    viewProduct() {
        this.router.load('product(12)');
    }
}
```

### Configuration Options: Passing Parameters

The `load` method can accept an object which contains the component we want to render \(either the instance or the string name\` as well as an object called parameters.

```typescript
import { IRouter } from 'aurelia';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }

    viewProduct() {
        this.router.load({ component: Product, parameters: { id: '12' } });
    }
}
```

### Configuration Options: Specifying The Viewport

In instances where you have more than one viewport in your application, you can specify the viewport on the `load` configuration object. In this example, we are specifying we want to render our product component inside of the viewport named `main`.

```typescript
import { IRouter } from 'aurelia';

export class MyComponent implements IRouteableComponent {
    constructor(@IRouter private router: IRouter) {

    }

    viewProduct() {
        this.router.load({ component: 'product', parameters: { id: '12' }, viewport: 'main' });
    }
}
```

## HTML load Attribute

The router also allows you to decorate links and buttons in your application using a `load` attribute which works the same way as the router instance `load` method.

