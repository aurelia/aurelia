---
description: >-
  Aurelia was built with two goals in mind; abide by web standards and provide a
  great developer experience.
---

# Aurelia at a glance

Aurelia was designed to make building web applications and rich UI's easy. Living by the mantra of; Simple, Powerful and Unobtrusive, you have everything you need right out of the box to start building feature-rich web applications.

This section aims to give you a brief technical overview of how Aurelia works, but it is not intended to be a tutorial or reference. You will learn about Aurelia's fundamental concepts, which will carry over to the tutorials, guides and references in other parts of the documentation.

If you are looking for a nice gentle introduction to Aurelia that will only take a few minutes of your time the [Hello World tutorial](quick-start-guide/) is a great place to start.

## Intuitive templating syntax

Once you begin to dive into Aurelia's template syntax, you quickly realize that templating in Aurelia is nothing more than slightly enhanced HTML.

Say you had an array of objects and those objects were cats. Each cat has a name and a breed, Aurelia provides a `repeat.for` attribute which you put on the element you want to repeat and it will loop over your array to allow you to use the object.

{% code title="cute-cats.html" %}
```markup
<ul>
    <li repeat.for="cat of cats">${cat.name} // ${cat.breed}</li>
</ul>
```
{% endcode %}

{% code title="cute-cats.ts" %}
```typescript
export class CuteCats {
    cats = [
        { name: 'Bruno', breed: 'Siamese' },
        { name: 'Boots', breed: 'Domestic' },
        { name: 'Shadow', breed: 'Persian' }
    ];
}
```
{% endcode %}

This will result in three `<li>` elements each containing our cats being displayed.

Want to react to a click event on a button? Using `click.trigger` you can call a function defined inside of your view model.

{% code title="my-component.html" %}
```markup
<div>
    <button type="button" click.trigger="userClicked()">Click me!</button>
</div>
```
{% endcode %}

{% code title="my-component.ts" %}
```typescript
export class MyComponent {
    userClicked() {
        window.alert('I was clicked!');
    }
}
```
{% endcode %}

## Views and view models

In Aurelia, your view is where your templates live. A view is just HTML with a little bit of Aurelia-guided enhancement. A view model \(also known by some as a controller\) is where your business logic goes. You load data in here, store values and have callback functions triggered by events or user input.

By default, Aurelia expects your components to have both a view and a view model, they are a pair. As you will discover in the Building Components section, you can have HTML-only custom elements as well.

{% code title="my-component.html" %}
```markup
<div class="container">
    <h2>My component</h2>
</div>
```
{% endcode %}

{% code title="my-component.ts" %}
```typescript
export class MyComponent {
}
```
{% endcode %}

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

You can learn more about how to create custom elements and attributes in the [Building Components]() section.

