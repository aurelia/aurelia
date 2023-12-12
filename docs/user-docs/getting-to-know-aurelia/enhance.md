---
description: >-
  Learn how to use Aurelia with existing HTML (inside of other frameworks and
  libraries), hydrating server-generated HTML or running multiple instances of
  Aurelia in your application.
---

# Enhance

## An introduction to enhance

Enhancement in Aurelia allows for integrating Aurelia’s capabilities with existing DOM elements or dynamically inserted HTML content. This feature is particularly useful in scenarios where the application is not entirely built with Aurelia, such as when integrating with server-rendered pages or dynamically generated content.

The [startup sections](app-configuration-and-startup.md) showed how to start Aurelia for an empty root node. While that's the most frequent use case, there might be other scenarios where we would like to work with an existing DOM tree with Aurelia.

### Basic Syntax and Key Points

The basic usage of `enhance` is straightforward:

```typescript
const au = new Aurelia();
await au.enhance({ host, component: MyComponent });
```

Key Points to Understand:

1. **Anonymous Custom Element Hydration:** The enhancement treats the target node as an anonymous custom element, allowing Aurelia to apply its behavior to the existing DOM structure.
2. **Component Flexibility:** The component parameter in enhance can be a custom element class, a class instance, or an object literal. If a class is provided, it's instantiated by Aurelia's dependency injection container, which can be either provided or automatically created.
3. **Host Element:** The host is typically an existing DOM node that is not yet under Aurelia's control. It's crucial to note that `enhance ' neither detaches nor attaches the `host` to the DOM. Existing event handlers on the `host` or its descendants remain unaffected.
4. **Controller Deactivation:** an `enhance` call results in a custom element controller that requires manual deactivation or integration into an existing controller hierarchy for automatic framework management.

Example of deactivating a controller:

```typescript
const controller = au.enhance({ host, component });
controller.deactivate(controller, null, LifecycleFlags.none);
```

## Enhancing During Application Startup

Enhance can be particularly useful during application startup, especially when integrating Aurelia into an existing web page or alongside other frameworks.

Let's create an `index.html` file containing some HTML markup you would encounter if you generated an Aurelia application using `npx makes aurelia` or other means.

Pay attention to the contents of the `<body>` as there is a container called `app` as well as some HTML tags `<my-app>`

{% code title="index.html" %}
```html
<body>
  <div id="app">
    <my-app></my-app>
  </div>
</body>
```
{% endcode %}

Now, let's enhance our application by using the `enhance`API inside of `main.ts`

```typescript
import Aurelia from 'aurelia';
import { MyApp } from './my-app';

(async () => {
    await Aurelia
        .register(MyApp)
        .enhance({
            host: document.querySelector('div#app'),
            component: {},
        });
})().catch(console.error);
```

We first wrap our async code in an anonymous async function. This allows us to catch errors and throw them to the console if enhancement fails, but take note of the `enhance` call itself. We supply the container (in our case, it's a DIV with an ID of `app` as the host).

Above our `enhance` call, we register our main component, `MyApp`, the initial component our application will render.

{% hint style="warning" %}
Pay attention to what you are enhancing. Please make sure you are enhancing the container and not the component itself. It's an easy mistake, and we have seen some developers get caught on.
{% endhint %}

This approach will work for existing applications as well. Say you have a WordPress website and want to create an Aurelia application on a specific page. You could create a container and pass the element to the `host` on the `enhance` call.

## Enhancing on the fly within components

While using the `enhance` During registration, the `enhance` API is convenient for situations where you want to control how an Aurelia application is enhanced. There are times when you want to enhance HTML programmatically from within components. This may be HTML loaded from the server or elements created on the fly.

In the following example, we query our markup for an `item-list` element and insert some Aurelia-specific markup into it (a repeater).

```typescript
import Aurelia, { IAurelia } from 'aurelia';

export class MyApp {
  items = [1, 2, 3];

  constructor(@IAurelia private readonly au: Aurelia) {}

  attached() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = "<div repeat.for='item of items'>${item}</div>";

    this.au.enhance({
      component: { items: this.items },
      host: itemList,
    });
  }
}
```

As you can see, we are dynamically injecting some HTML into an existing element. Because this is being done after Aurelia has already compiled the view, it would not work. This is why we must call `enhance` to tell Aurelia to parse our inserted HTML.

You can use this approach to enhance HTML inserted into the page after initial compilation, which is perfect for server-generated code.
