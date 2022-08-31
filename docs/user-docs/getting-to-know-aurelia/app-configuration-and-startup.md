# App configuration and startup

## Application Startup

Aurelia allows you to configure the application startup in a couple of different ways. A quick setup where some defaults are assumed and a verbose setup where you can configure some of the framework-specific behaviors.

### Quick startup

The quick startup approach is what most developers will choose.

```typescript
import Aurelia, { StyleConfiguration, RouterConfiguration } from 'aurelia';

import { MyRootComponent } from './my-root-component';

// By default host to element name (<my-root-component> for MyRootComponent),
// or <body> if <my-root-component> is absent.
Aurelia.app(MyRootComponent).start();

// Or load additional Aurelia features
Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app(MyRootComponent)
  .start();

// Or host to <my-start-tag>
Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app({
    component: MyRootComponent,
    host: document.querySelector('my-start-tag')
  })
  .start();
```

### Verbose Startup

To start an Aurelia application, create a `new Aurelia()` object with a target `host` and a root `component` and call `start()`.

```typescript
import Aurelia, { StandardConfiguration } from 'aurelia';
import { ShellComponent } from './shell';

new Aurelia()
  .register(StandardConfiguration)
  .app({ host: document.querySelector('body'), component: ShellComponent })
  .start();
```

In most instances, you will not use the verbose approach to starting your Aurelia applications. The verbose approach is more aimed at developers integrating Aurelia into existing web applications and views.

## Register a globally available custom element

### Registering a single element

To make a custom element globally available to your application, pass the custom element constructor to the `.register()` method on your Aurelia app.

```typescript
import { CardCustomElement } from './components/card';

// When using quick startup
Aurelia
  .register(...)
  .register(<any>CardCustomElement);
  .app({ ... })
  .start();

// When using verbose startup
new Aurelia()
  .register(...)
  .register(<any>CardCustomElement)
  .app({ ... })
  .start();
```

### Register a set of elements

If you have a package that exports all your custom elements, you can pass the entire package to the `.register()` method on your Aurelia app.

src/components/index.ts:

```typescript
export { CardCustomElement } from './card';
export { CollapseCustomElement } from './collapse';
```

src/main.ts:

```typescript
import * as globalComponents from './components';

// When using quick startup
Aurelia
  .register(...)
  .register(<any>globalComponents)
  .app({ ... })
  .start();

// When using verbose startup
new Aurelia()
  .register(...)
  .register(<any>globalComponents)
  .app({ ... })
  .start();
```

## App Tasks

Falling somewhere in between component lifecycles and lifecycle hooks, app tasks offer injection points into Aurelia applications that occur at certain points of the compiler lifecycle. Think of them as higher-level framework hooks.

The app task API has the following calls:

* `beforeCreate` — Runs just before the root component is created by DI - last chance to register deps that must be injected into the root
* `hydrating` — Runs after instantiating the root view, but before compiling itself, and instantiating the child elements inside it - good chance for a router to do some initial work
* `hydrated` — Runs after self hydration of the root controller, but before hydrating the child element inside - good chance for a router to do some initial work
* `beforeActivate` — Runs right before the root component is activated - in this phase, scope hierarchy is formed, and bindings are getting bound
* `afterActivate` — Runs right after the root component is activated - the app is now running
* `beforeDeactivate` — Runs right before the root component is deactivated - in this phase, scope hierarchy is unlinked, and bindings are getting unbound
* `afterDeactivate` — Runs right after the root component is deactivated

You register the app tasks with the container, so during the instantiation of Aurelia or within a plugin (which Aurelia instantiates). In fact, there are many examples of using app tasks throughout the documentation. Such as [MS Fast integration](../reference/examples/integration/ms-fast.md), [building plugins](../developer-guides/building-plugins.md), and the section on using the [template compiler](../developer-guides/scenarios/the-template-compiler.md).

Many of Aurelia's own plugins use app tasks to perform operations involving the registration of numerous components and asynchronous parts of the framework.

### Asynchronous app tasks

A good example of where app tasks can come in handy is plugins that need to register things with the DI container. The app task methods can accept a callback, but also a key and callback which can be asynchronous.

{% code title="main.ts" %}
```typescript
import { IContainer } from '@aurelia/kernel';
import { AppTask, DI, Registration } from 'aurelia';

Aurelia.register(
    AppTask.hydrating(IContainer, async container => {
        if (config.enableSpecificOption) {
            const file = await import('file');
            cfg.register(Registration.instance(ISpecificOption, file.do());
        }
        
        Registration.instance(IBootstrapV5Options, config).register(container);
    })
);
```
{% endcode %}

In the above example, we await importing a file which could be a JSON file or something else inside of the task itself, then we register it with DI.

Another great example of using app tasks is the dialog plugin that comes with Aurelia. The `beforeDeactivate` task is used to close all modals using the dialog service, as you can see [here](../../../packages/runtime-html/src/plugins/dialog/dialog-service.ts#L55).

### Registering app tasks

In Aurelia applications, app tasks are registered through the `register` method and will be handled inside of your `main.ts` file.

{% code title="main.ts" %}
```typescript
import Aurelia, { AppTask } from 'aurelia';

const au = new Aurelia();

au.register(
    AppTask.beforeActivate(() => {
        console.log('Before activate');
    })
);
```
{% endcode %}

Within a plugin, the code is similar. You would be exporting a function which accepts the DI container as its first argument, allowing you to register tasks and other resources.

```typescript
export function register(container: IContainer) {
    container.register(
        AppTask.beforeActivate(() => {
            console.log('Before activate');
        })
    )
}
```

## Enhance

The startup sections showed how to start Aurelia for an empty root node. While that's the most frequent use case, there might be other scenarios where we would like to work with an existing DOM tree with Aurelia.&#x20;

This includes pages partially rendered from a server with nodes and attributes representing Aurelia custom elements, custom attributes, or template controllers. Another example can be where you need to add a DOM fragment on the fly to the HTML document, and then you want Aurelia to take care of the bindings in that DOM fragment. This is commonly known as enhancing, where Aurelia takes a normal DOM fragment and associates behaviours with it.

The basic syntax of `enhance` matches closely that of the normal startup.

```typescript
const au = new Aurelia();
await au.enhance({ host, component: MyComponent });
```

There are a few important points to note here.

1. Every enhancement is treated as an anonymous custom element hydration, where the node being enhance is the only element inside this anonymous element template.
2.  The component passed into `Aurelia.enhance` (`MyComponent` in our example, above) can be a custom element class, an instance of a class, or an object literal. If it's a class, then it will be instantiated by a container.

    This container can be either specified by property `container` in the enhancement config object, or a new one will be created for this enhancement. `@inject` works like normal view model instantiation.
3. The `host` is usually an existing non-enhanced (neither by `.app` nor by `.enhance`) DOM node. Note that `.enhance` does not detach or attach the `host` node to the DOM by itself. If the `host` is truly detached, then it needs to be explicitly attached to the DOM. An important consequence to note is that if there are existing event handlers attached to the `host` node or one of its successor node, then those stays as it is.
4.  The result of an `enhance` call is an activated custom element controller. This controller needs to be deactivated manually by the application, or connected to an existing controller hierarchy to be deactivated automatically by the framework.

    An example of enhancement result deactivation:

```typescript
const controller = au.enhance({ host, component });

controller.deactivate(controller, null, LifecycleFlags.none);
```

That's it. Those are the main differences between enhance and the normal empty-root startup. In every other aspect, those two are same, because once a node is enhanced, all the data bindings, or change handling will work like a normal Aurelia hydrated empty-root node.
