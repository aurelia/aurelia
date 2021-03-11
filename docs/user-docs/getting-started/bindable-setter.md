In some cases you want to make an impact for the value that is binding. For such a scenario you can use the possibility of new `set`.

```ts
@bindable({ 
    set: value => function(value) /* HERE */, 
    mode: /* ... */ 
}) 
```

Suppose you have a `carousel` component in which you want to enable `navigator` feature for it. 
You probably imagine such a thing for yourself.

```html
<!-- Enable -->
<my-carousel navigator.bind="true">
<my-carousel navigator="true">
<my-carousel navigator=true>
<my-carousel navigator>

<!-- Disable -->
<my-carousel navigator.bind="false">
<my-carousel navigator="false">
<my-carousel navigator=false>
<my-carousel>
```

In version two, you can easily implement such a capability with the `set` feature.

To make things easier, first design a new type that accepts `true` and `false` as a string and a boolean.

```ts
export type BooleanString = "true" | "false" | true | false /* boolean */;
```

Define your property like this:

```ts
@bindable({ set: /* ? */, mode: BindingMode.toView }) public navigator: BooleanString = false;
```

For `set` part, we need functionality to check the input, If the value is one of the following, we want to return `true`, otherwise we return the `false` value.

* `''`: No input for a standalone `navigator` property.
* `true`: When the `navigator` property set to `true`.
* `"true"`: When the `navigator` property set to `"true"`.

So our function will be like this

```ts
export function truthyDetector(value: unknown) {
    const isBoolean =
        value === true ||
        value === false ||
        Object.prototype.toString.call(value) === "[object Boolean]";
    const isString = Object.prototype.toString.call(value) === "[object String]";
    if (!isBoolean && !isString) {
        throw "The custom attribute's type must be 'boolean' or 'string'.";
    } else {
        return value === '' || value === true || value === "true";
    }
}
```

Now, we should set `truthyDetector` function as following:

```ts
@bindable({ set: truthyDetector, mode: BindingMode.toView }) public navigator: BooleanString = false;
```

You can simply use any of the above four methods to enable/disable your feature.