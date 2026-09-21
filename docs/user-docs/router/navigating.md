---
description: Learn to navigate from one view to another using the Aurelia router, including declarative and programmatic navigation patterns.
---

# Navigating

A route can be identified by the component or layout that owns it, or by its place in the application URL. Choose that reference point first; then use a template link or a programmatic call to express the navigation.

For example, a Reports link in an admin sidebar should keep opening the admin layout's Reports route as the user moves among its descendants. A link to the next item in the currently displayed URL has a different reference point. Aurelia supports both without making the sidebar depend on the depth of the active page.

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

The router-managed `href` attribute is a string shorthand for contextual routing instructions. It uses the same reference point as `load`, and differs from a native browser `href`. Both router attributes render a real `href` for browser actions such as copying a link or opening a new tab.

The `url` attribute requires explicit registration of `UrlCustomAttribute`; it is not registered by `RouterConfiguration`. See [application URL navigation](./application-url-navigation.md) for setup and URL-relative examples. Keep `load` for menus that need its active-route output or instructions that target particular viewports.

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

Routing contexts are established by routed components. They are not URL directories: a route configured as `items/:id/details` can consume three URL segments while creating one context. `../` in `load` climbs a context; `../` in `navigate` follows URL-segment rules.

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

The last `href` attribute is an example of a parameterized route.

### Using route-id

