---
description: Learn to navigate from one view to another using the Aurelia router, including declarative and programmatic navigation patterns.
---

# Navigating

A link or navigation call needs a starting point: the component or layout that owns the destination, or the current application URL.

For example, a Reports link in an admin sidebar should open the admin layout's Reports route from any of its nested pages. A link to the next item may need to follow the currently displayed URL. Aurelia provides navigation methods for both cases.

## Navigation Methods Overview

| Destination or task | Use | Reference point |
| --- | --- | --- |
| A route owned by the current component or layout | `load` or `IContextRouter.load()` | The owning routing context |
| A route at the application routing root | `IRouter.load()` or an explicitly rooted `load` instruction | The root routing context |
| A destination relative to the current application URL | [`url` or `IRouter.navigate()`](./application-url-navigation.md) | The last completed router location |
| Another document, download, or external site | Native `href`; add `external` to bypass the router's `href` attribute | The browser's URL rules |
| A contextual route with parameters or active-link styling | `load` with `params` or `active` | The selected routing context |
| A generated path for later contextual navigation | [`generatePath()`](#path-generation) | The context selected by the instruction |
| A browser-ready link from an application URL reference | [`createHref()`](./application-url-navigation.md) | The last completed router location |

The router-managed `href` attribute accepts a routing instruction as a string and resolves it in the same context as `load`. A native browser `href` follows the browser's URL rules. Both router attributes render a real `href`, so users can copy a link or open it in a new tab.

Register `UrlCustomAttribute` explicitly to use the `url` attribute; `RouterConfiguration` does not register it. See [application URL navigation](./application-url-navigation.md) for setup and URL-relative examples. Use `load` for menus that need its active-route output or instructions that target particular viewports.

## Path syntax

The `load` and router-managed `href` attributes, `IRouter.load()`, and `IContextRouter.load()` accept routing instructions:

| Instruction | Meaning |
| --- | --- |
| `/path` | Select the application routing root, then resolve `path`. |
| `path` or `./path` | Resolve `path` in the current routing context. |
| `../path` | Select the parent routing context, then resolve `path`. Each additional leading `../` selects another ancestor; ascent stops at the root. |
| `..` or `../` | Select the parent context and its default route. |
| `path1+path2` | Load sibling routes into available viewports in the selected context. |
| `path@viewportName` | Target a named viewport, as in `products@list+details/42@details`. |

Each routed component establishes a routing context. A route configured as `items/:id/details`, for example, consumes three URL segments while creating one context. `../` in `load` climbs a context; `../` in `navigate` follows URL-segment rules.

## Using the `href` custom attribute

The router-managed `href` attribute accepts a string instruction on an anchor. It resolves that instruction in the link's owning context and writes its browser URL. A normal click navigates through the router.

{% embed url="https://stackblitz.com/edit/router-lite-getting-started?ctl=1&embed=1&file=src/main.ts" %}

Here, both links resolve against routes configured by `MyApp`:

{% tabs %}
{% tab title="my-app.html" %}
```html
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
</nav>
```
{% endtab %}
{% tab title="my-app.ts" %}
```ts
import { route } from '@aurelia/router';
import { Home } from './home';
import { About } from './about';

@route({
  routes: [
    {
      path: ['', 'home'],
      component: Home,
    },
    {
      path: 'about',
      component: About,
    },
  ],
})
export class MyApp {}
```
{% endtab %}
{% endtabs %}

For a parameterized path, the instruction includes the parameter value:

{% embed url="https://stackblitz.com/edit/router-lite-href-with-bound-parameter?ctl=1&embed=1&file=src/my-app.ts" %}

This route accepts both `about` and `about/42`:

{% tabs %}
{% tab title="my-app.html" %}
```html
<nav>
  <a href="home">Home</a>
  <a href="about">About</a>
  <a href="about/42">About/42</a>
</nav>
```
{% endtab %}
{% tab title="my-app.ts" %}
```ts
import { route } from '@aurelia/router';
import { Home } from './home';
import { About } from './about';

@route({
  routes: [
    {
      path: ['', 'home'],
      component: Home,
    },
    {
      path: ['about/:id?'],
      component: About,
    },
  ],
})
export class MyApp {}
```
{% endtab %}
{% endtabs %}

The last link supplies `42` as the route's `id` parameter.

### Using route-id

Give a route an explicit [`id`](./configuring-routes.md#advanced-route-configuration-options) to use that ID in the `href` attribute.

An ID can take precedence over a matching literal path. Avoid giving one route an ID that is a different route's path in the same context. Development warning [AUR3179](../developer-guides/error-messages/router/aur3179.md) reports single-segment collisions the router can identify. The ID still takes precedence.

{% embed url="https://stackblitz.com/edit/router-lite-href-route-id?ctl=1&embed=1&file=src/my-app.ts" %}

This example gives each route an ID that differs from its path. The links use those IDs as their `href` values.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { route } from '@aurelia/router';
import { ChildOne } from './child1';
import { ChildTwo } from './child2';

@route({
  routes: [
    {
      id: 'r1',
      path: ['', 'c1'],
      component: ChildOne,
    },
    {
      id: 'r2',
      path: 'c2',
      component: ChildTwo,
    },
  ],
})
export class MyApp {}
```
{% endtab %}
{% tab title="my-app.html" %}
```html
<nav>
  <a href="r1">C1</a>
  <a href="r2">C2</a>
</nav>
```
{% endtab %}
{% tab title="child1.ts" %}
```typescript
import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'gc-11', template: 'gc11' })
class GrandChildOneOne {}

@customElement({ name: 'gc-12', template: 'gc12' })
class GrandChildOneTwo {}

