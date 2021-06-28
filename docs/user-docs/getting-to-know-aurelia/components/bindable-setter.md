# Bindable setter

In some cases, you want to make an impact on the value that is binding. For such a scenario you can use the possibility of new `set`.

```typescript
@bindable({ 
    set: value => function(value),  /* HERE */
    // Or set: value => value,
    mode: /* ... */ 
})
```

Suppose you have a `carousel` component in which you want to enable `navigator` feature for it. You probably imagine such a thing for yourself.

```markup
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

```typescript
export type BooleanString = "true" | "false" | true | false /* boolean */;
```

Define your property like this:

```typescript
@bindable({ set: /* ? */, mode: BindingMode.toView }) public navigator: BooleanString = false;
```

For `set` part, we need functionality to check the input, If the value is one of the following, we want to return `true`, otherwise we return the `false` value.

* `''`: No input for a standalone `navigator` property.
* `true`: When the `navigator` property set to `true`.
* `"true"`: When the `navigator` property set to `"true"`.

So our function will be like this

```typescript
export function truthyDetector(value: unknown) {
    return value === '' || value === true || value === "true";
}
```

Now, we should set `truthyDetector` function as following:

```typescript
@bindable({ set: truthyDetector, mode: BindingMode.toView }) public navigator: BooleanString = false;
```

Although, there is another way to write the functionality too

```typescript
@bindable({ set: v => v === '' || v === true || v === "true", mode: BindingMode.toView }) public navigator: BooleanString = false;
```

You can simply use any of the above four methods to enable/disable your feature.

