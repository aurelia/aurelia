# Viewports

The `<au-viewport>` element is where all of the routing magic happens, the outlet. It supports a few different custom attributes, allowing you to configure how the router renders your components. It also allows you to use multiple viewports to create different layout configurations with your routing.

## Named viewports

The router allows you to add multiple viewports to your application and render components into each viewport element by their name. The `<au-viewport>` element supports a name attribute, which you'll want to use if you have more than one.

```html
<main>
    <au-viewport name="main"></au-viewport>
</main>
<aside>
    <au-viewport name="sidebar"></au-viewport>
</aside>
```

In this example, we have the main viewport for our main content, and another viewport called `sidebar` for our sidebar content which is dynamically rendered. When using viewports, think of them like iframes, independent containers that can maintain their own states.

## Specifying a viewport on a route

Routes will load in the default viewport element if there are one or more viewports. However, routes can be told to load into a specific viewport.

```typescript
import { IRouteableComponent, routes } from '@aurelia/router';

@routes([
    {
        component: import('./my-component'),
        path: 'my-component',
        title: 'Your Component <3',
        viewport: 'sidebar'
    }
])
export class MyApp implements IRouteableComponent {
}
```

By specifying the `viewport` property on a route, we can tell it to load into a specific route.
