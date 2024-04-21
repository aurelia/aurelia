---
description: Learn to navigate from one view to another using the Router-Lite. Also learn about routing context.
---

# Navigating

This section details the various ways that you can use to navigate from one part of your application to another part.
For performing navigation the router-lite offers couple of alternatives, namely the `href` and the `load` custom attributes, and the `IRouter#load` method.

## Using the `href` custom attribute

You can use the `href` custom attribute with an `a` (anchor) tag, with a string value.
When the users click this link, the router-lite performs the navigation.
This can be seen in action in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-getting-started?ctl=1&embed=1&file=src/main.ts" %}

The example shows that there are two configured routes, `home` and `about`, and in markup there are two anchor tags that points to these routes.
Clicking those links the users can navigate to the desired components, as it is expected.

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
import { route } from '@aurelia/router-lite';
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

You can also use the parameterized routes with the `href` attribute, exactly the same way.
To this end, you need to put the parameter value in the path itself and use the parameterized path in the `href` attribute.
This is shown in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-href-with-bound-parameter?ctl=1&embed=1&file=src/my-app.ts" %}

The example shows two configured routes; one with an optional parameter.
The markup has three anchor tags as follows:

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
import { route } from '@aurelia/router-lite';
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
This is shown in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-href-route-id?ctl=1&embed=1&file=src/my-app.ts" %}

Note that the example set a route id that is different than the defined path.
These route-ids are later used in the markup as the values for the `href` attributes.

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
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
import { route } from '@aurelia/router-lite';
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
import { route } from '@aurelia/router-lite';
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
  </nav>
  <br>
  <au-viewport></au-viewport>`,
})
export class ChildTwo {}
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
Note that using the route-id of a parameterized route with the `href` attribute might be limiting or in some cases non-operational as with `href` attribute there is no way to specify the parameters for the route separately.
This case is handled by the [`load` attribute](#using-the-load-custom-attribute).
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

### Navigate in current and ancestor routing context

The navigation using `href` attribute always happens in the current routing context; that is, the routing instruction will be successful if and only the route is configured in the current routing parent.
This is shown in the example below.

{% embed url="https://stackblitz.com/edit/router-lite-hierarchical-viewport-2mcxwj?ctl=1&embed=1&file=src/main.ts" %}

{% tabs %}
{% tab title="my-app.ts" %}
```typescript
import { route } from '@aurelia/router-lite';
import { ChildOne } from './child1';
import { ChildTwo } from './child2';
import { NotFound } from './not-found';

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
import { route } from '@aurelia/router-lite';
import { customElement } from '@aurelia/runtime-html';

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
    <a href="gc11">gc11</a>
    <a href="gc12">gc12</a>
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
import { route } from '@aurelia/router-lite';
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
  <nav>
    <a href="gc21">gc21</a>
    <a href="gc22">gc22</a>
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

In such cases, the router-lite offers the following syntax to make such navigation possible.

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

