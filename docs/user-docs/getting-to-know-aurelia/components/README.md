# Components

Custom elements underpin Aurelia applications, they are what you will be spending most of your time creating and can be consisted of:

* A HTML template \(view\)
* A class that constitutes the view model
* An optional CSS stylesheet

## Creating a custom element

A custom element consisting of a view model, view and stylesheet would look like this on a basic level. Please note that stylesheets are optional. Creating a stylesheet with the same name as your custom element will be seen by Aurelia and automatically imported for you as well.

{% code title="my-component.ts" %}
```typescript
import { customElement } from 'aurelia';

import template from './my-component.html';

@customElement({ name: 'my-component', template })
export class MyComponent {
}
```
{% endcode %}

The value passed to `customElement` will make up the HTML tag name. To reference it, you would write: `<my-component></my-component>`.

{% code title="my-component.html" %}
```markup
<h1>My component</h1>
<p>Some paragraph text.</p>
```
{% endcode %}

{% code title="my-component.css" %}
```css
h1 {
    color: #000;
    font-size: 22px;
}
```
{% endcode %}

