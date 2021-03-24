# Bootstrapping

There is a starting point for using any tool. The following topics will show you how to get started with Aurelia.

### The hosting page

The first entry point of an Aurelia application is the main HTML page-loading and hosting.

{% tabs %}
{% tab title="Aurelia 1" %}
```markup
<!-- index.ejs -->
​
<!DOCTYPE html>
<html>
   <head>
      <meta charset="utf-8">
      <title>Aurelia</title>
   </head>
   <body aurelia-app="main">
      <script src="scripts/vendor-bundle.js"
         data-main="aurelia-bootstrapper"></script>
   </body>
</html>
```

`aurelia-app` attribute helps us to introduce our entry point, the`main.ts`file, which includes the configurations of the project.
{% endtab %}

{% tab title="Aurelia 2" %}
```markup
<!-- index.ejs -->
​
<!DOCTYPE html>
<html>
​
<head>
  <meta charset="utf-8">
  <title>Aurelia</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
​
<body>
  <my-app></my-app>
</body>
​
</html>
```

In Aurelia 2, it is a little different, you need to call your root component \(`<my-app>` in this example\) but

**What happened to `aurelia-app`?**

There is no`aurelia-app`in Aurelia 2. The`main.ts`file will detect via the project configuration.

```javascript
// webpack.config.js
​
// ...
entry: test ? './test/all-spec.ts' :  './src/main.ts' /*Here*/,
// ...
```
{% endtab %}
{% endtabs %}

### The main module

All the initial settings for starting and working with an Aurelia project are done in this file.

{% tabs %}
{% tab title="Aurelia 1" %}
```typescript
// src/main(.js|.ts)
​
export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    .globalResources(PLATFORM.moduleName('./bar/nav-bar'));
​
  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');
​
  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }
​
  aurelia.start()
         .then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
```

**What does `PLATFORM.moduleName` do?**

Whenever you reference a module by string, you need to use`PLATFORM.moduleName("moduleName")`to wrap the bare string. `PLATFORM.moduleName` is designed to teach`Webpack`about Aurelia's dynamic loading behavior.

**What is a `globalResources`?**

When you create a view in Aurelia, it is completely encapsulated so you must`require`components into an Aurelia view. However, certain components are used so frequently across views that it can become very tedious to import them over and over again. To solve this problem, Aurelia lets you explicitly declare certain "view resources" as global.

**What is a `feature`?**

Sometimes you have a whole group of components or related functionality that collectively form a "feature". This "feature" may even be owned by a particular set of developers on your team. You want these developers to be able to manage the configuration and resources of their own feature, without interfering with the other parts of the app. For this scenario, Aurelia provides the "feature".

**What is a `plugin`?**

Similar to features, you can install 3rd party plugins. The main difference is that a "feature" is provided internally by your application, while a plugin is installed from a 3rd party source through your package manager.

**What does `setRoot()` do?**

Instantiates the root component and adds it to the DOM.
{% endtab %}

{% tab title="Aurelia 2" %}
```typescript
// src/main(.js|.ts)
​
import Aurelia, { RouterConfiguration } from 'aurelia';
import { MyApp } from './my-app';
​
Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(MyApp)
  .start();
```

One of the best and most exciting changes has been made in this section.

**What happened to `PLATFORM.moduleName`?**

Aurelia 2 works with any bundler without limitation or specific configuration so I'm sure you guessed it, you don't need `PLATFORM.moduleName("moduleName")` anymore.

**Is `globalResources`still supported?**

Yes, Any component or class you add to the application`register()`will be globally accessible through DI.

**How can I have a `plugin`?**

If you are creating a`plugin` , then the usual practice is to `export` a configuration object. That can be registered in the client code. As a best practice, we recommend an alternate approach to registering each component individually in this way. Instead, create a folder where you keep all your shared components. In that folder, create a `registry.ts` module where you re-export your components. Then, import that registry module and pass it to the application's register method at startup.

For example:

```typescript
// components/registry.ts
​
export * from './say-hello';
export * from './name-tag';
```

```typescript
// main.ts
​
import Aurelia from 'aurelia';
import { App } from './app';
import * as globalComponents from './components/registry';
​
Aurelia
  .register(
    globalComponents // This globalizes all the exports of the registry.
  )
  .app(App)
  .start();
```

**What happened to `feature`?**

This is conceptually similar to`plugin`so you can do the same for internal use.

**Where is the `setRoot()`?**

The `app()`method is equivalent of the `setRoot()`.
{% endtab %}
{% endtabs %}

#### 

