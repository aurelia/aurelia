# Attribute Bindings

Attribute binding in Aurelia allows you to bind to any native HTML attribute in your templates. Binding to HTML attributes in Aurelia allows you to modify classes, style properties, attribute states and more.

The basic syntax for most attributes being bound is:

```html
<div attribute-name.bind="value"></div>
```

You can bind almost every attribute from this list [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes). Some examples of what you can bind to can be found below with code examples.

## Binding syntax

In Aurelia, you can bind attributes in multiple ways, and it is important to understand the difference in syntax. To illustrate our point, we will use the native `id` attribute for our example.

### Binding with interpolation

You can bind values with interpolation. The following example illustrates how this looks.

```html
<div>
    <h1 id="${headingId}">My Heading</h1>
</div>
```

We specify the `id` attribute and then use string interpolation to get the `headingId` value. This will populate the `id` attribute with our value (if one exists).

### Binding with keywords

For a full list of binding keywords, please take a look below. However, we will now bind the `id` attribute using the `.bind` keyword.  If the bound value is `null` or `undefined`, the attribute will not be displayed.

```html
<div>
    <h1 id.bind="headingId">My Heading</h1>
</div>
```

This achieves the same result. The value `headingId` will populate the `id` attribute and add the value.

{% hint style="info" %}
A note on binding. Both approaches detailed above from an implementation perspective are the same. You can use either of the above approaches, and there would be no noticeable difference in performance or features.
{% endhint %}

## Binding Keywords:

* `one-time`: flows data in one direction, from the view model to the view, once.
* `to-view` / `one-way`: flows data in one direction, from the view model to the view.
* `from-view`: flows data in one direction, from the view to the view model.
* `two-way`: flows data both ways, from view-model to view and from view to view-model.
* `bind`: automatically chooses the binding mode. Uses `two-way` binding for form controls and `to-view` binding for almost everything else.

```html
  <input type="text" value.bind="firstName">
  <input type="text" value.two-way="lastName">
  <input type="text" value.from-view="middleName">

  <a class="external-link" href.bind="profile.blogUrl">Blog</a>
  <a class="external-link" href.to-view="profile.twitterUrl">Twitter</a>
  <a class="external-link" href.one-time="profile.linkedInUrl">LinkedIn</a>
```

The first input uses the `bind` command to create `two-way` bindings for input value attribute bindings automatically. The second and third inputs use the `two-way` / `from-view` commands, which explicitly set the binding modes. For the first and second inputs, their value will be updated whenever the bound view-model `firstName` / `lastName` properties are updated, and those properties will also be updated whenever the inputs change.&#x20;

For the third input, changes in the bound view-model `middleName` property will not update the input value. However, changes in the input will update the view model. The first anchor element uses the `bind` command that automatically creates a `to-view` binding for anchor HREF attributes. The other two anchor elements use the `to-view` and `one-time` commands to explicitly set the binding's mode.

## Binding to images

You can bind to numerous image properties, but the most common is the `src` attribute, which allows you to bind the image source. The value in the example below is `image`, a property inside the view model.

```html
<img src.bind="imageSrc">
```

Want to bind to the alt text attribute?

```html
<img src.bind="imageSrc" alt.bind="altValue">
```

## Disabling buttons and inputs

You can easily disable a button by binding to the native `disabled` attribute of buttons and inputs.

{% code title="my-component.html" %}
```html
<button disabled.bind="disableButton">Disabled Button</button>
```
{% endcode %}

The `disableButton` value is a class property boolean. When `disableButton` is `true`, the button is disabled.

{% code title="my-component.ts" %}
```typescript
export class MyComponent {
    disableButton = true;
}
```
{% endcode %}

## Binding to innerHtml and textContent

The native `innerhtml` and `textcontent` properties allow you to set the values of HTML elements. When binding to these properties, the difference between what to choose is `textcontent` will not display HTML tags and `innerhtml` will.

{% code title="my-component.html" %}
```html
<div textcontent.bind="myContent"></div>
```
{% endcode %}

{% code title="my-component.html" %}
```html
<div innerhtml.bind="myContent"></div>
```
{% endcode %}
