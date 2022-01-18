# Styling components

Aurelia makes it easy to work with component styles. From the type of CSS flavor you prefer to work with (CSS, PostCSS, SASS, Stylus) to how you use those styles in your components.

## Working with style conventions

In this section, you will learn how you can style components using conventions as well as with Shadow DOM to encapsulate your CSS styles.

Not always, but sometimes when you are creating components you also want styles for your component. Default conventions for custom elements mean that if you create a custom element and a CSS file with a matching filename, it will be imported automatically.

{% tabs %}
{% tab title="my-component.ts" %}
```typescript
export class MyComponent {

}
```
{% endtab %}

{% tab title="my-component.css" %}
```
.myclass {
  color: red;
}
```
{% endtab %}

{% tab title="my-component.html" %}
```
<p class="myclass">This is red!</p>
```
{% endtab %}
{% endtabs %}

Notice how we didn't import `my-component.css` but when we run the app, it gets imported automatically? That is Aurelia's intuitive conventions at work.

## Shadow DOM

One of the most exciting web specifications is Web Components. Part of the Web Components specification is [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web\_Components/Using\_shadow\_DOM) API. What Shadow DOM offers us is the ability to encapsulate HTML and styles within our web applications, allowing us to deal with a problem that has plagued web development since the beginning: global styles.

In Aurelia, you can work with Shadow DOM in three different ways:&#x20;

1. Global Shadow DOM — all components in your application will be encapsulated
2. Configured Shadow DOM — allows you to opt-in to using Shadow DOM on some components using the decorator `useShadowDOM`
3. Global opt-out Shadow DOM — this is a mix of the previous two configuration options. You can turn on Shadow DOM globally, but then disable it on a per-component basis.

### Setting up Shadow DOM

If you didn't choose Shadow DOM during the initial CLI setup phase using Makes, you can manually configure Aurelia to use Shadow DOM inside of `main.ts`.

```typescript
import Aurelia, { StyleConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(StyleConfiguration.shadowDOM({}))
  .app(MyApp)
  .start();
```

Importing the `StyleConfiguration` class allows us to configure Aurelia to work with different style modes, including Shadow DOM.

If you are using Webpack, additional configuration work needs to be done. The Aurelia CLI output of `makes` will add the following rule into your Webpack configuration.

```javascript
{
  test: /[/\\]src[/\\].+\.html$/i,
  use: {
    loader: '@aurelia/webpack-loader',
    options: {
      defaultShadowOptions: { mode: 'open' }
    }
  },
  exclude: /node_modules/
}
```

### Global shared styles

Unlike the traditional way in which CSS works (populating the global scope) the concept of global styles in Shadow DOM does not exist. However, if you require reusable global-like styles, you can configure shared styles.

A great example of shared styles is using the Bootstrap CSS library.

```typescript
import Aurelia, { StyleConfiguration } from 'aurelia';
import { MyApp } from './my-app';

import bootstrap from 'bootstrap/dist/css/bootstrap.css';

Aurelia
  .register(StyleConfiguration.shadowDOM({
    // optionally add the shared styles for all components
    sharedStyles: [bootstrap]
  }))
  .app(MyApp)
  .start();
```

You can use the `sharedStyles` configuration property to share any CSS styles. Furthermore, the `sharedStyles` property accepts an array of shared styles, so you can have more than one shared stylesheet that all components will get access to.

### Component configuration using useShadowDOM

As we mentioned earlier, Aurelia provides a decorator that allows you to opt-in and opt-out of using Shadow DOM in your web applications. This decorator is called `useShadowDOM` and can be imported from the main `aurelia` package.

Using the decorator without providing any configuration options will enable Shadow DOM on your component in the default mode of `open`.

```typescript
import { useShadowDOM } from 'aurelia';

@useShadowDOM()
export class MyComponent {

}
```

The `useshadowDOM` decorator allows you to specify the mode as a configuration property. For reference on the available modes `open` and `closed` please see below for more details. You can also consult [MDN docs here](https://developer.mozilla.org/en-US/docs/Web/Web\_Components/Using\_shadow\_DOM).

```typescript
import { useShadowDOM } from 'aurelia';

@useShadowDOM({mode: 'closed'})
export class MyComponent {

}
```

Or, to explicitly specify your component as open:

```typescript
import { useShadowDOM } from 'aurelia';

@useShadowDOM({mode: 'open'})
export class MyComponent {

}
```

### Understanding Shadow DOM modes

The Shadow DOM API provides two different modes you can use for your components these modes are part of the specification itself and not Aurelia specific.

#### open

Open mode is the default setting for Shadow DOM. This allows you to access the DOM of a component using Javascript. The DOM is accessible via the [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot) property accessible on the element.

#### closed

Closed mode does the exact opposite of `open` in that the shadowRoot property of your component will return `null` as the component is closed. This is useful for instances where you want components to only be accessible from within.

{% hint style="warning" %}
Where possible, it is recommended that you use `open` mode for your Shadow DOM based components. Open mode allows you to use e2e testing and libraries that rely on the DOM being accessible.
{% endhint %}

## CSS Modules

In some instances, Shadow DOM is not the right fit for your web application needs, particularly the constraints around global styles. If you need an in-between solution that allows you to encapsulate styles, but also use global styles as well, CSS Modules might be the option for you.

