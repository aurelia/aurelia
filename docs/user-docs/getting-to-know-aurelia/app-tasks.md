---
description: >-
  App tasks provide injection points to run code at certain points of the
  compiler lifecycle allowing you to interface with different parts of the
  framework and execute code.
---

# App Tasks

Falling somewhere in between component lifecycles and lifecycle hooks, app tasks offer injection points into Aurelia applications that occur at certain points of the compiler lifecycle. Think of them as higher-level framework hooks.

The app task API has the following calls:

* `creating` — Runs just before the root component is created by DI - last chance to register deps that must be injected into the root
* `hydrating` — Runs after instantiating the root view, but before compiling itself, and instantiating the child elements inside it - good chance for a router to do some initial work
* `hydrated` — Runs after self-hydration of the root controller, but before hydrating the child element inside - good chance for a router to do some initial work
* `activating` — Runs right before the root component is activated - in this phase, scope hierarchy is formed, and bindings are getting bound
* `actiated` — Runs right after the root component is activated - the app is now running
* `deactivating` — Runs right before the root component is deactivated - in this phase, scope hierarchy is unlinked, and bindings are getting unbound
* `deactivated` — Runs right after the root component is deactivated

You register the app tasks with the container during the instantiation of Aurelia or within a plugin (which Aurelia instantiates). In fact, there are many examples of using app tasks throughout the documentation. Such as [MS Fast integration](../reference/examples/integration/ms-fast.md), [building plugins](../developer-guides/building-plugins.md), and the section on using the [template compiler](../developer-guides/scenarios/the-template-compiler.md).

Many of Aurelia's own plugins use app tasks to perform operations involving registering numerous components and asynchronous parts of the framework.

## Asynchronous app tasks

A good example of where app tasks can come in handy is plugins that need to register things with the DI container. The app task methods can accept a callback, but also a key and callback, which can be asynchronous.

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

In the above example, we await importing a file which could be a JSON file or something else inside the task itself. Then we register it with DI.

Another great example of using app tasks is the dialog plugin that comes with Aurelia. The `deactivating` task is used to close all modals using the dialog service, as you can see [here](../../../packages/runtime-html/src/plugins/dialog/dialog-service.ts#L55).

## Registering app tasks

In Aurelia applications, app tasks are registered through the `register` method and will be handled inside of your `main.ts` file.

{% code title="main.ts" %}
```typescript
import Aurelia, { AppTask } from 'aurelia';

const au = new Aurelia();

au.register(
    AppTask.activating(() => {
        console.log('actiating or before activate');
    })
);
```
{% endcode %}

Within a plugin, the code is similar. You would be exporting a function which accepts the DI container as its first argument, allowing you to register tasks and other resources.

```typescript
export function register(container: IContainer) {
    container.register(
        AppTask.activating(() => {
            console.log('activating or before activate');
        })
    )
}
```

## An app task example

Using code taken from a real Aurelia 2 application, we will show you how you might use App Tasks in your Aurelia applications. One such example is Google Analytics.

```typescript
import { IGoogleAnalytics } from './../resources/services/google-analytics';
import { AppTask } from 'aurelia';

export const GoogleAnalyticsTask = AppTask.activating(IGoogleAnalytics, (ga) => {
    ga.init('UA-44935027-5');
    ga.attach();
});
```

We then pass the `GoogleAnalyticsTask` constant and register it with the container inside `main.ts`

```typescript
Aurelia.register(GoogleAnalyticsTask);
```

The above code runs during the `activating` app task and register/attach the Google Analytics SDK to our application.