@route({
  routes: [
    { id: 'r1', path: ['', 'gc11'], component: GrandChildOneOne },
    { id: 'r2', path: 'gc12', component: GrandChildOneTwo },
  ],
})
@customElement({
  name: 'c-one',
  template: `c1 <br>
  <nav>
    <a href="r1">gc11</a>
    <a href="r2">gc12</a>
  </nav>
  <br>
  <au-viewport></au-viewport>`,
})
export class ChildOne {}
```
{% endtab %}
{% tab title="child2.ts" %}
```typescript
import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'gc-21', template: 'gc21' })
class GrandChildTwoOne {}

@customElement({ name: 'gc-22', template: 'gc22' })
class GrandChildTwoTwo {}

@route({
  routes: [
    { id: 'r1', path: ['', 'gc21'], component: GrandChildTwoOne },
    { id: 'r2', path: 'gc22', component: GrandChildTwoTwo },
  ],
})
@customElement({
  name: 'c-two',
  template: `c2 <br>
  <nav>
    <a href="r1">gc21</a>
    <a href="r2">gc22</a>
    <a href="c1">c1 (doesn't work)</a>
    <a href="../c1">../c1 (works)</a>
  </nav>
  <br>
  <au-viewport></au-viewport>`,
})
export class ChildTwo {}
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
If the target route expects parameters, `href` cannot pass them as a separate object. Prefer the [`load` attribute](#using-the-load-custom-attribute), or use the route-expression parameter syntax (for example `r1(id=42)`) described below.
{% endhint %}

### Targeting viewports

The syntax for targeting [named](./viewports.md#named-viewports) or [sibling](./viewports.md#sibling-viewports) viewports is:

```
{path1}[@{viewport-name}][+{path2}[@{sibling-viewport-name}]]
```

The live example uses these instructions to load a product list and its details.

{% embed url="https://stackblitz.com/edit/router-lite-named-sibling-viewport-href?ctl=1&embed=1&file=src/my-app.html" %}

Its links show how each instruction selects a viewport:

```html
<!-- Load the products' list in the first viewport and the details in the second viewport -->
<a href="products+details/${id}">Load products+details/${id}</a>

<!-- Load the details in the first viewport and the products' list in the second viewport -->
<a href="details/${id}+products">Load details/${id}+products</a>

<!-- Specifically target the named viewports -->
<a href="products@list+details/${id}@details">Load products@list+details/${id}@details</a>
<a href="products@details+details/${id}@list">Load products@details+details/${id}@list</a>

<!-- Load only the details in the specific named viewport -->
<a href="details/${id}@details">Load details/${id}@details</a>
```

When the instruction omits a viewport name, the router uses the first available viewport.

### Passing component params in the instruction string

When you use the string-based route expression syntax (for example in `href`, `load`, or `router.load('...')`), you can pass component params by appending a parenthesized list to a segment:

```html
<a href="users(id=42)">User 42</a>
<a href="products(category=shoes)@list+details(id=42)@details">Shoes</a>
```

This is equivalent to passing `params` via an object instruction:

```ts
router.load({ component: 'users', params: { id: '42' } });
```

Notes:

- Named parameter values are URL-decoded. Prefer structured `params` for dynamic values that need escaping.
- Named params use `key=value` pairs (for example `users(id=42,tab=settings)`).
- Positional params are also supported (for example `users(42)`), but named params are recommended for clarity.

### Navigate in current and ancestor routing context

The `href` attribute starts in the routing context that owns the link. A leading `/` or `../` changes that selection before the router resolves the route. The following example shows why the owning context matters.

{% embed url="https://stackblitz.com/edit/router-lite-hierarchical-viewport-2mcxwj?ctl=1&embed=1&file=src/main.ts" %}

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { ChildOne } from './child1';
import { ChildTwo } from './child2';
import { NotFound } from './not-found';
import template from './my-app.html?raw';

@route({
  routes: [
    {
      path: ['', 'c1'],
      component: ChildOne,
    },
    {
      path: 'c2',
      component: ChildTwo,
    },
    {
      path: 'not-found',
      component: NotFound,
    },
  ],
  fallback: 'not-found',
})
@customElement({ name: 'my-app', template })
export class MyApp {}
```
{% endtab %}
{% tab title="child1.ts" %}
```typescript
import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'gc-11', template: 'gc11' })
class GrandChildOneOne {}

@customElement({ name: 'gc-12', template: 'gc12' })
class GrandChildOneTwo {}

@route({
  routes: [
    { id: 'r1', path: ['', 'gc11'], component: GrandChildOneOne },
    { id: 'r2', path: 'gc12', component: GrandChildOneTwo },
  ],
})
@customElement({
  name: 'c-one',
  template: `c1 <br>
  <nav>
    <a href="r1">gc11</a>
    <a href="r2">gc12</a>
    <a href="c2">c2 (doesn't work)</a>
    <a href="../c2">../c2 (works)</a>
  </nav>
  <br>
  <au-viewport></au-viewport>`,
})
export class ChildOne {}
```
{% endtab %}
{% tab title="child1.ts" %}
```typescript
import { route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'gc-21', template: 'gc21' })
class GrandChildTwoOne {}

@customElement({ name: 'gc-22', template: 'gc22' })
class GrandChildTwoTwo {}