While configuring routes, an [`id` for the route](./configuring-routes.md#advanced-route-configuration-options) can be set explicitly.
This `id` can also be used with the `href` attribute.

An ID can take precedence over a matching literal path. Avoid giving one route an ID that is a different route's path in the same context. Development warning [AUR3179](../developer-guides/error-messages/router/aur3179.md) identifies provable single-segment collisions without changing that precedence.

{% embed url="https://stackblitz.com/edit/router-lite-href-route-id?ctl=1&embed=1&file=src/my-app.ts" %}

Note that the example set a route id that is different than the defined path.
These route-ids are later used in the markup as the values for the `href` attributes.

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

You can target [named](./viewports.md#named-viewports) and/or [sibling](./viewports.md#sibling-viewports) viewports.
To this end, you can use the following syntax.

```
{path1}[@{viewport-name}][+{path2}[@{sibling-viewport-name}]]
```

The following live example, demonstrates that.

{% embed url="https://stackblitz.com/edit/router-lite-named-sibling-viewport-href?ctl=1&embed=1&file=src/my-app.html" %}

The example shows the following variations.

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

Note that using the viewport name in the routing instruction is optional and when omitted, the router uses the first available viewport.

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

In the example, the root component has two child-routes (`c1`, `c2`) and every child component in turn has 2 child-routes (`gc11`, and `gc12` and `gc21`, and `gc22` respectively) of their own.
In this case, any `href` pointing to any of the immediate child-routes (and thus configured in the current routing parent) works as expected.
However, when an `href`, like below (refer `child1.ts`), is used to navigate from one child component to another child component, it does not work.

```html
 <a href="c2">c2 (doesn't work)</a>
```

In such cases, the router offers the following syntax to make such navigation possible.

```html
<a href="../c2">../c2 (works)</a>
```

That is, you can use `../` prefix to instruct the router to point to the parent routing context.
The prefix can also be used multiple times to point to any ancestor routing context.
Naturally, this does not go beyond the root routing context.

Contextually, note that the [example involving route-id](#using-route-id) also demonstrates the behavior of navigating in the current context.
In that example, the root component uses `r1`, and `r2` as route identifiers, which are the same identifiers used in the children to identify their respective child-routes.
The route-ids are used in the markup with the `href` attributes.
Despite being the same route-ids, the navigation works because unless specified otherwise, the routing instructions are constructed under the current routing context.

### Bypassing the `href` custom attribute

Use `external` (or `data-external`) when a relative or root-relative `href` belongs to the browser rather than to the router:

```html
<a href="/downloads/guide.pdf" external>Download the guide</a>
<a href="../help.html" external>Help document</a>
```

Full URLs and schemes such as `https:`, `mailto:`, `tel:`, and protocol-relative `//example.com/path` are treated as external automatically. This includes an absolute URL to the same origin.

Setting [`useHref: false`](./router-configuration.md#enable-or-disable-the-usage-of-the-href-custom-attribute-using-usehref) disables click interception by the router-managed `href` attribute. The attribute still resolves routing instructions and writes their generated URLs. Use `external` to preserve the authored native URL as well.

For router-generated links, the browser handles modified clicks, non-primary mouse buttons, `download`, and a `target` other than `_self` or the current window name. A click already canceled with `preventDefault()` is also left alone. These rules affect who handles the click; they do not turn a contextual instruction into a native relative URL.

Use one navigation owner per element. In particular, do not combine `url` with `load` or a router-managed `href` attribute.

Following example demonstrate these options.

{% embed url="https://stackblitz.com/edit/router-lite-bypassing-href?ctl=1&embed=1&file=src/my-app.html" %}

## Using the `load` custom attribute

The `load` attribute expresses navigation owned by a route context. It accepts route IDs, paths, component classes, and structured viewport instructions. It can also bind route parameters, select a different context, and expose whether its destination is active.

Use a route ID with a parameter object when a link should follow a configured route even if its path pattern changes.

{% embed url="https://stackblitz.com/edit/router-lite-load-string-instructions?ctl=1&embed=1&file=src/my-app.html" %}

The example shows various instances of `load` attribute with various string instructions.

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

The following sections discuss the various other ways routing instruction can be used with the `load` attribute.

### Binding the route-`params`

Using the bindable `params` property in the `load` custom attribute, you can bind the parameters for a parameterized route.
The complete URL is then constructed from the given route and the parameters.
Following is an example where the route-id is used with bound parameters.

{% embed url="https://stackblitz.com/edit/router-lite-load-params?ctl=1&embed=1&file=src/my-app.html" %}

The example above configures a route as follows.
The route-id is then used in the markup with the bound `params`, as shown in the example below.

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

An important thing to note here is how the URL paths are constructed for each URL.
Based on the given set of parameters, a path is selected from the configured set of paths for the route, that maximizes the number of matched parameters at the same time meeting the parameter constraints.

For example, the third instance (params: `{p1: 4, p3: 5}`) creates the path `/c2/4/foo/?p3=5` (instance of `'c2/:p1/foo/:p2?'` path) even though there is a path with `:p3` configured.
This happens because the bound parameters-object is missing the `p2` required parameter in the path pattern `'c2/:p1/foo/:p2/bar/:p3'`.
Therefore, it constructs the path using the pattern `'c2/:p1/foo/:p2?'` instead.

In other case, the fourth instance provides a value for `p2` as well as a value for `p3` that results in the construction of path `/c2/6/foo/7/bar/8` (instance of `'c2/:p1/foo/:p2/bar/:p3'`).
This case also demonstrates the aspect of "maximization of parameter matching" while path construction.

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

The bindable `route` property in the `load` attribute supports binding a class instead of route-id.
The following example demonstrates [the `params`-example](#binding-the-route-params) using the classes (`child1`, `child2`) directly, instead of using the route-id.

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

Just like the `href` attribute, the `load` attribute also supports navigating in the [current routing context](#navigate-in-current-and-ancestor-routing-context) by default.
The following example shows this where the root component has two child-routes with `r1` and `r2` route-ids and the child-components in turn defines their own child-routes using the same route-ids.
The `load` attributes also use the route-ids as routing instruction.
The routing works in this case, because the routes are searched in the same routing context.

{% embed url="https://stackblitz.com/edit/router-lite-load-current-context?ctl=1&embed=1&file=src/my-app.ts" %}

However, this default behavior can be changed by binding the `context` property of the `load` custom attribute explicitly.
To this end, you need to bind the instance of `IRouteContext` in which you want to perform the navigation.
The most straightforward way to select a parent routing context is to use the `parent` property of the `IRouteContext`.
The current `IRouteContext` can be injected using the `resolve(IRouteContext)`.
Then one can use `context.parent`, `context.parent?.parent` etc. to select an ancestor context.

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouteContext } from '@aurelia/router';

export class ChildOne {
  readonly parentCtx = resolve(IRouteContext).parent;
}
```
Such ancestor context can then be used to bind the `context` property of the `load` attribute as follows.

```html
<a load="route: r2; context.bind: parentCtx">c2</a>
```

The following live example demonstrate this behavior.

{% embed url="https://stackblitz.com/edit/router-lite-load-parent-context?ctl=1&embed=1&file=src/child1.ts" %}

Note that even though the `ChildOne` defines a route with `r2` route-id, specifying the `context` explicitly, instructs the router to look for a route with `r2` route-id in the parent routing context.

Using the `IRouteContext#parent` path to select the root routing context is somewhat cumbersome when you intend to target the root routing context.
For convenience, the router supports binding `null` to the `context` property which instructs the router to perform the navigation in the root routing context.

```html
<a load="route: r2; context.bind: null">Go to root c2</a>
```

This is shown in the following example.

{% embed url="https://stackblitz.com/edit/router-lite-load-nullroot-context?ctl=1&embed=1&file=src/child1.ts" %}

When the route context selection involves only ancestor context, then the `../` prefix can be used when using string instruction.
This also works when using the route-id.
The following code snippets shows, how the previous example can be written using the `../` prefix.


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
Note that the [navigation model](./navigation-model.md) also offers a [`isActive` property](./navigation-model.md#using-the-isactive-property).
{% endhint %}

### "active" CSS class

The `active` bindable can be used for other purposes, other than adding CSS classes to the element.
However, if that's what you need mostly the `active` property for, you may choose to configure the [`activeClass` property](./router-configuration.md#configure-active-class) in the router configuration.
When configured, the `load` custom attribute will add that configured class to the element when the associated routing instruction is active.

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

The easiest way to use the `load` method is to use the paths directly.

```typescript
router.load('c1')
router.load('c2')
router.load('c2/42')
router.load('c1+c2')
router.load('c1@vp2+c2@vp1')
```

With respect to that, this method supports the string instructions supported by the `href` and the `load` attribute.
This is also shown in the example below.

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

Leading `../` prefixes are evaluated from the chosen context. Selecting `routeContext.parent` and then passing `../settings` climbs again. At the root, further ascent remains at the root; whether the remaining route exists is a separate question.

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

An array of paths (string) can be used to load components into sibling viewports.
Each string is an instruction for a sibling viewport.

```typescript
router.load(['c1', 'c2']);
router.load(['c1', 'c2/21']);
```

This is shown in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-array-of-paths-siblings?ctl=1&embed=1&file=src/my-app.html" %}

### Using non-string routing instructions

The `load` method also support non-string routing instruction.

**Using custom elements**

You can use the custom element classes directly for which the routes have been configured.
Multiple custom element classes can be used in an array to target sibling viewports.

```typescript
router.load(ChildOne);
router.load([ChildOne, ChildTwo]);

router.load(GrandChildOneOne, { context: this });
```

This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-ce?ctl=1&embed=1&file=src/my-app.ts" %}

**Using custom element definitions**

You can use the custom element definitions for which routes have been configured.
Multiple definitions can be used in an array to target sibling viewports.

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

Similar to [route configuration](./configuring-routes.md#using-a-function-returning-the-class), for `load` you can use a function that returns a class as routing instruction.
This looks like as follows.

```typescript
router.load(() => ChildOne);
router.load([() => ChildOne, () => ChildTwo]);

router.load(() => GrandChildOneOne, { context: this });
```

This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-component-factory?ctl=1&embed=1&file=src/my-app.ts" %}

**Using `import()`**

Similar to [route configuration](./configuring-routes.md#using-inline-import), for `load` you can use an `import()` statement to import a module.
This looks like as follows.

```typescript
router.load(import('./child1'));          // uses the default or first non-default import
router.load([
  import('./child1'),
  import('./child2').then(m => m.Child2) // selective import
]);
```

This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-import?ctl=1&embed=1&file=src/child2.ts" %}

Note that because invoking the `import()` function returns a promise, you can also use a promise directly with the `load` function.

```typescript
router.load(Promise.resolve({ ChildOne }));
```

**Using a viewport instruction**

Any kind of routing instruction used for the `load` method is converted to a viewport instruction tree.
Therefore, you can also use a (partial) viewport instruction directly with the `load` method.
This offers maximum flexibility in terms of configuration, such as routing parameters, viewports, children etc.
Following are few examples, how the viewport instruction API can be used.

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

Along with using the routing instructions, the `load` method allows you to specify different navigation options on a per-use basis.
One of those, the `context`, you have already seen in the examples in the previous sections.
This section describes other available options.

**`title`**

The `title` property lets you override the document title for a single navigation.
This looks like as follows.

```typescript
router.load(Home, { title: 'Some title' });
```

When no custom `buildTitle` is configured, defining `title` like this overrides the title that would otherwise be composed from route configuration title parts.
When a custom `buildTitle` is configured, the builder controls document title generation and can decide whether to use `transition.options.title`.
This can also be seen in the action below where a random title is generated every time.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-title?ctl=1&embed=1&file=src/my-app.ts" %}

**`titleSeparator`**

As the name suggests, this provides a configuration option to customize the separator for the [title parts](./configuring-routes.md#setting-the-title).
By default router uses `|` (pipe) as separator.
For example if the root component defines a title `'Aurelia'` and has a route `/home` with title `Home`, then the resulting title would be `Home | Aurelia` when navigating to the route `/home`.
Using this option, you can customize the separator.

```typescript
router.load(Home, { titleSeparator: '-' });
```

`titleSeparator` only affects the default route-tree title composition. It is ignored when `title` provides the document title override for a navigation or when `buildTitle` takes over title generation.

This can also be seen in the action below where a random title separator is selected every time.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-title-separator?ctl=1&embed=1&file=src/my-app.ts" %}

**`queryParams`**

This option lets you specify an object to be serialized to a query string.
This can be used as follows.

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

As by default, the `load` method performs the navigation relative to root context, when navigating to child routes, the context needs to be specified.
This navigation option has also already been used in various examples previously.
Various types of values can be used for the `context`.

The easiest is to use the custom element **view model instance**.
If you are reading this documentation sequentially, then you already noticed this.
An example looks like as follows.

```typescript
router.load('child-route', { context: this });
```

Here is one of the previous example.
Take a look at the `child1.ts` or `child2.ts` that demonstrates this.

{% embed url="https://stackblitz.com/edit/router-lite-irouter-load-string-instructions?ctl=1&embed=1&file=src/child1.ts" %}


You can also use an **instance of `IRouteContext`** directly.
Resolve `IRouteContext` from the component as a field initializer:
An example looks like as follows.

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

Using a **custom element controller** instance is also supported to be used as a value for the `context` option.
An example looks as follows.

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

And lastly, you can use the **HTML element** as context.
Following is live example of this.

{% embed url="https://stackblitz.com/edit/router-lite-irouterload-context-element?ctl=1&embed=1&file=src/child1.ts" %}

**historyStrategy**

Using this navigation option, you can override the [configured history strategy](./router-configuration.md#configure-browser-history-strategy).
Let us consider the example where three routes `c1`, `c2`, and `c3` are configured with the `push` history strategy.
Let us also assume that the following navigation instructions have already taken place.

```typescript
router.load('c1');
router.load('c2');
```

After this, if we issue the following instruction,

```typescript
router.load('c3', { historyStrategy: 'replace' })
```

then performing a `history.back()` should load the `c1` route, as the state for `c2` is replaced.

**transitionPlan**

Using this navigation option, you can override the [configured transition plan](./transition-plans.md) per routing instruction basis.
The following example demonstrates that even though the routes are configured with a specific transition plans, using the router API, the transition plans can be overridden.

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

For completeness it needs to be briefly discussed that apart from the explicit navigation instruction, there can be need to redirect the user to a different route or handle unknown routes gracefully.
Other sections of the router documentation discusses these topics in detail.
Hence these topics aren't repeated here.
Please refer to the linked documentations for more details.

- [Redirection documentation](./configuring-routes.md#redirect-to-another-path)
- Fallback using the [route configuration](./configuring-routes.md#fallback-redirecting-the-unknown-path)
- Fallback using the [viewport attribute](./viewports.md#specify-a-fallback-component-for-a-viewport)

## Checking or using the current route while navigating

`ICurrentRoute` describes the last completed navigation. Read its `query` field directly instead of splitting the serialized URL. Route fragments are available on the `RouteNode` passed to routing lifecycle hooks or the completed navigation event's `finalInstructions`. To check whether a contextual destination is active, use `IContextRouter.isActive()` or the `load` attribute's [`active` output](#active-status).

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

Permission checks that protect a route belong in its [`canLoad` guard](./routing-lifecycle.md), so they also apply to direct entry and other links. Hiding a menu item may improve the interface, but does not enforce access. Return a redirect instruction from the guard when appropriate rather than starting a second navigation inside it.

### Navigation with State Preservation

Use query parameters for state that should survive copying or bookmarking the URL. Use the `state` navigation option for data associated with a particular browser history entry:

```typescript
await router.load('search', {
  queryParams: { q: searchTerm, page: 1 },
  state: { returnFocusTo: 'search-input' },
  transitionPlan: 'invoke-lifecycles',
});
```

The router retains your state alongside its own history metadata. Choose `historyStrategy: 'replace'` when the change should update the current entry rather than add a Back-button step. For query-only pagination that preserves existing filters and sort order, see [application URL navigation](./application-url-navigation.md).

### Dynamic Navigation Menu

Use the [navigation model](./navigation-model.md) when a menu should reflect configured routes, or bind an application-owned list to `load`. Bind active status from the attribute rather than comparing route IDs to serialized paths:

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

This gives the router one transition to guard and complete. Sequential `load()` calls describe separate navigations; adding delays between them does not make them an atomic update.

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

`IRouteContext` offers `generateRelativePath()` and `generateRootedPath()`. The distinction is the context in which the result must be consumed, not whether the returned text begins with `/`.

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

Replay a generated relative path from the context selected during generation. Replay a generated rooted path from the root context. If the purpose is a link in the current component, let `load` or router-managed `href` keep the original instruction and its context instead of generating and reinterpreting a string.

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

A snapshot does not update after navigation. Read it again when a reused component needs the current parameters; do not cache it once in a field initializer and expect later values to appear.

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

A menu owned by a layout benefits from contextual `load` links and active-route output. URL-driven paging, location-relative actions, and application-root URLs belong with `navigate` or `url`. Native documents retain native `href` behavior. These choices remain the same whether the code is short or the application is complex.

### Navigation Error Handling

Keep cancellation distinct from exceptions, and preserve enough information to retry the intended operation. A path alone can lose the selected context, parameters, query, or fragment. See [error handling](./error-handling.md) for complete examples.

### Performance Considerations

Select navigation APIs for their semantics. For sibling viewport updates, use one instruction array rather than several competing navigations. If profiling shows path generation is significant, account for the routing context and parameters before caching results; the same route ID can mean different routes in different contexts.

### Accessibility Considerations

Use anchors for destinations and meaningful link text. Let `load` write the browser href, and expose the current page with `aria-current` where appropriate. After navigation, manage focus and announce changes according to the application's interaction design. A route fragment alone does not move focus or scroll.

### Testing Navigation

Test the reference point as well as the destination: a nested layout link should keep its target when a deeper page is active. For URLs meant to be shared, verify direct entry or reload and opening the rendered link in a new tab. Include guard cancellation and Back/Forward when navigation changes query-driven state. See [testing the router](./testing-guide.md) for fixtures and integration examples.