By default the router-lite enables usage of the `href` custom attribute, as that ensures that the router-lite handles the routing instructions by default.
There might be cases, where you want to avoid that.
If you want to globally deactivate the usage of `href`, then you can customize the router configuration by setting `false` to the [`useHref` configuration option](./router-configuration.md#enable-or-disable-the-usage-of-the-href-custom-attribute-using-usehref).

To disable/bypass the default handling of router-lite for any particular `href` attribute, you can avail couple of different ways as per your need and convenience.

- Using `external` or `data-external` attribute on the `a` tag.
- Using a non-null value for the `target`, other than the current window name, or `_self`.

Other than that, when clicking the link if either of the `alt`, `ctrl`, `shift`, `meta` key is pressed, the router-lite ignores the routing instruction and the default handling of clicking a link takes place.

Following example demonstrate these options.

{% embed url="https://stackblitz.com/edit/router-lite-bypassing-href?ctl=1&embed=1&file=src/my-app.html" %}

## Using the `load` custom attribute

Although the usage of `href` is the most natural choice, it has some limitations.
Firstly, it allows navigating in the [current routing context](#navigate-in-current-routing-context).
However, a bigger limitation might be that the `href` allows usage of only string values.
This might be bit sub-optimal when the routes have parameters, as in that case you need to know the order of the  parameterized and static segments etc. to correctly compose the string path.
In case the order of those segments are changed, it may cause undesired or unexpected results if your application.

To support structured way to constructing URL the router-lite offers another alternative namely the `load` attribute.
This custom attribute accepts structured routing instructions as well as string-instructions, just like the `href` attribute.
Before starting the discussion on the features supported exclusively by the `load` attribute, let us quickly review the following example of using string-instructions with the `load` attribute.

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
import { route } from '@aurelia/router-lite';
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

One last point to note here is that when un-configured parameters are included in the `params` object, those are converted into query string.

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

export class ChildOne {
  private readonly parentCtx: IRouteContext = resolve(IRouteContext).parent;
}
```
Such ancestor context can then be used to bind the `context` property of the `load` attribute as follows.

```html
<a load="route: r2; context.bind: parentCtx">c2</a>
```

The following live example demonstrate this behavior.

{% embed url="https://stackblitz.com/edit/router-lite-load-parent-context?ctl=1&embed=1&file=src/child1.ts" %}

Note that even though the `ChildOne` defines a route with `r2` route-id, specifying the `context` explicitly, instructs the router-lite to look for a route with `r2` route-id in the parent routing context.

Using the `IRouteContext#parent` path to select the root routing context is somewhat cumbersome when you intend to target the root routing context.
For convenience, the router-lite supports binding `null` to the `context` property which instructs the router to perform the navigation in the root routing context.

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

When using the `load` attribute, you can also leverage the bindable `active` property which is `true` whenever the associated route, bound to the `href` is active.
In the following example, when a link in clicked and thereby the route is activated, the `active*` properties are bound from the views to `true` and thereby applying the `.active`-CSS-class on the `a` tags.

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

Along with the custom attributes on the markup-side, the router-lite also offers the `IRouter#load` method that can be used to perform navigation, with the complete capabilities of the JavaScript at your disposal.
To this end, you have to first inject the router into your component.
This can be done by using the `IRouter` decorator on your component constructor method as shown in the example below.

```typescript
import { resolve } from 'aurelia';
import { IRouter, IRouteableComponent } from '@aurelia/router-lite';

export class MyComponent {
  private readonly router: IRouter = resolve(IRouter);
}
```

Now you are ready to use the `load` method, with many supported overloads at your disposal.
These are outlined below.

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

There is a major important difference regarding the context selection in the `IRouter#load` method and the `href` and `load` custom attributes.
By default, the custom attributes performs the navigation in the current routing context (refer the [`href`](#navigate-in-current-and-ancestor-routing-context) and [`load` attribute](#customize-the-routing-context) documentation).
However, the `load` method always use the root routing context to perform the navigation.
This can be observed in the `ChildOne` and `ChildTwo` components where the `load` method is used the following way to navigate from `ChildOne` to `ChildTwo` and vice versa.
As the `load` API uses the the root routing context by default, such routing instructions works.
In comparison, note that with `href` we needed to use the `..` prefix or with `load` method we needed to set the context to `null.`

```typescript
// in ChildOne
router.load('c2');


// in ChildTwo
router.load('c1');
```

However, on the other hand, you need to specify the routing context, when you want to navigate inside the current routing context.
The most obvious use case is when you issue routing instruction for the child-routes inside a parent component.
This can also be observed in `ChildOne` and `ChildTwo` components where a specific context is used as part of the [navigation options](#using-navigation-options) to navigate to the child routes.

```typescript
// in ChildOne
router.load('gc11', { context: this });

// in ChildTwo
router.load('gc21', { context: this });
```

An array of paths (string) can be used to load components into sibling viewports.
The paths can be parameterized or not non-parameterized.

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

The `title` property allows you to modify the title as you navigate to your route.
This looks like as follows.

```typescript
router.load(Home, { title: 'Some title' });
```

Note that defining the `title` like this, overrides the title defined via the route configuration.
This can also be seen in the action below where a random title is generated every time.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-title?ctl=1&embed=1&file=src/my-app.ts" %}

**`titleSeparator`**

As the name suggests, this provides a configuration option to customize the separator for the [title parts](./configuring-routes.md#setting-the-title).
By default router-lite uses `|` (pipe) as separator.
For example if the root component defines a title `'Aurelia'` and has a route `/home` with title `Home`, then the resulting title would be `Home | Aurelia` when navigating to the route `/home`.
Using this option, you can customize the separator.

```typescript
router.load(Home, { titleSeparator: '-' });
```

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

This can be seen in the live example below.

{% embed url="https://stackblitz.com/edit/router-lite-load-nav-options-query?ctl=1&embed=1&file=src/my-app.ts" %}

**`fragment`**

Like the `queryParams`, using the `fragment` option, you can specify the hash fragment for the new URL.
This can be used as follows.

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
One way to grab the instance of `IRouteContext` is to get it inject via `constructor` using `resolve(IRouteContext)`.
An example looks like as follows.

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouteContext, IRouter, Params, route } from '@aurelia/router-lite';
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
  private id: string;
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
import { resolve } from 'aurelia';
import { IRouter, route } from '@aurelia/router-lite';
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
  public readonly $controller: ICustomElementController<this>;
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
Other sections of the router-lite documentation discusses these topics in detail.
Hence these topics aren't repeated here.
Please refer to the linked documentations for more details.

- [Redirection documentation](./configuring-routes.md#redirect-to-another-path)
- Fallback using the [route configuration](./configuring-routes.md#fallback-redirecting-the-unknown-path)
- Fallback using the [viewport attribute](./viewports.md#specify-a-fallback-component-for-a-viewport)
