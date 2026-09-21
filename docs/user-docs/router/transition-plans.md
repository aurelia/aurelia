---
description: Learn how Router handles the re-entrance of the same component and how to override the default behavior.
---

# Transition plan

When navigation targets a component type that is already active, the transition plan decides whether to replace its instance, invoke its routing hooks again, or keep it as it is. This lets a page choose how changes in route parameters affect its local state and data loading.

Transition plan can be configured using the `transitionPlan` property in the [routing configuration](./configuring-routes.md#advanced-route-configuration-options).
The allowed values are `replace`, `invoke-lifecycles`, `none` or a function that returns one of these values.

- `replace`: This instructs the router to completely remove the current component and create a new one, behaving as if the component is changed. This is the default behavior if the parameters are changed.
- `invoke-lifecycles`: This instructs the router to call the lifecycle hooks (`canUnload`, `canLoad`, `unloading`, `loading`, and `loaded`) of the component.
- `none`: Does nothing. This is the default behavior, when nothing is changed.

## How does it work

Child route configuration inherits the `transitionPlan` from its parent when it does not supply one.

For the same component, a per-navigation `transitionPlan` option takes precedence. Without that override, an unchanged path and unchanged route parameters select `none` before the route-level configuration is consulted. Otherwise the router uses the configured or inherited plan, falling back to `replace`.

Consequently, a query-only change does not automatically invoke `loading()`, even if the route declares `transitionPlan: 'invoke-lifecycles'`. Request it on the individual navigation when that hook owns the refresh:

```typescript
await router.navigate('?page=2', { transitionPlan: 'invoke-lifecycles' });
```

Here `router` is `IRouter`. The override applies to that operation, not subsequent Back/Forward events. A page that follows every completed query change can use the [query-driven results recipe](outcome-recipes.md#query-parameter-state-management).

{% hint style="info" %}
It might be normal to think that the default selection of the `replace` transition plan when the parameter changes, to be an overkill and the default selection should have been `invoke-lifecycles` instead.
As a matter of fact that's the default option in Aurelia1 as well as in earlier versions of Aurelia2.
However, as understood from the user-voices that `replace` would in this case cause less surprises.
Hence the default behavior is changed to `replace`.
{% endhint %}

## Transition plans are inherited

Transition plans defined on the root are inherited by the children.
The example below shows that the `transitionPlan` on the root is configured to `replace` and this transition plan is inherited by the child route configuration.
Navigating between the different parameter values in this example therefore creates a new component instance. Repeating an unchanged destination still follows the reuse rule above.

```typescript
import { customElement } from '@aurelia/runtime-html';
import { IRouteViewModel, route } from '@aurelia/router';

@customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2}' })
class CeOne implements IRouteViewModel {
  private static id1: number = 0;
  private static id2: number = 0;
  // Every instance gets a new id.
  private readonly id1: number = ++CeOne.id1;
  private id2 = 0;
  public canLoad(): boolean {
    // Every time the lifecycle hook is called, a new id is generated.
    this.id2 = ++CeOne.id2;
    return true;
  }
}

@route({
  transitionPlan: 'replace',
  routes: [
    {
      id: 'ce1',
      path: ['', 'ce1', 'ce1/:id'],
      component: CeOne,
    },
  ],
})
@customElement({
  name: 'my-app',
  template: `<a load="ce1">ce-one</a> <a load="ce1/1">ce-one/1</a><br><au-viewport></au-viewport>`,
})
export class MyApp {}
```

See this example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-tr-plan-replace-inheritance?ctl=1&embed=1&file=src/my-app.ts" %}

## Use a function to dynamically select transition plan

You can use a function to dynamically select transition plan based on route nodes.
The following example shows that, where for every components, apart from the root component, `invoke-lifecycles` transition plan is selected.

```typescript
import { customElement } from '@aurelia/runtime-html';
import { IRouteViewModel, route, RouteNode } from '@aurelia/router';

@customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2}' })
class CeOne implements IRouteViewModel {
  private static id1: number = 0;
  private static id2: number = 0;
  // Every instance gets a new id.
  private readonly id1: number = ++CeOne.id1;
  private id2 = 0;
  public canLoad(): boolean {
    // Every time the lifecycle hook is called, a new id is generated.
    this.id2 = ++CeOne.id2;
    return true;
  }
}

@route({
  transitionPlan(_current: RouteNode, next: RouteNode) {
    return next.component.Type === MyApp ? 'replace' : 'invoke-lifecycles';
  },
  routes: [
    {
      id: 'ce1',
      path: ['', 'ce1', 'ce1/:id'],
      component: CeOne,
    },
  ],
})
@customElement({
  name: 'my-app',
  template: `<a load="ce1">ce-one</a> <a load="ce1/1">ce-one/1</a><br><au-viewport></au-viewport>`,
})
export class MyApp {}
```

The behavior can be validated by alternatively clicking the links multiple times and observing that the `CeOne#id2` increases, whereas `CeOne#id1` remains constant.
Changing the path parameter invokes the routing hooks while preserving the component instance. Repeating the unchanged destination selects `none`.
You can try out this example below.

{% embed url="https://stackblitz.com/edit/router-lite-tr-plan-function?ctl=1&embed=1&file=src/my-app.ts" %}

This can be interesting when dealing with [sibling viewports](./viewports.md#sibling-viewports), as you can select different transition plan for different siblings.

```typescript
import { customElement } from '@aurelia/runtime-html';
import { IRouteViewModel, route, RouteNode } from '@aurelia/router';

@customElement({ name: 'ce-two', template: 'ce2 ${id1} ${id2}' })
class CeTwo implements IRouteViewModel {
  private static id1: number = 0;
  private static id2: number = 0;
  private readonly id1: number = ++CeTwo.id1;
  private id2 = 0;
  public canLoad(): boolean {
    this.id2 = ++CeTwo.id2;
    return true;
  }
}

@customElement({ name: 'ce-one', template: 'ce1 ${id1} ${id2}' })
class CeOne implements IRouteViewModel {
  private static id1: number = 0;
  private static id2: number = 0;
  private readonly id1: number = ++CeOne.id1;
  private id2 = 0;
  public canLoad(): boolean {
    this.id2 = ++CeOne.id2;
    return true;
  }
}

@route({
  transitionPlan(current: RouteNode, next: RouteNode) {
    return next.component.Type === CeTwo ? 'invoke-lifecycles' : 'replace';
  },
  routes: [
    {
      id: 'ce1',
      path: ['ce1', 'ce1/:id'],
      component: CeOne,
    },
    {
      id: 'ce2',
      path: ['ce2', 'ce2/:id'],
      component: CeTwo,
    },
  ],
})
@customElement({
  name: 'ro-ot',
  template: `
<a load="ce1/1@$1+ce2/1@$2">ce1/1@$1+ce2/1@$2</a>
<a load="ce1/2@$1+ce2/2@$2">ce1/2@$1+ce2/2@$2</a>
<div id="content">
  <au-viewport name="$1"></au-viewport>
  <au-viewport name="$2"></au-viewport>
</div>
`,
})
export class MyApp {}
```

The example above selects `invoke-lifecycles` for the `CeTwo` and `replace` for everything else.
When you alternatively click the links multiple times, you can see that `CeOne` is re-instantiated every time whereas for `CeTwo` only the lifecycles hooks are invoked and the instance is reused.
You can see the example in action below.

{% embed url="https://stackblitz.com/edit/router-lite-tr-plan-function-sibling?ctl=1&embed=1&file=src/my-app.ts" %}
