# Interpolation

String interpolation allows you to display values within your template views. By leveraging `${}` which is a dollar sign followed by opening and closing curly braces, you can display values inside of your views. If you are familiar with [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template\_literals), the syntax will be familiar to you.

### Displaying values with interpolation

Interpolation can be used to display the value of variables within your HTML templates, as well as object properties and other forms of valid data.

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

Notice how the variable we reference in our HTML template is the same as it is defined inside of our view model? Anything specified on our view model class is accessible in the view. Aurelia will replace `${myName}` with `Aurelia` think of it as a fancy string replacement. All properties defined in your view-model will be accessible inside of your templates.

### Template expressions

A template expression allows you to perform code operations inside of `${}` we learned about earlier. You can perform addition, subtraction and even call functions inside of interpolation.

In the following simple example, we are adding two and two together, the value that will be displayed will be `4`.

```
<p>Quick maths: ${2 + 2}</p>
```

If you have a function inside of your view model, you can also call functions with parameters.

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

```markup
<p>${isTrue ? 'True' : 'False'}</p>
```

### Syntax

You would be forgiven for thinking that you can do pretty much anything that Javascript allows you to do, but there are limitations in what you can do inside of interpolation you need to be aware of.

1. Expressions cannot be chained using `;` or `,`
2. You cannot use primitives such as `Boolean`, `String`, `instanceOf`, `typeof` and so on
3. Quite a few of the operators introduced in ES2015 and beyond including nullish coalescing and optional chaining
4. You can only use the pipe separator `|` when using value converters, but not as a bitwise operator
