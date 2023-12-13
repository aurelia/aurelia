# Text interpolation

Text interpolation allows you to display values within your template views. By leveraging `${}`, a dollar sign followed by opening and closing curly braces, you can display values inside your views. The syntax will be familiar to you if you are familiar with [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template\_literals).

### Displaying values with interpolation

Interpolation can be used to display the value of variables within your HTML templates, object properties and other forms of valid data.

To show how interpolation works, here is an example.

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  myName = 'Aurelia';
}
```
{% endcode %}

{% code title="my-app.html" %}
```markup
<p>Hello, my name is ${myName}</p>
```
{% endcode %}

Notice how the variable we reference in our HTML template is the same as it is defined inside of our view model? Anything specified on our view model class is accessible in the view. Aurelia will replace `${myName}` with `Aurelia` think of it as a fancy string replacement. All properties defined in your view model will be accessible inside your templates.

### Template expressions

A template expression allows you to perform code operations inside of `${}` we learned about earlier. You can perform addition, subtraction and even call functions inside of interpolation.

In the following simple example, we are adding two and two together. The value that will be displayed will be `4`.

```html
<p>Quick maths: ${2 + 2}</p>
```

You can call functions with parameters if you have a function inside your view model.

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  adder(val1, val2) {
    return parseInt(val1) + parseInt(val2);
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```markup
<p>Behold mathematics, 6 + 1 = ${adder(6, 1)}</p>
```
{% endcode %}

You can also use ternaries inside of your interpolation expressions:

```html
<p>${isTrue ? 'True' : 'False'}</p>
```

### Optional Syntax

Also supported in template expressions is optional syntax. Aurelia supports the following optional syntax in templates.

* `??`
* `?.`
* `?.()`
* `?.[]`

{% hint style="warning" %}
While Aurelia supports a few optional syntaxes, `??=` is not supported.
{% endhint %}

Using optional syntax and nullish coalescing allows us to create safer expressions without the need for `if.bind` or boilerplate code in view models.

```html
${myValue ?? 'Some default'}
```

This can help clean up what otherwise might have been long and complex ternary expressions to achieve the above result.

### Notes on syntax

You would be forgiven for thinking that you can do pretty much anything that Javascript allows you to do, but there are limitations in what you can do inside of interpolation you need to be aware of.

1. Expressions cannot be chained using `;` or `,`
2. You cannot use primitives such as `Boolean`, `String`, `instanceOf`, `typeof` and so on
3. You can only use the pipe separator `|` when using value converters but not as a bitwise operator
