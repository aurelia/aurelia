---
description: >-
  For fans of configuration, the configured routing approach is for those who
  want to explicitly work with the router.
---

# Configured routing

{% hint style="info" %}
`Please note that we currently have an interim router implementation and that some (minor) changes to application code might be required when the original router is added back in.`
{% endhint %}

If you prefer a more traditional approach to routing where you specify the routes through configuration and things work similarly to other routers you might have worked with \(including the Aurelia 1 router\), then configured routing might appeal to you.

In Aurelia, you can define routes inside of your components using the `route` decorator on your view-model. Most commonly, you would use this decorator on your application shell. If you are working with the `npx makes aurelia` skeleton, by default, this would be `my-app.ts/js`

The `route` decorator accepts an object with a property called `routes` which accepts an array.

```typescript
@route({
  routes: [
    { id: 'home', path: '', component: import('./home'), title: 'Home' },
    { path: 'login', component: import('./auth'), title: 'Sign in' },
    { path: 'register', component: import('./auth'), title: 'Sign up' }
  ]
})
export class MyApp {
}
```

Provided the accompanying view has an `<au-viewport` element, these routes would be projected into the element depending on the url. We have three routes; /home, /login and, /register. The `path` property denotes the route which is matched and the `component` is the component loaded. We use an inline `import` here for the component.

