---
description: >-
  Aurelia was built with two goals in mind; abide by web standards and provide a
  great developer experience.
---

# Aurelia at a glance

Aurelia was designed to make building web applications and rich UI's easy. Living by the mantra of; Simple, Powerful and Unobtrusive, you have everything you need right out-of-the-box to start building feature-rich web applications.

This section aims to give you a brief technical overview of how Aurelia works, but it is not intended to be a tutorial or reference. You will learn about Aurelia's fundamental concepts, which will carry over to the tutorials, guides and references in other parts of the documentation.

If you are looking for a nice gentle introduction to Aurelia that will only take a few minutes of your time the [Hello World tutorial](quick-start-guide/) is a great place to start.

## Intuitive templating syntax

Once you begin to dive into Aurelia's template syntax, you quickly realize that templating in Aurelia is nothing more than slightly enhanced HTML. 

Say you had an array of objects and those objects were cats. Each cat has a name and a breed, Aurelia provides a `repeat.for` attribute which you put on the element you want to repeat and it will loop over your array to allow you to use the object.

{% tabs %}
{% tab title="cute-cats.html" %}
```markup
<ul>
    <li repeat.for="cat of cats">${cat.name} // ${cat.breed}</li>
</ul>
```
{% endtab %}

{% tab title="cute-cats.ts" %}
```
export class CuteCats {
    cats = [
        { name: 'Bruno', breed: 'Siamese' },
        { name: 'Boots', breed: 'Domestic' },
        { name: 'Shadow', breed: 'Persian' }
    ];
}
```
{% endtab %}
{% endtabs %}

This will result in three `<li>` elements each containing our cats being displayed.

Want to react to a click event on a button? Using `click.trigger` you can call a function defined inside of your view-model.

{% tabs %}
{% tab title="my-component.ts" %}
```typescript
export class MyComponent {
    userClicked() {
        window.alert('I was clicked!');
    }
}
```
{% endtab %}

{% tab title="my-component.html" %}
```markup
<div>
    <button type="button" click.trigger="userClicked()">Click me!</button>
</div>
```
{% endtab %}
{% endtabs %}

## Views and view-models

In Aurelia, your view is where your templates live. A view is just HTML with a little bit of Aurelia-guided enhancement. A view-model \(also known by some as a controller\) is where your business logic goes. You load data in here, store values and have callback functions triggered by events or user input.

By default, Aurelia expects your components to have both a view and a view-model, they are a pair. As you will discover in the Building Components section, you can have HTML-only custom elements as well.

{% tabs %}
{% tab title="my-component.ts" %}
```typescript
export class MyComponent {
}
```
{% endtab %}

{% tab title="my-component.html" %}
```text
<div class="container">
    <h2>My component</h2>
</div>
```
{% endtab %}
{% endtabs %}

## Custom elements and attributes

In Aurelia, a custom element is a lowercase tag, separated by hyphens. In our above example, the custom element would resemble the following in our view.

```markup
<my-component></my-component>
```

Similarly, a custom attribute allows you to decorate an existing HTML element \(including custom elements\). A custom attribute is a kebab-case value that is used on an element. The naming convention is the same for both custom elements and attributes.

```typescript
export class MyAttributeCustomAttribute {

}
```

Which in turn, would be used in the following way:

```markup
<div my-attribute></div>
```

You can learn more about how to create custom elements and attributes in the [Building Components](components/) section.

## Convention based routing

One of the most exciting features of Aurelia is its router which offers direct routing functionality out-of-the-box. This means you can add routing into your Aurelia applications without having to write any routes like you might be used to in other router packages.

Add a `au-viewport` element into your view and then use the `load` attribute to tell the router to load your component. Just make sure you have enabled the router \(this is done for you if you selected direct routing during the CLI process\).

```markup
<import from="./my-component"></import>

<p><a load="my-component()">My component</a></p>

<au-viewport></au-viewport>
```

We highly recommend you go and read up on everything the router can do for you in the [router section](../app-basics/routing.md) of the documentation. 

