---
description: >-
  Learn how to use Aurelia with existing HTML (inside of other frameworks and
  libraries), hydrating server-generated HTML or run multiple instances of
  Aurelia in your application.
---

# Enhance

## An introduction to enhance

The [startup sections](app-configuration-and-startup.md) showed how to start Aurelia for an empty root node. While that's the most frequent use case, there might be other scenarios where we would like to work with an existing DOM tree with Aurelia.

This includes pages partially rendered from a server with nodes and attributes representing Aurelia custom elements, custom attributes, or template controllers.&#x20;

Another example can be where you need to add a DOM fragment on the fly to the HTML document, and then you want Aurelia to take care of the bindings in that DOM fragment. This is commonly known as enhancing, where Aurelia takes a normal DOM fragment and associates behaviors with it.

The basic syntax of `enhance` closely matches that of the normal startup.

```typescript
const au = new Aurelia();
await au.enhance({ host, component: MyComponent });
```

There are a few important points to note here.

1. Every enhancement is treated as an anonymous custom element hydration, where the node being enhanced is the only element inside this anonymous element template.
2.  The component passed into `Aurelia.enhance` (`MyComponent` in our example above) can be a custom element class, an instance of a class, or an object literal. If it's a class, it will be instantiated by a container.\


    This container can be either specified by property `container` in the enhancement config object, or a new one will be created for this enhancement. `@inject` works like normal view model instantiation.
3. The `host` is usually an existing non-enhanced (neither by `.app` nor by `.enhance`) DOM node. Note that `.enhance` does not detach or attach the `host` node to the DOM by itself. If the `host` is truly detached, it must be explicitly attached to the DOM. An important consequence is that if there are existing event handlers attached to the `host` node or one of its successor nodes, those stay as is.
4.  The result of an `enhance` call is an activated custom element controller. This controller needs to be deactivated manually by the application or connected to an existing controller hierarchy to be deactivated automatically by the framework.\


    An example of enhancement result deactivation:

```typescript
const controller = au.enhance({ host, component });

controller.deactivate(controller, null, LifecycleFlags.none);
```

That's it. Those are the main differences between enhance and the normal empty-root startup. Those two are the same in every other aspect because once a node is enhanced, all the data bindings or change handling will work like a normal Aurelia-hydrated empty-root node.

## Enhance application startup

As discussed, the enhance API allows us to enhance our Aurelia applications in a few different ways. One method of enhancement is during application startup. This is convenient when you want to use Aurelia within an existing page (you might be using another framework or library or want to enhance a portion of a page).

Let's create an `index.html` file which contains some HTML markup you would encounter if you generated an Aurelia application using `npx makes aurelia` or by other means.

Pay attention to the contents of the `<body>` as there is a container called `app` as well as some HTML tags `<my-app>`

{% code title="index.html" %}
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Aurelia</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="/" />
  </head>

  <body>
    <div id="app">
      <my-app></my-app>
    </div>
  </body>
</html>
```
{% endcode %}

Now, let's enhance our application by using the enhance API inside of `main.ts`

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

We first wrap our async code in an anonymous async function. This allows us to catch errors and throw them to the console if enhancement fails but take note of the `enhance` call itself. We supply the container (in our case, it's a DIV with an ID of `app` as the host).&#x20;

Above our enhance call, we register our main component, which is `MyApp` which is the initial component our application will render.

{% hint style="warning" %}
Pay attention to what you are enhancing. Please make sure you are enhancing the container and not the component itself. It's an easy mistake to make that we have seen some developers get caught on.
{% endhint %}

This approach will work for existing applications as well. Say you have a WordPress website and want to create an Aurelia application on a specific page. You could create a container and then pass the element to `host` on the `enhance` call to do so.

## Enhancing on the fly within components

While using the `enhance` During registration, the enhance API is convenient for situations where you want to control how an Aurelia application is enhanced. There are times when you want to enhance HTML from within components programmatically. This may be HTML loaded from the server or elements created on the fly.

In the following example, we query our markup for an element called `item-list` and insert some Aurelia-specific markup into it (a repeater).

```typescript
import Aurelia, { IAurelia } from 'aurelia';

export class MyApp {
  items = [1, 2, 3];

  message = 'hello world!';
  
  // Inject an instance of Aurelia into our component
  constructor(@IAurelia private readonly au: Aurelia) {}

  attached() {
    const itemList = document.getElementById('item-list');
    
    itemList.innerHTML = "<div repeat.for='item of items'>${item}</div>";

    // Call the enhance API
    this.au.enhance({
      // The component is our view model, we specify an object with an array of items
      component: { items: this.items },
      // The element to enhance
      host: element,
    });
  }
}
```

As you can see, we are dynamically injecting some HTML into an existing element. Because this is being done after Aurelia has already compiled the view, it would not work. This is why we have to call `enhance` to tell Aurelia to parse our inserted HTML.

You can use this approach to enhance HTML inserted into the page after initial compilation, perfect for server-generated code.
