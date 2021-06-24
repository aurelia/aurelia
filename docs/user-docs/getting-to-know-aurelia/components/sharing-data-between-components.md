# Sharing data between components

A common pattern in modern web applications is sharing data between a parent component and one or more child components. Components can accept bindable values using the `@bindable` decorator.

To illustrate what a parent/child relationship might look like using components, here is an example:

```markup
<parent-component>
    <child-component first-name="John" last-name="Smith"></child-component>
</parent-component>
```

The `first-name` and `last-name` attributes are configured inside of the `child-component` element as bindable allowing values to be passed into the component.

## Creating bindable properties on components

The `@bindable` decorator signals to Aurelia that a property is bindable in our custom element. Let's create a custom element where we define two bindable properties.

{% tabs %}
{% tab title="name-component.ts" %}
```typescript
import { bindable } from 'aurelia'; 

export class NameComponent {
    @bindable firstName = '';
    @bindable lastName  = '';
}
```
{% endtab %}

{% tab title="name-component.html" %}
```markup
<p>Hello ${firstName} ${lastName}. How are you today?</p>
```
{% endtab %}
{% endtabs %}

You can then use the component in this way: \``<name-component first-name="John" last-name="Smith"></name-component>`

By default, Aurelia will call a change callback \(if it exists\) which takes the bindable property name followed by `Changed` added to the end. For example, `firstNameChanged(newVal, previousVal)` would fire every time the `firstName` bindable property is changed.

## Configuring bindable properties

Like almost everything in Aurelia, you can configure how bindable properties work.

* You can specify the binding mode using the `mode` property and passing in a valid `BindingMode` to it; `@bindable({ mode: BindingMode.twoWay})` - this determines which way changes flow in your binding. By default, this will be `BindingMode.oneWay`
* You can change the name of the callback that is fired when a change is made `@bindable({ callback: 'propChanged' })`

{% tabs %}
{% tab title="name-component.ts" %}
```typescript
import { bindable } from 'aurelia'; 

export class NameComponent {
    @bindable({ mode: BindingMode.twoWay}) firstName = '';
    @bindable({ callback: 'lnameChanged' }) lastName  = '';
    
    lnameChanged(val) {}
}
```
{% endtab %}
{% endtabs %}

