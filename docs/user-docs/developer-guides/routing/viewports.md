# Viewports

The `<au-viewport>` element is where all of the routing magic happens, the outlet. It supports a few different custom attributes which allow you to configure how the router renders your components. It also allows you to use multiple viewports to create different layout configurations with your routing.

## Named viewports

The router allows you to add in multiple viewports into your application and render components into each of those viewport elements by their name. The `<au-viewport>` element supports a name attribute, which you'll want to use if you have more than one of them.

```markup
<main>
    <au-viewport name="main"></au-viewport>
</main>
<aside>
    <au-viewport name="sidebar"></au-viewport>
</aside>
```

In this example, we have the main viewport for our main content and then another viewport called `sidebar` for our sidebar content which is dynamically rendered. When using viewports, think of them like iframes, independent containers that can maintain their own states.

## Fallback routes

The `au-viewport` element supports a `fallback` property that allows us to specify a fallback component if a route is not found. If you created your application using the `npx makes aurelia` command and chose routing, you would already have this in your `my-app.html` file.

For the fallback page, as per the CLI generated approach, we will create two files `missing-page.ts` and `missing-page.html`

{% tabs %}
{% tab title="missing-page.ts" %}
```typescript
import { IRouteViewModel } from 'aurelia';

export class MissingPage implements IRouteViewModel {
  public static parameters = ['id'];
  
  public missingComponent: string ;

  public load(parameters: {id: string}): void {
    this.missingComponent = parameters.id;
  }
}

```
{% endtab %}

{% tab title="missing-page.html" %}
```html
<h3>Ouch! Couldn't find '${missingComponent}'!</h3>
```
{% endtab %}
{% endtabs %}

We then import the missing page component and specify it as our fallback.

```html
<import from="./missing-page"></import>

<au-viewport fallback="missing-page"></au-viewport>
```
