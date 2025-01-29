# Text interpolation

Text interpolation allows you to display dynamic values in your views. By wrapping an expression with `${}`, you can render variables, object properties, function results, and more within your HTML. This is conceptually similar to [JavaScript template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

## Displaying values with interpolation

Interpolation can display the values of view model properties, object fields, and any valid expression. As an example, consider the following code:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  myName = 'Aurelia';
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<p>Hello, my name is ${myName}</p>
```
{% endcode %}

Here, the template references the same property name, `myName`, that is defined in the view model. Aurelia automatically replaces `${myName}` with "Aurelia" at runtime. Any property you define on your class can be directly accessed inside your templates.

## Template expressions

Expressions inside `${}` can perform operations such as arithmetic, function calls, or ternaries:

{% code title="Addition example" %}
```html
<p>Quick maths: ${2 + 2}</p>
<!-- Outputs "Quick maths: 4" -->
```
{% endcode %}

### Calling functions

You can call functions defined on your view model. For example:

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  adder(val1: number, val2: number): number {
    return val1 + val2;
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```html
<p>Behold mathematics, 6 + 1 = ${adder(6, 1)}</p>
<!-- Outputs "Behold mathematics, 6 + 1 = 7" -->
```
{% endcode %}

### Using ternaries

You can also use ternary operations:

{% code title="my-app.html" %}
```html
<p>${isTrue ? 'True' : 'False'}</p>
```
{% endcode %}

This will display either "True" or "False" depending on the boolean value of `isTrue`.

## Optional Syntax

Aurelia supports the following optional chaining and nullish coalescing operators in templates:

- `??`
- `?.`
- `?.()`
- `?.[]`

{% hint style="warning" %}
Note that `??=` is not supported.
{% endhint %}

You can use these operators to safely handle null or undefined values:

{% code title="Optional chaining and nullish coalescing" %}
```html
<p>User Name: ${user?.name ?? 'Anonymous'}</p>
```
{% endcode %}

This helps avoid lengthy if-statements or ternary checks in your view model when dealing with potentially undefined data.

## Notes on syntax

While template interpolation is powerful, there are a few limitations to keep in mind:

1. You cannot chain expressions using `;` or `,`.
2. You cannot use certain primitives or operators such as `Boolean`, `String`, `instanceof`, or `typeof`.
3. The pipe character `|` is reserved for Aurelia value converters and cannot be used as a bitwise operator inside interpolation.

{% hint style="info" %}
For complex transformations or formatting, consider using Aurelia’s value converters instead of cramming too much logic into an interpolation.
{% endhint %}
