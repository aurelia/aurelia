# Creating components

There are numerous ways in which you can create custom components. By leveraging conventions, you can create simple components with minimal code to more verbose components that offer greater control over how they work.

There is no right or wrong way to create a component. As you will soon see, you can choose whatever works for your needs.

{% hint style="warning" %}
**Naming Components**

The component name, derived from the file name, **must** contain a hyphen when working with Shadow DOM \(see [Styling Components](../../introduction/class-and-style-binding/styling-binding.md)\). This is part of the W3C Web Components standard and is designed to serve as a namespacing mechanism for custom HTML elements. A typical best practice is to choose a two to three character prefix to use consistently across your app or company. For example, all components provided by Aurelia have the prefix `au-`.
{% endhint %}

## Components with conventions

In Aurelia, you don't technically have to even tell it what a component is. You can export a plain Javascript class and it will assume that it is a component.

This is what a basic component in Aurelia can look like. Obviously, you would add in logic and bindable properties \(maybe\) but a barebones component is just a class.

{% tabs %}
{% tab title="loader.ts" %}
```typescript
export class Loader {
}
```
{% endtab %}

{% tab title="loader.html" %}
```markup
<p>Loading...</p>
```
{% endtab %}
{% endtabs %}

Conventions mean Aurelia will automatically associate our component view model \(`loader.ts`\) with a file of the same name but with `.html` on the end, so `loader.html`.

{% hint style="warning" %}
**Don't Skip the Conventions**

We highly recommend that you leverage conventions where possible. A few benefits include:

* Reduction of boilerplate.
* Cleaner, more portable code.
* Improved readability and learnability of code.
* Less setup work and maintenance over time.
* Ease of migration to future versions and platforms.
{% endhint %}

## Convention-less components

If you want more control over your components or you are a plugin author, you might be interested in learning about creating components without conventions.

{% page-ref page="using-customelement-decorator.md" %}



