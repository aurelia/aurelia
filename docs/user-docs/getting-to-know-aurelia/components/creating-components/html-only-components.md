---
description: Custom elements without a view model
---

# HTML only components

More often than not, when you create a component in Aurelia you want to create a view and view model based component. However, Aurelia uniquely gives you the ability to create components using just HTML.

{% hint style="info" %}
When working with HTML only components, the file name becomes the HTML tag. Say you had a component called `app-loader.html` you would reference it using `<app-loader></app-loader>`
{% endhint %}

## Creating a basic HTML only component

It really is just as it sounds, HTML. Say you wanted to create a loader component that didn't require any logic and just displayed a CSS loader, it might look something like this. We will call this `app-loader.html`

{% code title="app-loader.html" %}
```text
<p>Loading...</p>
```
{% endcode %}

To use this component import and reference it:

```text
<import from="./app-loader.html"></import>

<app-loader></app-loader>
```

## HTML only components with bindable properties

Sometimes you want a custom element with bindable properties. Aurelia allows you to do this without the need for a view model using the `<bindable>` custom element.

{% code title="app-loader.html" %}
```text
<bindable property="loading"></bindable>

<p>${loading ? 'Loading...' : ''}</p>
```
{% endcode %}

Using it in your application would look like this:

```text
<import from="./app-loader.html"></import>

<app-loader loading.bind="mybool"></app-loader>
```

