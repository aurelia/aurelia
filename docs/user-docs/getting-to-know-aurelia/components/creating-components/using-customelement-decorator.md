# Using @customElement decorator

If you don't want to use conventions, there is a `@customElement` decorator which allows you to verbosely create custom elements. This is what Aurelia does under the hood when it transforms your convention-based components.

{% tabs %}
{% tab title="loader.ts" %}
```typescript
import { customElement } from 'aurelia';
import template from './loader.html'; 

@customElement({
  name: 'loader',
  template
})
export class Loader {
}
```
{% endtab %}

{% tab title="loader.html" %}
```
<p>Loading...</p>
```
{% endtab %}
{% endtabs %}

