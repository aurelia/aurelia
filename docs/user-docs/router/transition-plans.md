---
description: Choose whether navigation replaces a component or reuses its current instance.
---

# Transition plan

When navigation targets a component type that is already active, the transition plan decides whether to replace its instance, invoke its routing hooks again, or keep it as it is. This lets a page choose how changes in route parameters affect its local state and data loading.

Set `transitionPlan` in [route configuration](./configuring-routes.md#advanced-route-configuration-options) to `replace`, `invoke-lifecycles`, `none`, or a function that returns one of those values.

- `replace`: Remove the current component and create a new instance. This is the default when route parameters change.
- `invoke-lifecycles`: Reuse the instance and call its routing hooks (`canUnload`, `canLoad`, `unloading`, `loading`, and `loaded`).
- `none`: Keep the instance without invoking its routing hooks. This is the default when the path and route parameters are unchanged.

## How does it work

Child route configuration inherits the `transitionPlan` from its parent when it does not supply one.

For the same component, a per-navigation `transitionPlan` option takes precedence. Without that override, an unchanged path and unchanged route parameters select `none` before the route-level configuration is consulted. Otherwise the router uses the configured or inherited plan, falling back to `replace`.

A query-only change therefore does not automatically invoke `loading()`, even if the route declares `transitionPlan: 'invoke-lifecycles'`. To refresh data in that hook, request it on the individual navigation:

```typescript
await router.navigate('?page=2', { transitionPlan: 'invoke-lifecycles' });
```

Here `router` is `IRouter`. The override applies to that operation, not subsequent Back/Forward events. A page that follows every completed query change can use the [query-driven results recipe](outcome-recipes.md#query-parameter-state-management).

{% hint style="info" %}
Aurelia 1 and earlier versions of Aurelia 2 defaulted to `invoke-lifecycles` when parameters changed. The current default, `replace`, gives the destination a fresh component instance. Choose `invoke-lifecycles` when the page should keep its local state across parameter changes.
{% endhint %}

## Transition plans are inherited

In this example, the child route inherits `transitionPlan: 'replace'` from the root. Changing its route parameters creates a new component instance. Repeating an unchanged destination follows the reuse rule above.

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

Alternate between the links and watch the instance counter (`id1`) increase:

{% embed url="https://stackblitz.com/edit/router-lite-tr-plan-replace-inheritance?ctl=1&embed=1&file=src/my-app.ts" %}

## Use a function to dynamically select transition plan

A function can choose the plan from the current and incoming route nodes. This example selects `invoke-lifecycles` for every component except the root:

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

Alternate between the links to change the path parameter. Each change invokes the routing hooks: `CeOne#id2` increases, and `CeOne#id1` keeps the same value because the instance is reused. Clicking the same destination again selects `none`.

{% embed url="https://stackblitz.com/edit/router-lite-tr-plan-function?ctl=1&embed=1&file=src/my-app.ts" %}

The function can also choose a different plan for each of several [sibling viewports](./viewports.md#sibling-viewports):

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

Alternate between the links to see both plans at work. Each parameter change creates a new `CeOne` instance and invokes `CeTwo`'s routing hooks on its existing instance.

{% embed url="https://stackblitz.com/edit/router-lite-tr-plan-function-sibling?ctl=1&embed=1&file=src/my-app.ts" %}
