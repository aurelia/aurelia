---
description: A quick guide on how to add in routing to your Aurelia applications.
---

# Routing

The Aurelia Direct Router allows you to add in flexible and highly configurable routing into your Aurelia applications. It offers a plethora of different ways you can add in routing from direct routing \(convention-based routing\) through to traditional configuration based routing.

The Aurelia Direct Router supports three different types of routing in your Aurelia applications. It is also possible to mix and switch between the three different types of router to suit your needs.

The three different types of routing and how to leverage them can be found in the routing documentation. For brevity, each style of routing is linked below where you can learn more about how they work and which option is the right one for you.

{% page-ref page="../routing/direct-routing.md" %}

{% page-ref page="../routing/component-configured-routing.md" %}

{% page-ref page="../routing/configured-routing.md" %}

## Getting Started

We will not get into the technical specifics of routing here. We simply import the `RouterConfiguration` instance from the Aurelia package and then register it via the `register` method.

An assumption is being made here that you generated a new Aurelia application and you are working with TypeScript. Changing the following example to work with Javascript based Aurelia applications should not be too much work.

**Inside of `main.ts` import and register the `RouterConfiguration` instance:**

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';

Aurelia
  .register(RouterConfiguration)
  .app(component)
  .start();
```

{% hint style="info" %}
By default, the router will use the hash style routing instead of pushState. To enable pushState routing, please consult the routing documentation [here](routing.md) for more information.
{% endhint %}

**Inside of `my-app.html` add a `<au-viewport>` element into the markup:**

```markup
<au-viewport></au-viewport>
```

That's all you need to do to add in support for routing to your application. It really is that simple.

## Create A Routable Component

Now, let's use direct routing to create a component and add in a link to load it. Let's create a new file inside of the `src` directory called `my-component.html`.

```markup
<h1>This is a component rendered by the router, hello</h1>
```

**Now, inside of `my-app.html` let's import our newly created component and link:**

```markup
<import from="./my-component.html"></import>

<p><a load="my-component">My component</a></p>

<au-viewport></au-viewport>
```

Running this code will give you a working application that allows you to load an HTML only component and you should see the text, `This is a component rendered by the router, hello`. You might have noticed we created a link and then added an attribute called `load` that simply tells the router what component to load.
