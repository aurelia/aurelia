# Template Variables

In your view templates, you can specify inline variables using the `<let>` custom element.

The `<let>` element supports working with interpolation strings, plain strings, referencing view model variables, and other let bindings within your templates.

```html
<let some-var="This is a string value"></let>
```

You could then display this value using its camelCase variant:

```html
<p>${someVar}</p>
```

You can bind to variable values in a `<let>` too:

```html
<let math-equation.bind="1 + 2 + 5"></let>

<!-- This will display 8 -->
<p>${mathEquation}</p>
```
