# Attribute Bindings

Attribute binding in Aurelia is a powerful feature that allows you to bind to any native HTML attribute in your templates. This enables dynamic updates to element attributes such as classes, styles, and other standard HTML attributes.

## Basic Binding Syntax

The basic syntax for binding to attributes in Aurelia is straightforward:

```html
<div attribute-name.bind="value"></div>
```

You can bind to almost any attribute listed in the comprehensive HTML attributes list, which can be found [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes).

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

{% hint style="info" %}
Remember, interpolation and keyword binding achieve similar results, and there should be no noticeable difference in performance or features. Choose the syntax based on your preference and the specific requirements of your project.
{% endhint %}
