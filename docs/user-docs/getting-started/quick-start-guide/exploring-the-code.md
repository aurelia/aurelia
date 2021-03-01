---
description: 'You''ve just scaffolded a new Aurelia application, what''s next?'
---

# Exploring the code

Now that you have bootstrapped a new Aurelia app, let's briefly talk about the files and folders that have been created. If you have worked with other frameworks or libraries before, a lot of this will be familiar to you.

The first thing you will notice is a folder called `src` this is where we write all of our application code, and another folder called `test` which will contain our application tests.

The rest of the files in the root directory won't really need to be changed. The `webpack.config.js` file is where you will register Webpack plugins and add in new loaders/modify existing ones. For the scope of this simple tutorial, we won't need to configure anything.

The `index.ejs` file is where the root HTML of your application lives. It'll be quite barebones as Aurelia will inject itself into this HTML, including styles. This is where you can add metadata into your applications head, analytics code into the footer and other things.

### A look inside src

The `src` directory is where we build our app. You'll see the same thing inside of this folder for both CLI choices, however, if you chose Javascript you will see `.js` file endings and, for TypeScript you'll see `.ts`.

Inside of your `main(.ts/.js)` file you will find the Aurelia bootstrap code. This is where Aurelia instantiates itself, where you will load plugins and include resources \(global plugins, custom elements and so forth\). This is where you'll also configure the router and other Aurelia-specific plugins.

You'll also notice three files `my-app(.ts/.js)`, `my-app.html` and `my-app.css`. This is the main part of your application, although it doesn't do much. The `my-app(.ts/.js)` file is your view-model, this is where your business logic goes, `my-app.html` is your view and `my-app.css` are component-specific styles. As a default convention, Aurelia will include a CSS file named the same as a component.

{% hint style="info" %}
The naming convention of the default `my-app` component is not random. The Web Components specification works on the basis of custom elements having a hyphen separated prefix. As such, instead of being called `app` it is called `my-app`. You can name this component whatever you want, but this practice of namespacing is recommended.
{% endhint %}

