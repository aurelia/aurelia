# Attribute Bindings

Attribute binding in Aurelia is a powerful feature that allows you to bind to any native HTML attribute in your templates. This enables dynamic updates to element attributes such as classes, styles, and other standard HTML attributes.

## Basic Binding Syntax

The basic syntax for binding to attributes in Aurelia is straightforward:

```html
<div attribute-name.bind="value"></div>
```

- `attribute-name.bind="value"` is a binding
- `attribute-name` is the target of the binding
- `bind` is the command of the binding
- `value` is the expression of the binding

You can bind to almost any attribute listed in the comprehensive HTML attributes list, which can be found [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes).

{% hint style="info" %}
In a binding with empty expression, i.e `attribute-name.bind` or `attribute-name.bind=""`, the `expression` is automatically inferred based on the `target`: it'll have the value of the camel-case version of the `target`, so `attribute-name.bind=""` would mean `attribute-name.bind="attributeName"`. This behavior is also present in other commands:
- `.one-time`
- `.to-view`
- `.from-view`
- `.two-way`
- `.attr`
{% endhint %}

## Binding Techniques and Syntax

Aurelia provides multiple methods for attribute binding, each with its syntax and use cases.

### Interpolation Binding

Interpolation allows for embedding dynamic values within strings. Here's an example using interpolation to bind the `id` attribute:

```html
<div>
    <h1 id="${headingId}">My Heading</h1>
</div>
```

### Keyword Binding

Aurelia supports several binding keywords, each defining the data flow between the view model and the view:

- `one-time`: Updates the view from the view model once and does not reflect subsequent changes.
- `to-view` / `one-way`: Continuously updates the view from the view model.
- `from-view`: Updates the view model based on changes in the view.
- `two-way`: Creates a two-way data flow, keeping the view and view model in sync.
- `bind`: Automatically determines the appropriate binding mode, defaulting to `two-way` for form elements and `to-view` for most other elements.

### Examples of Keyword Binding

```html
<input type="text" value.bind="firstName">
<input type="text" value.two-way="lastName">
<input type="text" value.from-view="middleName">

<a class="external-link" href.bind="profile.blogUrl">Blog</a>
<a class="external-link" href.to-view="profile.twitterUrl">Twitter</a>
<a class="external-link" href.one-time="profile.linkedInUrl">LinkedIn</a>
```

### Binding to Images

Binding image attributes, such as `src` and `alt`, is as simple as:

```html
<img src.bind="imageSrc" alt.bind="altValue">
```

### Disabling Elements

Bind to the `disabled` attribute to disable buttons and inputs dynamically:

```html
<button disabled.bind="disableButton">Disabled Button</button>
```

### InnerHtml and TextContent

Choose between `innerhtml` for rendering HTML content and `textcontent` for text-only content:

```html
<div innerhtml.bind="htmlContent"></div>
<div textcontent.bind="textContent"></div>
```

## Advanced Binding Techniques

### How Attribute Binding Works

Aurelia uses a mapping function to convert properties to HTML attributes. The attribute mapper handles the conversion, typically changing kebab-case to camelCase. However, not all properties map directly to attributes.

### Using the `.attr` Tag

If automatic mapping fails, use `.attr` to ensure proper attribute binding:

```html
<input pattern.attr="patternProp">
```

### Attribute Binding Behavior

Apply the attribute binding behavior with `.bind` and `& attr` to specify the binding type:

```html
<input pattern.bind="patternProp & attr">
```

## Note on the syntaxes

1. Expression syntax

    One way to understand the varieties of the binding syntaxes, or why we have both binding command and interpolation, is to look at the JS counter part, via the following example:
    ```ts
    const firstName = 'John';
    const lastName = 'Doe';

    const fullName1 = `${firstName} ${lastName}`;
    const fullname2 = firstName + ' ' + lastName;
    const fullName3 = firstName.concat(' ', lastName);
    ```

    All the above examples of building `fullName` from `firstName` and `lastName` arrive at the same result, but there are at least three ways!
    This is to illustrate that sometimes, depending on the preference, one can choose one over another, and the framework should have the flexibility to reflect JavaScript the language.

2. Attribute targeting syntax
    
    Another confusion point is the availability of both `.bind` and `.attr` syntaxes. One may ask why we need both.

    Consider the following example of setting the `id` attribute on an `<input>` element:
    ```ts
    const input = document.createElement('input');
    input.id = 'first-name';
    input.setAttribute('id', 'first-name');
    ```
    
    Either setting the id via `id` property, or calling `setAttribute('id', ...)`  on the `<input>` gives the same outcome, but we have two ways!
    This is partly because of preference one may have, and the fact that Aurelia works with properties, and not all properties reflect to their attribute counterparts. For example, when doing:
    ```html
    <input my-custom-attr.bind='someValue'>
    ```
    the `my-custom-attr.bind="someValue"` will be translated into a binding that update the property `myCustomAttr` on the `<input>`, based on the value of `someValue`. But the html doesn't reflect this `myCustomAttr` property whenever it changes. If we want to have the `<input>` html to reflect that, we need to call the `input.setAttribute('my-custom-attr')`. Consider `.attr` is a simpler way of doing this.


{% hint style="info" %}
Remember, interpolation and keyword binding achieve similar results, and there should be no noticeable difference in performance or features. Choose the syntax based on your preference and the specific requirements of your project.
{% endhint %}
