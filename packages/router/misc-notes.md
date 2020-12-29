## Viewport/routing scope

Anchors by default target viewports within the same viewport/routing scope as themselves where a viewport define a new viewport/routing scope. To target the viewport the anchor tag is in, it first needs to traverse one step up since it's in the viewport/routing scope below it.
```html
<my-app> <!-- This is top/root viewport scope "my-app" -->
  <a load="my-component">my component</a> <!-- The anchor is located in the "my-app" scope and targets viewport(s) in the same scope --->
  <au-viewport name="main"> <!-- The viewport is located in the "my-app" scope, but starts the "main" scope --->
    <my-component>
      <a load="my-other-component">my other component</a> <!-- The anchor is located in the "main" scope and targets viewport(s) in the same scope BUT THERE ISN'T ONE SO NOT WORKING --->
      <a load="../my-other-component">my other component</a> <!-- The anchor is located in the "main" scope and targets viewport(s) one level above, "my-app", after traversing with ../ so THIS WORKS --->
    </my-component>
  </au-viewport>
</my-app>
```
The `load` method start at the top scope "my-app". An anchor link has a context within the (html/view) viewport scope(s) but a `router.load()` call isn't connected to a scope in the view so it starts at root. It'd be the same as
```html
<a load="/my-other-component">Look for a viewport starting in the root/top viewport scope</a>
```
It's also possible to provide the context/scope to the `router.load()` method so that it, like an anchor link, starts from the viewport scope of the element/view model rather than the root scope. So calling
```typescript
this.router('../my-other-component', { origin: this });
```
from within the view model will have the same result as the `load` attribute on the anchor tag. It is in fact what happens with an anchor tag; `router.load` is called with the element as `origin`.


```ts
const rootScope = new RoutingScope(); // Root scope
const mainViewport = rootScope.addViewport('main-viewport'); // Add a viewport 'main-viewport' to root scope
const instruction = RoutingInstruction.create('products-component', 'main-viewport'); // Create a routing instruction with 'products-component' to be loaded in 'main-viewport'
rootScope.matchEndpoints([instruction], []); // Match the name 'main-viewport' to actual `Viewport` instance (=== `mainViewport`)
->
instruction.component.name === 'products'
instruction.viewport.instance === mainViewport;
```

```html
<!-- app.html -->
<a load="welcome">Ends up in first viewport below</a>
<a load="admin/welcome-admin">Ends up in viewport within au-viewport-scope catching 'admin'</a>
<au-viewport name="main"></au-viewport>
<au-viewport-scope catches="admin">
  <a load="welcome-admin">Ends up in viewport below</a>
  <au-viewport name="main"></au-viewport>
</au-viewport-scope>
```

Change
```html
<a load="a@one">A in first</a>
<a load="b@two">B in second</a>
<au-viewport name="one"></au-viewport>
<au-viewport name="two"></au-viewport>
```
to
```html
<a load="one/a">A in first</a>
<a load="two/b">B in second</a>
<au-viewport-scope catches="one">
  <au-viewport></au-viewport>
</au-viewport-scope>
<au-viewport-scope catches="two">
  <au-viewport></au-viewport>
</au-viewport-scope>
```

A plugin
```html
<!-- cool-plugin.html -->
<import from="./welcome.html"></import>
<import from="./cool-stuff.html"></import>
<p>Some cool plugin</a>
<a load="welcome">Welcome</a>
<a load="cool-stuff">Cool stuff</a>
<au-viewport></au-viewport>
```
that's used
```html
<!-- my-app.html -->
<import from="./welcome.html"></import>
<import from="./cool-plugin.html"></import>
<a load="welcome"></a>
<au-viewport></au-viewport>
<cool-plugin></cool-plugin>
```
would require viewports specified to work. But change the plugin to
```html
<!-- cool-plugin.html -->
<import from="./welcome.html"></import>
<import from="./cool-stuff.html"></import>
<au-viewport-scope catches="cool-stuff">
  <p>Some cool plugin</a>
  <a load="welcome">Welcome</a>
  <a load="cool-stuff">Cool stuff</a>
  <au-viewport></au-viewport>
</au-viewport-scope>
```
or where it's used to
```html
<!-- my-app.html -->
<import from="./cool-plugin.html"></import>
<a load="welcome"></a>
<au-viewport></au-viewport>
<au-viewport-scope catches="my-cool-stuff">
  <cool-plugin></cool-plugin>
</au-viewport-scope>
```
and it works.