@route({
  routes: [
    { id: 'r1', path: ['', 'gc21'], component: GrandChildTwoOne },
    { id: 'r2', path: 'gc22', component: GrandChildTwoTwo },
  ],
})
@customElement({
  name: 'c-two',
  template: `c2 <br>
  <nav>
    <a href="r1">gc21</a>
    <a href="r2">gc22</a>
    <a href="c1">c1 (doesn't work)</a>
    <a href="../c1">../c1 (works)</a>
  </nav>
  <br>
  <au-viewport></au-viewport>`,
})
export class ChildTwo {}
```
{% endtab %}
{% endtabs %}

The root component configures `c1` and `c2`. Each has its own children: `c1` configures `gc11` and `gc12`, and `c2` configures `gc21` and `gc22`. Links in each component resolve against its own child routes.

In `child1.ts`, the following link cannot reach `c2` because the root component owns that route:

```html
 <a href="c2">c2 (doesn't work)</a>
```

Select the parent context with `../` to reach `c2`:

```html
<a href="../c2">../c2 (works)</a>
```

Each additional `../` selects another ancestor context, up to the root.

The [route-ID example](#using-route-id) uses this same rule. The root and child components each define routes with IDs `r1` and `r2`. Each link resolves the ID in its own context, so the components can reuse those IDs.

### Bypassing the `href` custom attribute

Use `external` (or `data-external`) to let the browser follow a relative or root-relative `href` directly:

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
<a href="../help.html" external>Help document</a>
```

Full URLs and schemes such as `https:`, `mailto:`, `tel:`, and protocol-relative `//example.com/path` are treated as external automatically. This includes an absolute URL to the same origin.

Setting [`useHref: false`](./router-configuration.md#enable-or-disable-the-usage-of-the-href-custom-attribute-using-usehref) disables click interception by the router-managed `href` attribute. The attribute still resolves routing instructions and writes their generated URLs. Use `external` to preserve the authored native URL as well.

For router-generated links, the browser handles modified clicks, non-primary mouse buttons, `download`, and a `target` other than `_self` or the current window name. A click already canceled with `preventDefault()` is also left alone. These rules affect who handles the click; they do not turn a contextual instruction into a native relative URL.

Choose one routing attribute per element. Do not combine `url` with `load` or a router-managed `href` attribute.

The following example demonstrates these options.

{% embed url="https://stackblitz.com/edit/router-lite-bypassing-href?ctl=1&embed=1&file=src/my-app.html" %}

## Using the `load` custom attribute

The `load` attribute expresses navigation owned by a route context. It accepts route IDs, paths, component classes, and structured viewport instructions. It can also bind route parameters, select a different context, and expose whether its destination is active.

Use a route ID with a parameter object when a link should follow a configured route even if its path pattern changes.

First, the example below carries the familiar string instructions from `href` over to `load`. The following section adds parameter binding.

{% embed url="https://stackblitz.com/edit/router-lite-load-string-instructions?ctl=1&embed=1&file=src/my-app.html" %}

These links pass string instructions to `load`:

```html
<!-- my-app.html -->
<!-- instructions pointing to individual routes -->
<a load="c1">C1</a>
<a load="c2">C2</a>
<!-- instructions involving sibling viewports -->
<a load="c1+c2">C1+C2</a>
<a load="c1@vp2+c2@vp1">C1@vp2+C2@vp1</a>

<!-- child1 -->
<!-- instruction pointing to parent routing context -->
<a load="../c2">../c2</a>
```

The following sections cover parameters, component classes, and other options for `load`.

### Binding the route-`params`

Bind `params` to supply a route's parameters. The router builds the URL from the route and those values. This example combines a route ID with bound parameters:

{% embed url="https://stackblitz.com/edit/router-lite-load-params?ctl=1&embed=1&file=src/my-app.html" %}

The route has several path patterns. Each link supplies the route ID and a different set of parameters:

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { route } from '@aurelia/router';
import { ChildTwo } from './child2';

@route({
  routes: [
    {
      id: 'r2',
      path: ['c2/:p1/foo/:p2?', 'c2/:p1/foo/:p2/bar/:p3'],
      component: ChildTwo,
    },
  ],
})
export class MyApp {}
```
{% endtab %}
{% tab title="my-app.html" %}
```html
<!-- constructed path: /c2/1/foo/ -->
<a load="route: r2; params.bind: {p1: 1};">C2 {p1: 1}</a>

<!-- constructed path: /c2/2/foo/3 -->
<a load="route: r2; params.bind: {p1: 2, p2: 3};">C2 {p1: 2, p2: 3}</a>

<!-- constructed path: /c2/4/foo/?p3=5 -->
<a load="route: r2; params.bind: {p1: 4, p3: 5};">C2 {p1: 4, p3: 5}</a>

<!-- constructed path: /c2/6/foo/7/bar/8 -->
<a load="route: r2; params.bind: {p1: 6, p2: 7, p3: 8};">C2 {p1: 6, p2: 7, p3: 8}</a>

<!-- constructed path: /c2/9/foo/10/bar/11?p4=awesome&p5=possum -->
<a load="route: r2; params.bind: {p1: 9, p2: 10, p3: 11, p4: 'awesome', p5: 'possum'};">C2 {p1: 9, p2: 10, p3: 11, p4: 'awesome', p5: 'possum'}</a>
```
{% endtab %}
{% endtabs %}

The router chooses the path pattern that matches the most supplied parameters while satisfying that pattern's constraints.

For example, the third link supplies `{p1: 4, p3: 5}`. The pattern `'c2/:p1/foo/:p2/bar/:p3'` requires `p2`, so it cannot match. The router uses `'c2/:p1/foo/:p2?'` and puts the unused `p3` in the query: `/c2/4/foo/?p3=5`.

The fourth link also supplies `p2`. Now `'c2/:p1/foo/:p2/bar/:p3'` matches all three parameters, producing `/c2/6/foo/7/bar/8`.

Parameters that are not consumed by the selected path become query parameters.

Pass parameter values in their original form. For example, `{ key: 'draft(100%)' }` belongs in `params`; do not call `encodeURIComponent` first. The router encodes structured values for the URL and restores the original value when the address is opened again. See [reserved characters](./route-expression-syntax.md#reserved-characters) when authoring a literal instruction or static route path.

### Binding to a different DOM attribute

By default, `load` writes the generated browser URL to `href`. Its `attribute` bindable can select another attribute, or a property on a custom element. Put that setting inside the `load` multi-binding value:

```html
<button type="button"
        load="route: reports; params.bind: { year: selectedYear }; attribute: data-route">
  View report
</button>
```

This writes the URL to `data-route` and lets `load` handle the button's click. Use anchors with the default `href` for ordinary navigation so the browser can offer link actions. A generated URL is not an element ID and should not be used as `aria-controls`.

### Using the route view-model class as `route`

The `route` property also accepts a view-model class. Here is the [parameter-binding example](#binding-the-route-params) using `child1` and `child2` directly:

```typescript
// my-app.ts
import { ChildOne } from './child1';
import { ChildTwo } from './child2';

export class MyApp {
  private readonly child1: typeof ChildOne = ChildOne;
  private readonly child2: typeof ChildTwo = ChildTwo;
}
```

```html
<!-- my-app.html -->
<a load="route.bind: child1">C1</a>
<a load="route.bind: child2; params.bind: {p1: 1};">C2 {p1: 1}</a>
<a load="route.bind: child2; params.bind: {p1: 2, p2: 3};">C2 {p1: 2, p2: 3}</a>
<a load="route.bind: child2; params.bind: {p1: 4, p3: 5};">C2 {p1: 4, p3: 5}</a>
<a load="route.bind: child2; params.bind: {p1: 6, p2: 7, p3: 8};">C2 {p1: 6, p2: 7, p3: 8}</a>
<a load="route.bind: child2; params.bind: {p1: 9, p2: 10, p3: 11, p4: 'awesome', p5: 'possum'};">C2 {p1: 9, p2: 10, p3: 11, p4: 'awesome', p5: 'possum'}</a>
```

You can see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-load-params-u8lfjw?ctl=1&embed=1&file=src/my-app.ts" %}

### Customize the routing context

Like `href`, `load` starts in the [current routing context](#navigate-in-current-and-ancestor-routing-context). In this example, the root and child components each configure routes with IDs `r1` and `r2`. Their `load` links resolve those IDs within the context that owns each link.

{% embed url="https://stackblitz.com/edit/router-lite-load-current-context?ctl=1&embed=1&file=src/my-app.ts" %}

To navigate in another context, bind an `IRouteContext` instance to the `context` property. Resolve the current context with `resolve(IRouteContext)`, then use `context.parent` or `context.parent?.parent` to select an ancestor:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouteContext } from '@aurelia/router';

export class ChildOne {
  readonly parentCtx = resolve(IRouteContext).parent;
}
```
Bind the selected context to `load`:

```html
<a load="route: r2; context.bind: parentCtx">c2</a>
```

The following live example demonstrates this behavior.

{% embed url="https://stackblitz.com/edit/router-lite-load-parent-context?ctl=1&embed=1&file=src/child1.ts" %}

This link looks up `r2` in the parent context. The `r2` route defined by `ChildOne` does not affect it.

Bind `null` to select the root context directly:

```html
<a load="route: r2; context.bind: null">Go to root c2</a>
```

This is shown in the following example.

{% embed url="https://stackblitz.com/edit/router-lite-load-nullroot-context?ctl=1&embed=1&file=src/child1.ts" %}

For a string instruction, a leading `../` selects the parent context. It works with route IDs too:


```html
<a load="route: ../r2">c2</a>
```


### `active` status

The `active` property reports whether the link's instruction is active in its selected context. Bind it from the attribute to style links or set `aria-current`:

```html
<style>
  a.active {
    font-weight: bolder;
  }
</style>

<nav>
  <a
    load="route:foo; params.bind:{id: 1}; active.bind:active1"
    active.class="active1"
    >foo/1</a
  >
  <a load="route:foo/2; active.bind:active2" active.class="active2">foo/2</a>
</nav>

<au-viewport></au-viewport>
```

This can also be seen in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-load-active?ctl=1&embed=1&file=src/my-app.html" %}


{% hint style="info" %}
The [navigation model](./navigation-model.md) also offers an [`isActive` property](./navigation-model.md#using-the-isactive-property).
{% endhint %}

### "active" CSS class

To add a CSS class to active links, set [`activeClass`](./router-configuration.md#configure-active-class) in the router configuration. The `load` attribute adds that class whenever its instruction is active. Use the `active` bindable when you also need the status for other bindings.

## Using the Router API

Use `IContextRouter` for navigation owned by a routed component, or `IRouter` for application-root navigation. Resolve either service through Aurelia's dependency injection:

```typescript
import { resolve } from '@aurelia/kernel';
import { IContextRouter, IRouter } from '@aurelia/router';

export class DetailsPage {
  private readonly contextRouter = resolve(IContextRouter);
  private readonly router = resolve(IRouter);

  openSettings() {
    return this.contextRouter.load('../settings');
  }

  openHome() {
    return this.router.load('home');
  }
}
```

The root router also provides [`navigate()`](./application-url-navigation.md) for application URL references. Its relative references use the last completed location, irrespective of the component making the call.

### Using string instructions

Pass a path directly to `load`:

```typescript
router.load('c1')
router.load('c2')
router.load('c2/42')
router.load('c1+c2')
router.load('c1@vp2+c2@vp1')
```

The method accepts the same string instructions as the `href` and `load` attributes:

{% embed url="https://stackblitz.com/edit/router-lite-irouter-load-string-instructions?ctl=1&embed=1&file=src/my-app.html" %}

#### Choose the routing context for `router.load()`

`IRouter.load()` starts at the root unless you supply a `context`. `IContextRouter.load()` starts at its bound context. Template `load` and router-managed `href` attributes use the context that owns the link.

You can select a context explicitly when navigation is owned somewhere other than the caller:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter, IRouteContext } from '@aurelia/router';

export class WizardStep {
  private readonly router = resolve(IRouter);
  private readonly routeContext = resolve(IRouteContext);

  previousStep() {
    return this.router.load('../1', { context: this.routeContext });
  }

  exitWizard() {
    return this.router.load('dashboard', { context: null });
  }
}
```

Leading `../` prefixes are evaluated from the chosen context. Selecting `routeContext.parent` and then passing `../settings` climbs again. Ascent stops at the root, where the router looks up the remaining instruction.

A component instance, controller, or host element can also supply the context. For example, `router.load('details', { context: this })` uses the owning context of that view model.

#### Use `IContextRouter` for context-aware navigation

`IContextRouter` gives a routed component the same starting context as its template links:

```typescript
import { resolve } from '@aurelia/kernel';
import { IContextRouter } from '@aurelia/router';

export class WizardStep {
  private readonly router = resolve(IContextRouter);

  previousStep() {
    return this.router.load('../1');
  }
}
```

It supports the same instruction forms and navigation options as `IRouter.load()`. An explicit `context` option overrides its bound context. For the app root, use `IRouter`, or resolve `IContextRouter` lazily after the root routing context has been established:

```typescript
import { lazy, resolve } from '@aurelia/kernel';
import { IContextRouter } from '@aurelia/router';

export class MyApp {
  private readonly getRouter = resolve(lazy(IContextRouter));

  openReports() {
    return this.getRouter().load('reports');
  }
}
```

Pass an array of paths to load sibling viewports, with one instruction per viewport:

```typescript
router.load(['c1', 'c2']);
router.load(['c1', 'c2/21']);
```

This is shown in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-array-of-paths-siblings?ctl=1&embed=1&file=src/my-app.html" %}

### Using non-string routing instructions

The `load` method also accepts components and structured instructions.

**Using custom elements**

Pass a custom element class that has a configured route. An array of classes targets sibling viewports:

```typescript
router.load(ChildOne);
router.load([ChildOne, ChildTwo]);

router.load(GrandChildOneOne, { context: this });
```

This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-ce?ctl=1&embed=1&file=src/my-app.ts" %}

**Using custom element definitions**

You can also pass custom element definitions with configured routes, individually or in an array for sibling viewports:

```typescript
import { CustomElement } from '@aurelia/runtime-html';

router.load(CustomElement.getDefinition(ChildOne));
router.load([
  CustomElement.getDefinition(ChildOne),
  CustomElement.getDefinition(ChildTwo)
]);

router.load(
  CustomElement.getDefinition(GrandChildOneOne),
  { context: this }
);
```

This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-ce-definition?ctl=1&embed=1&file=src/util.ts" %}

**Using a function to return the view-model class**

As in [route configuration](./configuring-routes.md#using-a-function-returning-the-class), `load` accepts a function that returns a view-model class:

```typescript
router.load(() => ChildOne);
router.load([() => ChildOne, () => ChildTwo]);

router.load(() => GrandChildOneOne, { context: this });
```

This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-component-factory?ctl=1&embed=1&file=src/my-app.ts" %}

**Using `import()`**

As in [route configuration](./configuring-routes.md#using-inline-import), `load` accepts an `import()` call:

```typescript
router.load(import('./child1'));          // uses the default or first non-default import
router.load([
  import('./child1'),
  import('./child2').then(m => m.Child2) // selective import
]);
```

This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-import?ctl=1&embed=1&file=src/child2.ts" %}

An `import()` call returns a promise, which you can also pass directly to `load`:

```typescript
router.load(Promise.resolve({ ChildOne }));
```

**Using a viewport instruction**

The router converts every `load` instruction into a viewport instruction tree. You can supply a partial viewport instruction directly to set parameters, choose a viewport, or navigate to children:

```typescript
// using a route-id
router.load({ component: 'c1' });

// using a class
router.load({ component: ChildTwo });

// load sibling routes
router.load([
  // use custom element definition
  { component: CustomElement.getDefinition(ChildOne) },
  // use a function returning class
  { component: () => ChildTwo, params: { id: 42 } },
]);

// load sibling routes with nested children and parameters etc.
router.load([
  // using path
  {
    component: 'c1',
    children: [{ component: GrandChildOneTwo }],
    viewport: 'vp2',
  },
  // using import
  {
    component: import('./child2'),
    params: { id: 21 },
    children: [{ component: GrandChildTwoTwo }],
    viewport: 'vp1',
  },
]);
```

This can be seen in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-viewport-instruction?ctl=1&embed=1&file=src/my-app.ts" %}

### Using navigation options

The second argument to `load` supplies options for that navigation, including the `context` used in earlier examples.

**`title`**

Set `title` to override the document title for a single navigation:

```typescript
router.load(Home, { title: 'Some title' });
```

When no custom `buildTitle` is configured, defining `title` like this overrides the title that would otherwise be composed from route configuration title parts.
When a custom `buildTitle` is configured, the builder controls document title generation and can decide whether to use `transition.options.title`.
This can also be seen in the action below where a random title is generated every time.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-title?ctl=1&embed=1&file=src/my-app.ts" %}

**`titleSeparator`**

Set the separator between [title parts](./configuring-routes.md#setting-the-title). The default is `|` (pipe): a root title of `Aurelia` and a route title of `Home` produce `Home | Aurelia`. To change it for one navigation:

```typescript
router.load(Home, { titleSeparator: '-' });
```

`titleSeparator` only affects the default route-tree title composition. It is ignored when `title` provides the document title override for a navigation or when `buildTitle` takes over title generation.

This can also be seen in the action below where a random title separator is selected every time.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-title-separator?ctl=1&embed=1&file=src/my-app.ts" %}

**`queryParams`**

Pass an object to serialize as the query string:

```typescript
// the generated URL: /home?foo=bar&fizz=buzz
router.load(
  'home',
  {
    queryParams: {
      foo: 'bar',
      fizz: 'buzz',
    }
  }
);
```

Query changes update `ICurrentRoute.query`, but do not by themselves rerun `loading()` on a reused component. If `loading()` owns the data refresh, supply `transitionPlan: 'invoke-lifecycles'` on that navigation. A route-level transition plan alone does not override same-path, same-parameter reuse. Alternatively, let the page react to the current query. See [application URL navigation](./application-url-navigation.md) for complete query-driven examples.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-query?ctl=1&embed=1&file=src/my-app.ts" %}

**`fragment`**

The `fragment` option sets the route fragment, available on the `RouteNode` passed to routing lifecycle hooks. It does not automatically scroll to an element with that ID. The application owns any scrolling or focus behavior.

```typescript
// the generated URL: /home#foobar
router.load(
  'home',
  {
    fragment: 'foobar'
  }
);
```

This can be seen in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-query?ctl=1&embed=1&file=src/my-app.ts" %}

**`context`**

`IRouter.load()` starts at the root by default. Supply a `context` to navigate relative to a component, as shown earlier. Several values can identify that context, starting with the component's **view-model instance**:

```typescript
router.load('child-route', { context: this });
```

The `child1.ts` and `child2.ts` files in this example use their view-model instances:

{% embed url="https://stackblitz.com/edit/router-lite-irouter-load-string-instructions?ctl=1&embed=1&file=src/child1.ts" %}


You can also supply an **`IRouteContext` instance**. Resolve it in the component's field initializer:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouteContext, IRouter, Params, route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';

@customElement({ name: 'gc-21', template: 'gc21' })
class GrandChildTwoOne {}

@customElement({ name: 'gc-22', template: 'gc22' })
class GrandChildTwoTwo {}

@route({
  routes: [
    { id: 'gc21', path: ['', 'gc21'], component: GrandChildTwoOne },
    { id: 'gc22', path: 'gc22', component: GrandChildTwoTwo },
  ],
})
@customElement({
  name: 'c-two',
  template: `c2 <br>
  id: \${id}
  <nav>
    <button click.trigger="load('gc21', true)">Go to gc21</button>
    <button click.trigger="load('gc22', true)">Go to gc22</button>
    <button click.trigger="load('c1')"        >Go to c1  </button>
  </nav>
  <br>
  <au-viewport></au-viewport>`,
})
export class ChildTwo {
  private id: string = '';
  private readonly router: IRouter = resolve(IRouter);
  // injected instance of IRouteContext
  private readonly context: IRouteContext = resolve(IRouteContext);

  private load(route: string, useCurrentContext: boolean = false) {
    void this.router.load(
      route,
      useCurrentContext
        ? {
            // use the injected IRouteContext as navigation context.
            context: this.context
          }
        : undefined
    );
  }
  public loading(params: Params) {
    this.id = params.id ?? 'NA';
  }
}
```

You can see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-context-iroutecontext?ctl=1&embed=1&file=src/child2.ts" %}

A **custom element controller** can also supply the context:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter, route } from '@aurelia/router';
import {
  customElement,
  type ICustomElementController,
  type IHydratedCustomElementViewModel,
} from '@aurelia/runtime-html';

@customElement({ name: 'gc-11', template: 'gc11' })
class GrandChildOneOne {}

@customElement({ name: 'gc-12', template: 'gc12' })
class GrandChildOneTwo {}

@route({
  routes: [
    { id: 'gc11', path: ['', 'gc11'], component: GrandChildOneOne },
    { id: 'gc12', path: 'gc12', component: GrandChildOneTwo },
  ],
})
@customElement({
  name: 'c-one',
  template: `c1 <br>
  <nav>
    <button click.trigger="load('gc11', true)">Go to gc11</button>
    <button click.trigger="load('gc12', true)">Go to gc12</button>
    <button click.trigger="load('c2')"        >Go to c2  </button>
  </nav>
  <br>
  <au-viewport></au-viewport>`,
})
export class ChildOne implements IHydratedCustomElementViewModel {
  // set by aurelia pipeline
  public readonly $controller!: ICustomElementController<this>;
  private readonly router: IRouter = resolve(IRouter);

  private load(route: string, useCurrentContext: boolean = false) {
    void this.router.load(
      route,
      useCurrentContext
        ? {
            // use the custom element controller as navigation context
            context: this.$controller
          }
        : undefined
    );
  }
}
```

You can see this in action below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-context-controller?ctl=1&embed=1&file=src/child1.ts" %}

This live example uses the component's **HTML element** as context:

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-context-element?ctl=1&embed=1&file=src/child1.ts" %}

**historyStrategy**

Override the [configured history strategy](./router-configuration.md#configure-browser-history-strategy) for one navigation. Suppose routes `c1`, `c2`, and `c3` use `push`, and the user has visited `c1` followed by `c2`:

```typescript
router.load('c1');
router.load('c2');
```

Now navigate to `c3` with `replace`:

```typescript
router.load('c3', { historyStrategy: 'replace' })
```

Calling `history.back()` loads `c1`, because the entry for `c3` replaced `c2`.

**transitionPlan**

Override the [configured transition plan](./transition-plans.md) for one navigation. The options passed to `load` take precedence over the plans configured on these routes:

```typescript
@route({
  transitionPlan: 'replace',
  routes: [
    {
      id: 'ce1',
      path: ['ce1/:id'],
      component: CeOne,
      transitionPlan: 'invoke-lifecycles',
    },
    {
      id: 'ce2',
      path: ['ce2/:id'],
      component: CeTwo,
      transitionPlan: 'replace',
    },
  ],
})
@customElement({
  name: 'my-app',
  template: `
<button click.trigger="navigate('ce1/42')">ce1/42 (default: invoke lifecycles)</button><br>
<button click.trigger="navigate('ce1/43')">ce1/43 (default: invoke lifecycles)</button><br>
<button click.trigger="navigate('ce1/44', 'replace')">ce1/44 (override: replace)</button><br>
<br>

<button click.trigger="navigate('ce2/42')">ce2/42 (default: replace)</button><br>
<button click.trigger="navigate('ce2/43')">ce2/43 (default: replace)</button><br>
<button click.trigger="navigate('ce2/44', 'invoke-lifecycles')">ce2/44 (override: invoke lifecycles)</button><br>

<au-viewport></au-viewport>
`,
})
export class MyApp {
  private readonly router: IRouter = resolve(IRouter);
  private navigate(
    path: string,
    transitionPlan?: 'replace' | 'invoke-lifecycles'
  ) {
    void this.router.load(
      path,
      transitionPlan ? { transitionPlan } : undefined
    );
  }
}
```

This can be seen in action below.

{% embed url="https://stackblitz.com/edit/router-lite-transitionplan-nav-opt?ctl=1&embed=1&file=src/my-app.ts" %}

## Redirection and unknown paths

To redirect a route or choose what users see for an unknown path, see:

- [Redirection documentation](./configuring-routes.md#redirect-to-another-path)
- Fallback using the [route configuration](./configuring-routes.md#fallback-redirecting-the-unknown-path)
- Fallback using the [viewport attribute](./viewports.md#specify-a-fallback-component-for-a-viewport)

## Checking or using the current route while navigating

`ICurrentRoute` describes the last completed navigation. Its `query` field gives you the parsed query parameters. Route fragments are available on the `RouteNode` passed to routing lifecycle hooks or the completed navigation event's `finalInstructions`. To check whether a contextual destination is active, use `IContextRouter.isActive()` or the `load` attribute's [`active` output](#active-status).

```typescript
import { resolve } from '@aurelia/kernel';
import { ICurrentRoute, IContextRouter } from '@aurelia/router';

export class ReportsLayout {
  readonly currentRoute = resolve(ICurrentRoute);
  private readonly router = resolve(IContextRouter);

  isOverviewActive() {
    return this.router.isActive('overview');
  }

  get sortOrder() {
    return this.currentRoute.query.get('sort') ?? 'name';
  }
}
```

During a routing lifecycle hook, the `next` route node supplies the incoming route's data. Read [current route](./current-route.md) for the distinction between pending and completed navigation.

## Advanced Navigation Patterns

### Error Handling and Navigation Guards Integration

A guard can cancel navigation by returning `false`. A thrown error rejects the navigation promise. Handle those outcomes separately; cancellation is not a request to fall back to a native browser navigation.

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class UserManagement {
  private readonly router = resolve(IRouter);
  navigationMessage = '';

  async openUser(id: string) {
    this.navigationMessage = '';
    try {
      const completed = await this.router.load({
        component: 'user',
        params: { id },
      });
      if (!completed) this.navigationMessage = 'Navigation was canceled.';
    } catch (error) {
      this.navigationMessage = 'The user page could not be opened.';
      console.error(error);
    }
  }
}
```

Keep the call inside `try`, including when using `navigate()`: invalid input can throw before a transition is scheduled. See [error handling](./error-handling.md) for recovery and router events.

### Conditional Navigation with Permissions

Put permission checks in the route's [`canLoad` guard](./routing-lifecycle.md), so they also apply to direct entry and other links. Hiding a menu item does not enforce access. To send the user elsewhere, return a redirect instruction from the guard.

### Navigation with State Preservation

Use query parameters for state that should survive copying or bookmarking the URL. Use the `state` navigation option for data associated with a particular browser history entry:

```typescript
await router.load('search', {
  queryParams: { q: searchTerm, page: 1 },
  state: { returnFocusTo: 'search-input' },
  transitionPlan: 'invoke-lifecycles',
});
```

The router stores your state alongside its own history metadata. Choose `historyStrategy: 'replace'` to update the current entry without adding a Back-button step. For query-only pagination that preserves existing filters and sort order, see [application URL navigation](./application-url-navigation.md).

### Dynamic Navigation Menu

Use the [navigation model](./navigation-model.md) when a menu should reflect configured routes, or bind an application-owned list to `load`. Read each link's active status from the attribute:

```html
<nav aria-label="Reports">
  <a repeat.for="item of items"
     load="route.bind: item.route; params.bind: item.params; active.bind: item.active"
     active.class="item.active"
     aria-current.bind="item.active ? 'page' : null">
    ${item.label}
  </a>
</nav>
```

### Navigation with Loading States

For feedback covering all navigation sources, subscribe to [router events](./router-events.md). A flag around one `load()` call covers only that operation, not links or browser Back/Forward. Dispose event subscriptions when the owning component is disposed.

### Bulk Navigation Operations

To update sibling viewports together, supply an array of instructions in one navigation:

```typescript
await contextRouter.load([
  { component: 'reports', viewport: 'list' },
  { component: 'report', params: { id: reportId }, viewport: 'detail' },
]);
```

The router guards and completes the array as one transition. Separate `load()` calls start separate navigations, even when you add delays between them.

## Path generation
Generate a path when another part of the application needs a string representation of a contextual instruction. For a template link, passing the instruction directly to `load` is usually clearer: the attribute retains its selected context and writes the browser href for you.

Generated routing paths and browser hrefs have different uses. `generatePath()` and the route-context helpers omit the deployment base. [`createHref()`](./application-url-navigation.md) takes an application URL reference and returns a browser-ready href.

### Router API

`IRouter.generatePath()` begins at the root by default. Pass a context as its second argument, or use `IContextRouter.generatePath()` to begin at the component's context:

```typescript
const path = await router.generatePath({
  component: 'user',
  params: { id: 42 },
});

const childPath = await contextRouter.generatePath({
  component: 'report',
  params: { id: reportId },
});
```

Route IDs, configured component classes, hierarchical instructions, and sibling instruction arrays are supported. Promise-valued components and navigation strategies cannot be used for eager path generation.

```typescript
const path = await router.generatePath([
  { component: 'reports', viewport: 'list' },
  { component: 'report', params: { id: 42 }, viewport: 'detail' },
]);
```

### RouteContext API

`IRouteContext` offers `generateRelativePath()` and `generateRootedPath()`. Each result must be used in the appropriate context, as shown below. A leading `/` alone does not tell you which context to use.

#### Generate relative path using `generateRelativePath`

Leading instruction prefixes select the context before generation. A leading `../` is consumed; it is not retained in the result.

Suppose the active route is `/parent/c1`, and the parent configures `{ id: 'c2', path: 'child/:id', component: ChildTwo }`. From `c1`:

```typescript
import { resolve } from '@aurelia/kernel';
import { IContextRouter, IRouteContext } from '@aurelia/router';

export class ChildOne {
  private readonly router = resolve(IContextRouter);
  private readonly context = resolve(IRouteContext);

  async openSibling() {
    const path = await this.context.generateRelativePath({
      component: '../c2',
      params: { id: 42 },
    });
    // path is 'child/42': relative to the selected parent context.
    return this.router.load(path, { context: this.context.parent });
  }
}
```

`contextRouter.generatePath()` and `router.generatePath(instruction, context)` follow the same rule. Replaying `child/42` from the original `c1` context would search the wrong route table.

When generation is unnecessary, retain the authored instruction instead:

```html
<a load="route: ../c2; params.bind: { id: 42 }">Open sibling</a>
```

#### Generated rooted path using `generateRootedPath`

`generateRootedPath()` includes the ancestor route path. Consume its result from the routing root:

```typescript
const path = await routeContext.generateRootedPath({
  component: '../c2',
  params: { id: 42 },
});
await router.load(path); // router is IRouter, using its default root context
```

For the preceding example, the result is `parent/child/42` in history mode and `/#/parent/child/42` in hash mode. The history form is not slash-prefixed, and neither form includes the deployment base. Do not pass these values to `navigate()` as if they were application URL references.

For a rooted generated path in a nested template:

```html
<a load="route.bind: rootedPath; context.bind: null">Open sibling</a>
```

#### Thumb rule

Replay a generated relative path from the context selected during generation. Replay a generated rooted path from the root context. For a link in the current component, pass the original instruction to `load` or router-managed `href`; the attribute keeps the instruction and its context together.

#### Aggregate parameters with `getRouteParameters`

`getRouteParameters()` collects parameters from the current context and its ancestors into a frozen snapshot. By default, the nearest route wins when names collide. Use `mergeStrategy: 'parent-first'` when ancestors should win, and `includeQueryParams: true` to include query values.

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouteContext } from '@aurelia/router';

export class DetailsView {
  private readonly context = resolve(IRouteContext);

  get parameters() {
    return this.context.getRouteParameters({ includeQueryParams: true });
  }
}
```

Read a new snapshot when a reused component needs the current parameters. A snapshot cached in a field initializer keeps the values from that initial read.

Use `mergeStrategy: 'append'` for arrays in ancestor-to-descendant order, or `'by-route'` for values grouped by route identifier:

```typescript
const allValues = routeContext.getRouteParameters({ mergeStrategy: 'append' });
// allValues.id -> ['parent', 'child']

const byRoute = routeContext.getRouteParameters({ mergeStrategy: 'by-route' });
// byRoute.id -> { 'company-route': 'parent', 'details-route': 'child' }
```

See [route parameters](./route-parameters.md) for lifecycle timing and merge options.

## Best Practices and Common Patterns

Use the [reference-point table](#navigation-methods-overview) to choose a navigation method. The following checks help verify the resulting experience.

### When to Use Each Navigation Method

Use contextual `load` links for layout menus and bind their active-route output for styling. Use `navigate` or `url` for destinations written as application URL references, such as a relative URL for paging. Link to other documents with a native `href`.

### Navigation Error Handling

Handle cancellation and exceptions separately. To retry a navigation, save the original instruction and its options; a path alone may omit data needed to reach the same destination. See [error handling](./error-handling.md) for complete examples.

### Performance Considerations

Choose the API that resolves the destination from the right starting point. Update sibling viewports with one instruction array. If profiling shows path generation is significant, include the routing context and parameters in any cache key; the same route ID can mean different routes in different contexts.

### Accessibility Considerations

Use anchors for destinations and meaningful link text. Let `load` write the browser href, and expose the current page with `aria-current` where appropriate. After navigation, manage focus and announce changes according to the application's interaction design. A route fragment alone does not move focus or scroll.

### Testing Navigation

Test the reference point as well as the destination: a nested layout link should keep its target when a deeper page is active. For URLs meant to be shared, verify direct entry or reload and opening the rendered link in a new tab. Include guard cancellation and Back/Forward when navigation changes query-driven state. See [testing the router](./testing-guide.md) for fixtures and integration examples.
