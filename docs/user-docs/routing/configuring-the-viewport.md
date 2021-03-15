---
description: How to work with and configure the viewport for the Aurelia Router.
---

# Configuring The Viewport

{% hint style="info" %}
`Please note that we currently have an interim router implementation and that some (minor) changes to application code might be required when the original router is added back in.`
{% endhint %}

The `<au-viewport>` element is where all of the routing magic happens, the outlet. It supports a few different custom attributes which allow you to configure how the router acts \(from defaults, to which components are allowed to be rendered\).

{% hint style="success" %}
**What you will learn in this section**

* How to name viewports
* How to leverage multiple viewports
* How to specify default routes
{% endhint %}

## Named Viewports

The router allows you to add in multiple viewports into your application and render components into each of those viewport elements by their name. The `<au-viewport>` element supports a name attribute, which you'll want to use if you have more than one of them.

```markup
<main>
    <au-viewport name="main"></au-viewport>
</main>
<aside>
    <au-viewport name="sidebar"></au-viewport>
</aside>
```

In this example, we have a main viewport for our main content and then another viewport called `sidebar` for our sidebar content which is dynamically rendered.

## Default Routes

In a real application, you will most likely want to display a default route which gets loaded when the user visits your application. The `default` attribute allows us to specify a default component to load.

In our example, we are telling the router we want to have home display as our default component for our homepage, the first thing the visitor sees when they come to our application.

```markup
<au-viewport default="home"></au-viewport>
```

