---
description: >-
  How to implement router "guards" into your applications to protect routes from
  direct access.
---

# Route hooks

You might know router hooks as guards in other routers. Their role is to determine how components are loaded. They're pieces of code that are run in between.

The lifecycle hooks sharing API can be used to define reusable hook logic. In principle, nothing new needs to be learned: their behavior is the same as described in [Lifecycle Hooks](router-hooks.md#lifecycle-hooks), with the only difference being that the view model instance is added as the first parameter.

If you worked with Aurelia 1, you might know these by their previous name: router pipelines.

### Creating a custom lifecycle hook

```typescript
import Aurelia, { lifecycleHooks } from 'aurelia';
import { Parameters, Navigation, RouterConfiguration, RoutingInstruction } from '@aurelia/router';

@lifecycleHooks()
class NoopAuthHandler {
    canLoad(viewModel, params: Parameters, instruction: RoutingInstruction, navigation: Navigation) { 
        return true; 
    }
}

Aurelia
    .register(RouterConfiguration, NoopAuthHandler)
    .app(component)
    .start();
```

Shared lifecycle hook logic can be defined by implementing a router lifecycle hook on a class with the `@lifecycleHooks()` decorator. This hook will be invoked for each component where this class is available as a dependency. This can be either via a global registration or via one or more component-local registrations, similar to how, e.g. custom elements and value converters are registered.

In the example above, we register `NoopAuthHandler` globally, which means it will be invoked for each routed component and return `true` each time, effectively changing nothing.&#x20;

**Please note** that you are not recommended to use global lifecycle hooks when you can avoid them, as they are run for each component.the same as you would use inside&#x20;

{% hint style="warning" %}
Because lifecycle hooks are invoked for each component, it is considered best practice to ensure that you name your lifecycle hooks appropriately, especially if you're working in a team where developers might not be aware of hooks modifying global component lifecycle behaviors.
{% endhint %}

### Anatomy of a lifecycle hook

While lifecycle hooks are indeed their own thing independent of the components you are routing to, the functions are basically the same as you would use inside an ordinary component.

This is the contract for ordinary route lifecycle hooks for components:

```typescript
import { Parameters, IRouteableComponent, Navigation, RoutingInstruction } from '@aurelia/router';

class MyComponent implements IRouteableComponent {
  canLoad(params: Parameters, instruction: RoutingInstruction, navigation: Navigation);
  loading(params: Params, instruction: RoutingInstruction, navigation: Navigation);
  canUnload(instruction: RoutingInstruction, navigation: Navigation);
  unloading(instruction: RoutingInstruction, navigation: Navigation);
}
```

And this is the contract for shared lifecycle hooks

```typescript
import { lifecycleHooks } from 'aurelia'; 
import { Parameters, Navigation, RoutingInstruction } from '@aurelia/router';

@lifecycleHooks()
class MySharedHooks {
  canLoad(viewModel, params: Parameters, instruction: RoutingInstruction, navigation: Navigation);
  loading(viewModel, params: Params, instruction: RoutingInstruction, navigation: Navigation);
  canUnload(viewModel, instruction: RoutingInstruction, navigation: Navigation);
  unloading(viewModel, instruction: RoutingInstruction, navigation: Navigation);
  unload(viewModel, instruction: RoutingInstruction, navigation: Navigation);
}
```

The only difference is the addition of the first `viewModel` parameter. This comes in handy when you need the component instance since the `this` keyword won't give you access to it like in ordinary component methods.

### Restricting hooks to specific components

When dealing with route hooks, you might only want to apply those to specific components. Imagine an authentication workflow where you would want to allow unauthenticated users to access your login or contact page.

To do this, we can specify our route hook as a dependency in the component via the `static dependencies` property, which takes an array of one or more dependencies.

```typescript
import { IRouteableComponent } from "@aurelia/router";
import { AuthHook } from './route-hook';

export class SettingsPage implements IRouteableComponent {
    static dependencies = [ AuthHook ];
}
```

Whenever someone tries to route to the `SettingsPage` component, they will trigger the authentication hook you created. This per-component approach allows you to target the needed components you want behind a route hook.

### Multiple hooks per component/class

Shared lifecycle hooks run in parallel with (but are started _before_) component instance hooks, and multiple of the same kind can be applied per component. When multiple hooks are registered per component, they are invoked in the registration order.

```typescript
import { lifecycleHooks } from 'aurelia';

@lifecycleHooks()
class Log1 {
    async loading() {
        console.log('1.start');
        await Promise.resolve();
        console.log('1.end');
    }
}

@lifecycleHooks()
class Log2 {
    async loading() {
        console.log('2.start');
        await Promise.resolve();
        console.log('2.end');
    }
}

export class MyComponent {
    static dependencies = [Log1, Log2];

    async loading() {
        console.log('3.start');
        await Promise.resolve();
        console.log('3.end');
    }
}

// Will log, in order:
// 1.start
// 2.start
// 3.start
// 1.end
// 2.end
// 3.end
```

It is also permitted to define more than one hook per shared hook class:

```typescript
@lifecycleHooks()
export class LifecycleLogger {
    canLoad(viewModel, params, instruction, navigation) {
        console.log(`invoking canLoad on ${instruction.component.name}`);
        return true;
    }

    loading(viewModel, params, instruction, navigation) {
        console.log(`invoking load on ${instruction.component.name}`);
    }
}
```
