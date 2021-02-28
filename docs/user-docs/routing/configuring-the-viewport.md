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
* How to specify a fallback route
* How to restrict what components a viewport is allowed to display
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

### Default Route/Component With Parameters

Sometimes your default component might support parameter values. If you were showing a category page as your default page, you might want to pass through a default category value. The syntax is basically the same as above, except we pass a value.

```markup
<au-viewport default="category(name=electronics)"></au-viewport>
```

## Fallback Rendering

Not everything goes to plan. If a user attempts to route to an area of your application and for whatever reason, that component cannot be rendered, you can specify a fallback component which will be routed in its place. You might use this to create a 404 page or something else.

```markup
<au-viewport fallback="404"></au-viewport>
```

## Specifying Which Components A Viewport Can Render

The `<au-viewport>` element supports a `used-by` attribute which allows you to restrict which components a viewport is allowed to render. This becomes even more useful in instances where you have more than one viewport and want to scope what each viewport supports.

```markup
<au-viewport default="home" used-by="home, login, register"></au-viewport>
```

Here we are restricting our main viewport to only allow `home`, `login` and `register` components to be rendered inside of it.

## Other Viewport Attributes

While the most common attributes for a viewport have been covered, there are also a few other attributes you might find useful when creating viewports.

* `no-link` -- the viewport content isn't added to the browser's location url
* `no-title` -- the viewport content title isn't added to the browser's title
* `no-history` --  navigation isn't added to browser history
* `no-scope` --  the viewport doesn't define its own viewport scope, children become part of parent scope

