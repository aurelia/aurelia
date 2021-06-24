# Component styles

You already know components are just enhanced HTML with view models \(sometimes not even a view model\), which means that they can be styled using plain CSS in a few different ways.

In this section, you will learn how you can style components using conventions as well as with Shadow DOM to encapsulate your CSS styles.

## Working with component styles

Not always, but sometimes when you are creating components you also want styles for your component. Default conventions for custom elements mean that if you create a custom element and a CSS file with the a matching filename, it will be imported automatically.

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



