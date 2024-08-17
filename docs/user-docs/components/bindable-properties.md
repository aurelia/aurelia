---
description: >-
  How to create components that accept one or more bindable properties. You
  might know these as "props" if you are coming from other frameworks and
  libraries.
---

## Bindable properties

When creating components, sometimes you will want the ability for data to be passed into them instead of their host elements. The `@bindable` decorator allows you to specify one or more bindable properties for a component.

The `@bindable` attribute also can be used with custom attributes as well as custom elements. The decorator denotes bindable properties on components on the view model of a component.

{% code title="loader-component.ts" %}
```typescript
import { bindable } from 'aurelia';

export class LoaderComponent {
    @bindable loading = false;
}
```
{% endcode %}

This will allow our component to be passed in values. Our specified bindable property here is called `loading` and can be used like this:

{% code title="loader-component.html" %}
```html
<loader loading.bind="true"></loader>
```
{% endcode %}

In the example above, we are binding the boolean literal `true` to the `loading` property.

Instead of literal, you can also bind another property (`loadingVal` in the following example) to the `loading` property.

{% code title="loader-component.html" %}
```html
<loader loading.bind="loadingVal"></loader>
```
{% endcode %}

As seen in the following example, you can also bind values without the `loading.bind` part.

```html
<loader loading="true"></loader>
```

{% hint style="warning" %}
Aurelia treats attribute values as strings. This means when working with primitives such as booleans or numbers, they won't come through in that way and need to be coerced into their primitive type using a [bindable setter](bindable-properties.md#bindable-setter) or specifying the bindable type explicitly using [bindable coercion](bindable-properties.md#bindable-coercion).
{% endhint %}

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
```html
<p>Hello ${firstName} ${lastName}. How are you today?</p>
```
{% endtab %}
{% endtabs %}

You can then use the component in this way,\``<name-component first-name="John" last-name="Smith"></name-component>`

## Calling a change function when bindable is modified

By default, Aurelia will call a change callback (if it exists) which takes the bindable property name followed by `Changed` added to the end. For example, `firstNameChanged(newVal, previousVal)` would fire every time the `firstName` bindable property is changed.

{% hint style="warning" %}
Due to the way the Aurelia binding system works, change callbacks will not be fired upon initial component initialization. If you worked with Aurelia 1, this behavior differs from what you might expect.&#x20;
{% endhint %}

If you would like to call your change handler functions when the component is initially bound (like v1), you can achieve this the following way:

```typescript
import { bindable } from 'aurelia';

export class NameComponent {
    @bindable firstName = '';
    @bindable lastName  = '';

    bound() {
        this.firstNameChanged(this.firstName, undefined);
    }

    firstNameChanged(newVal, oldVal) {
        console.log('Value changed');
    }
}
```

If you have multiple bindable properties like `firstName`/`lastName` in the above example, and want to use a single callback to react to those changes,
you can use `propertyChanged` callback. `propertyChanged` callback will be called immediately after the targeted change callback.
The parameters of this callback will be `key`/`newValue`/`oldValue`, similar like the following example:

```ts
export class NameComponent {
    @bindable firstName = '';
    @bindable lastName  = '';

    propertyChanged(key, newVal, oldVal) {
      if (key === 'firstName') {

      } else if (key === 'lastName') {

      }
    }
```

In the above example, even though `propertyChanged` can be used for multiple properties (like `firstName` and `lastName`), it's only called individually for each of those properties.
If you wish to act on a group of changes, like both `firstName` and `lastName` at once in the above example, `propertiesChanged` callback can used instead, like the following example:
```ts
propertiesChanged({ firstName, lastName }) {
  if (firstName && lastName) {
    // both firstName and lastName were changed at the same time
    // apply first update strategy
    const { newValue: newFirstName, oldValue: oldFirstName } = firstName;
    const { newValue: newLastName, oldValue: oldLastName } = lastName;
  } else if (firstName) {
    // only firstName was changed - apply second update strategy
    // ...
  } else {
    // only lastName was changed - apply third update strategy
    // ...
  }
}
```

For the order of callback when there' multiple callbacks involved, refer the following example:
If we have a component class that looks like this:
```ts
class MyComponent {
  @bindable prop = 0
  
  propChanged() { console.log('prop changed'); }

  propertyChanged(name) { console.log(`property "${name}" changed`) }

  propertiesChanged(changes) {
    console.log('changes are:', changes)
  }
}
```
When we do
```ts
myComponent.prop = 1;
console.log('after assign');
```
the console logs will look like the following:

```
propChanged
property "prop" changed
after assign
changes are, { prop: { newValue: 1, oldValue: 0 } }
```

## Configuring bindable properties

Like almost everything in Aurelia, you can configure how bindable properties work.&#x20;

### Change the binding mode using mode

You can specify the binding mode using the `mode` property and passing in a valid `BindingMode` to it; `@bindable({ mode: BindingMode.twoWay})` - this determines which way changes flow in your binding. By default, this will be `BindingMode.oneWay`

{% hint style="info" %}
Please consult the [binding modes](bindable-properties.md#one-way-binding) documentation below to learn how to change the binding modes. By default, the binding mode for bindable properties will be `one-way`
{% endhint %}

### Change the name of the change callback

You can change the name of the callback that is fired when a change is made `@bindable({ callback: 'propChanged' })`

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

Bindable properties support many different binding modes determining the direction the data is bound in and how it is bound.

### One way binding

By default, bindable properties will be one-way binding. This means values flow into your component but not back out of it (hence the name, one way).

{% hint style="info" %}
Bindable properties without an `mode` explicitly set will be `one-way` by default. You can also explicitly specify the binding mode.
{% endhint %}

```typescript
import { bindable, BindingMode } from 'aurelia';

export class Loader {
    @bindable({ mode: BindingMode.oneWay })
}
```

### Two-way binding

Unlike the default, the two-way binding mode allows data to flow in both directions. If the value is changed with your component, it flows back out.

```typescript
import { bindable, BindingMode } from 'aurelia';

export class Loader {
    @bindable({ mode: BindingMode.twoWay})
}
```

## Working with two-way binding

Much like most facets of binding in Aurelia, two-way binding is intuitive. Instead of `.bind` you use `.two-way` if you need to be explicit, but in most instances, you will specify the type of binding relationship a bindable property is using with `@bindable` instead.

**Explicit two-way binding looks like this:**

```html
<input type="text" value.two-way="myVal">
```

The `myVal` variable will get a new value whenever the text input is updated. Similarly, if `myVal` were updated from within the view model, the input would get the updated value.

{% hint style="info" %}
When using `.bind` for input/form control values such as text inputs, select dropdowns and other form elements. Aurelia will automatically create a two-way binding relationship. So, the above example using a text input can be rewritten to be `value.bind="myVal"` , and it would still be a two-way binding.
{% endhint %}

## Bindable setter

In some cases, you want to make an impact on the value that is binding. For such a scenario, you can use the possibility of new `set`.

```typescript
@bindable({
    set: value => someFunction(value),  /* HERE */
    // Or set: value => value,
    mode: /* ... */
})
```

Suppose you have a `carousel` component in which you want to enable `navigator` feature for it.

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

Define your property like this:

```typescript
@bindable({ set: /* ? */, mode: BindingMode.toView }) public navigator: boolean = false;
```

For `set` part, we need functionality to check the input. If the value is one of the following, we want to return `true`, otherwise, we return the `false` value.

* `''`: No input for a standalone `navigator` property.
* `true`: When the `navigator` property set to `true`.
* `"true"`: When the `navigator` property set to `"true"`.

So our function will be like this

```typescript
export function truthyDetector(value: unknown) {
    return value === '' || value === true || value === "true";
}
```

Now, we should set `truthyDetector` function as follows:

```typescript
@bindable({ set: truthyDetector, mode: BindingMode.toView }) public navigator: boolean = false;
```

Although, there is another way to write the functionality too:

```typescript
@bindable({ set: v => v === '' || v === true || v === "true", mode: BindingMode.toView }) public navigator: boolean = false;
```

You can simply use any of the above four methods to enable/disable your feature. As you can see, `set` can be used to transform the values being bound into your bindable property and offer more predictable results when dealing with primitives like booleans and numbers.

## Bindable & getter/setter

By default, you'll find yourself work with binable and field most of the time, like the examples given above. But there' cases where
it makes sense to have bindable as a getter, or a pair of getter/setter to do more logic when get/set.

For example, a component card nav that allow parent component to query its active status.
With bindable on field, it would be written like this:

```ts
@customElement({ name: 'card-nav', template })
export class CardNav implements ICustomElementViewModel {
  @bindable routes: RouteLink[] = [];

  @bindable({ mode: BindingMode.fromView }) active?: string;

  bound() {
    this.setActive();
  }

  setActive() {
    this.active = this.routes.find((y) => y.isActive)?.path;
  }

  handleClick(route: RouteLink) {
    this.routes.forEach((x) => (x.isActive = x === route));
    this.setActive();
  }
}
```
Note that because `active` value needs to computed from other variables, we have to "actively" call `setActive`. It's not a big deal, but sometimes not desirable.

For cases like this, we can turn `active` into a getter, and decorate it with bindable, like the following:
```ts
@customElement({ name: 'card-nav', template })
export class CardNav implements ICustomElementViewModel {
  @bindable routes: RouteLink[] = [];

  @bindable({ mode: BindingMode.fromView }) get active() {
    return this.routes.find((y) => y.isActive)?.path;
  }

  handleClick(route: RouteLink) {
    this.routes.forEach((x) => (x.isActive = x === route));
  }
}
```
Simpler, since the value of `active` is computed, and observed based on the properties/values accessed inside the getter.

## Bindable coercion

The bindable setter section shows how to adapt the value is bound to a `@bindable` property. One common usage of the setter is to coerce the values that are bound from the view. Consider the following example.

{% tabs %}
{% tab title="my-el.ts" %}
```typescript
@customElement({ name:'my-el', template: 'not important' })
export class MyEl {
  @bindable public num: number;
}
```
{% endtab %}

{% tab title="my-app.ts" %}
```typescript
@customElement({ name:'my-app', template: '<my-el num="42"></my-el>' })
export class MyApp { }
```
{% endtab %}
{% endtabs %}

Without any setter for the `@bindable` num we will end up with the string `'42'` as the value for `num` in `MyEl`. You can write a setter to coerce the value. However, it is a bit annoying to write setters for every `@bindable`.&#x20;

### Automatic type coercion

To address this issue, Aurelia 2 supports type coercion. To maintain backward compatibility, automatic type coercion is disabled by default and must be enabled explicitly.

```typescript
new Aurelia()
    .register(
      StandardConfiguration
        .customize((config) => {
          config.coercingOptions.enableCoercion = true;
          // config.coercingOptions.coerceNullish = true;
        }),
      ...
    );
```

There are two relevant configuration options.

#### enableCoercion

The default value is `false`; that is Aurelia 2 does not coerce the types of the `@bindable` by default. It can be set to `true` to enable the automatic type-coercion.

#### coerceNullish

The default value is `false`; that is Aurelia2 does not coerce the `null` and `undefined` values. It can be set to `true` to coerce the `null` and `undefined` values as well. This property can be thought of as the global counterpart of the `nullable` property in the bindable definition (see [Coercing nullable values](bindable-properties.md#coercing-nullable-values) section).

Additionally, depending on whether you are using TypeScript or JavaScript for your app, there can be several ways to use automatic type coercion.

### Specify `type` in `@bindable`

You need to specify the explicit `type` in the `@bindable` definition.

```javascript
@customElement({ name:'my-el', template: 'not important' })
export class MyEl {
  @bindable({ type: Number }) num : number;
}
```

<!-- For TypeScript development, this gets easier when the `emitDecoratorMetadata` configuration property in `tsconfig.json` is set to `true`. When this property is set, and the `@bindable` properties are annotated with types, there is no need to do anything else; Aurelia 2 will do the rest. -->

{% hint style="info" %}
The rest of the document is based on TypeScript examples. However, we trust that you can transfer that knowledge to your JavaScript codebase if necessary.
{% endhint %}

## Coercing primitive types

Currently, coercing four primitive types are supported out of the box. These are `number`, `string`, `boolean`, and `bigint`. The coercion functions for these types are respectively `Number(value)`, `String(value)`, `Boolean(value)`, and `BigInt(value)`.

{% hint style="warning" %}
Be mindful when dealing with `bigint` as the `BigInt(value)` will throw if the `value` cannot be converted to bigint; for example `null`, `undefined`, or non-numeric string literal.
{% endhint %}

## Coercing to instances of classes

It is also possible to coerce values into instances of classes. There are two ways how that can be done.

### Using a static `coerce` method

You can define a static method named `coerce` in the class used as a `@bindable` type. This method will be called by Aurelia2 automatically to coerce the bound value.

This is shown in the following example with the `Person` class.

{% tabs %}
{% tab title="person.ts" %}
```typescript
export class Person {
  public constructor(
    public readonly name: string,
    public readonly age: number,
  ) { }
  public static coerce(value: unknown): Person {
    if (value instanceof Person) return value;
    if (typeof value === 'string') {
      try {
        const json = JSON.parse(value) as Person;
        return new this(json.name, json.age);
      } catch {
        return new this(value, null!);
      }
    }
    if (typeof value === 'number') {
      return new this(null!, value);
    }
    if (typeof value === 'object' && value != null) {
      return new this((value as any).name, (value as any).age);
    }
    return new this(null!, null!);
  }
}
```
{% endtab %}

{% tab title="my-el.ts" %}
```typescript
import { Person } from './person.ts';
@customElement({ name:'my-el', template: 'not important' })
export class MyEl {
  @bindable public person: Person;
}
```
{% endtab %}

{% tab title="my-app.html" %}
```typescript
@customElement({ name:'my-app', template: '<my-el person="john"></my-el>' })
export class MyApp { }
```
{% endtab %}
{% endtabs %}

According to the `Person#coercer` implementation, for the example above `MyEl#person` will be assigned an instance of `Person` that is equivalent to `new Person('john', null)`.

### Using the `@coercer` decorator

Aurelia2 also offers a `@coercer` decorator to declare a static method in the class as the coercer. The previous example can be rewritten as follows using the `@coercer` decorator.

{% tabs %}
{% tab title="person.ts" %}
```typescript
import { coercer } from '@aurelia/runtime-html';

export class Person {
  public constructor(
    public readonly name: string,
    public readonly age: number,
  ) { }

  @coercer
  public static createFrom(value: unknown): Person {
    if (value instanceof Person) return value;
    if (typeof value === 'string') {
      try {
        const json = JSON.parse(value) as Person;
        return new this(json.name, json.age);
      } catch {
        return new this(value, null!);
      }
    }
    if (typeof value === 'number') {
      return new this(null!, value);
    }
    if (typeof value === 'object' && value != null) {
      return new this((value as any).name, (value as any).age);
    }
    return new this(null!, null!);
  }
}
```
{% endtab %}

{% tab title="my-el.ts" %}
```typescript
import { Person } from './person.ts';

@customElement({ name:'my-el', template: 'not important' })
export class MyEl {
  @bindable public person: Person;
}
```
{% endtab %}

{% tab title="my-app.html" %}
```typescript
@customElement({ name:'my-app', template: '<my-el person="john"></my-el>' })
export class MyApp { }
```
{% endtab %}
{% endtabs %}

With the `@coercer` decorator, you are free to name the static method as you like.

## Coercing nullable values

To maintain backward compatibility, Aurelia2 does not attempt to coerce `null` and `undefined` values. We believe that this default choice should avoid unnecessary surprises and code breaks when migrating to newer versions of Aurelia.

However, you can explicitly mark a `@bindable` to be not nullable.

```typescript
@customElement({ name:'my-el', template: 'not important' })
export class MyEl {
  @bindable({ nullable: false }) public num: number;
}
```

When `nullable` is set to `false`, Aurelia2 will try to coerce the `null` and `undefined` values.

## `set` and auto-coercion

It is important to note that an explicit `set` (see [bindable setter](bindable-properties.md#bindable-setter)) function is always prioritized over the `type`. In fact, the auto-coercion is the fallback for the `set` function. Hence whenever `set` is defined, the auto-coercion becomes non-operational.

**However, this gives you an opportunity to:**

* Override any of the default primitive type coercing behavior, or
* Disable coercion selectively for a few selective `@bindable` by using a `noop` function for `set`.

{% hint style="info" %}
Aurelia2 already exposes a `noop` function saving your effort to write such boring functions.
{% endhint %}

## Union types

When using TypeScript, usages of union types are not rare. However, using union types for `@bindable` will deactivate the auto-coercion.

```typescript
@customElement({ name:'my-el', template: 'not important' })
export class MyEl {
  @bindable public num: number | string;
}
```

For the example above, the type metadata supplied by TypeScript will be `Object` disabling the auto-coercion.

To coerce union types, you can explicitly specify a `type`.

```typescript
@customElement({ name:'my-el', template: 'not important' })
export class MyEl {
  @bindable({type: String}) public num: number | string;
}
```

However, using a setter would be more straightforward to this end.

```typescript
@customElement({ name:'my-el', template: 'not important' })
export class MyEl {
  @bindable({set(v: unknown) {... return coercedV;}}) public num: number | string;
}
```

{% hint style="info" %}
Even though using a `noop` function for `set` function is a straightforward choice, `Object` can also be used for `type` in the bindable definition to disable the auto-coercion for selective `@bindable`s (that is when the automatic type-coercion is enabled).
{% endhint %}

## Bindables spreading

Spreading syntaxes are supported for simpler binding of multiple bindable properties.

Given the following component:
```typescript
export class NameTag {
  @bindable first
  @bindable last
}
```
with template:

```html
<b>${fist.toUpperCase()}</b> ${last}
```
and its usage template:

```html
<name-tag ...$bindables="{ first: 'John', last: 'Doe' }"></name-tag>
```

The rendered html will be:
```html
<b>JOHN</b> Doe
```

Here we are using `...$bindables` to express that we want to bind all properties in the object `{ first: 'John', last: 'Doe' }` to bindable properties on `<name-tag>` component.
The `...$bindables="..."` syntax will only connect properties that are matching with bindable properties on `<name-tag>`, so even if an object with hundreds of properties are given to a `...$bindables` binding, it will still resulted in 2 bindings for `first` and `last`.

`...$bindables` also work with any expression, rather than literal object, per the following examples:

```html
<name-tag $bindables.spread="customer1">
<name-tag $bindables.spread="customer.details">
<name-tag $bindables.spread="customer[this_that]">
<name-tag $bindables="customer1 | mapDetails">
<name-tag $bindables="customer.details | simplify">
<name-tag $bindables="customer[this_that] | addDetails">
```

### Shorthand syntax

Sometimes when the expression of the spread binding is simple, we can simplify the binding even further. Default templating syntax of Aurelia supports a shorter version of the above examples:

```html
<name-tag ...customer1>
<name-tag ...customer.details>
<name-tag ...customer[this_that]>

or if you need space in the expression:
<name-tag ...$bindables="customer1 | mapDetails">
<name-tag ...$bindables="customer.details | simplify">
<name-tag ...$bindables="customer[this_that] | addDetails">
```

{% hint style="warning" %}
- Remember that HTML is case insensitive, so `...firstName` actually will be seen as `...firstname`, for example
- Bindables properties will be tried to matched as is, which means a `firstName` bindable property will match an object `firstName` property, but not `first-name`
- If the expression contains space, it will result into multiple attributes and thus won't work as intended with spread syntax `...`.
For example `...a + b` will be actually turned into 3 attributes: `...a`, `+` and `b`
{% endhint %}

### Binding orders

The order of the bindings created will be the same with the order declared in the template. For example, for the `NameTag` component above, if we have a usage

```html
<name-tag id="1" first="John" ...$bindables="{ first: 'Jane' }">
<name-tag id="2" ...$bindables="{ first: 'Jane' }" first="John">
```
Then the value of the `first` property in `NameTag` with `id=1` will be `Jane`, and the value of `first` property in `NameTag` with `id=2` will be `John`.

{% hint style="warning" %}
- An exception of this order is when bindables spreading is used together with [`...$attrs`](#attributes-transferring), `...$attrs` will always result in bindings after `...$bindables`/`$bindables.spread`/`...expression`.
{% endhint %}

### Observation behavior

Bindings will be created based on the keys available in the object evaluated from the `expression` of a spread binding. The following example illustrate the behavior:

For the `NameTag` component above:
```html
<let item.bind="{ first: 'John' }">
<name-tag ...item></name-tag>
<button click.trigger="item.last = 'Doe'">Change last name</button>
```

The rendered HTML of `<name-tag>` will be
```html
<b>JOHN</b>
```

When clicking on the button with text `Change last name`, the rendered html of `<name-tag>` won't be changed,
as the original object given to `<name-tag>` doesn't contain `last`, hence it wasn't observed, which ignore our new value set from the button click.
If it's desirable to reset the observation, give a new object to the spread binding, like the following example:

```html
<let item.bind="{ first: 'John' }">
<name-tag ...item></name-tag>
<button click.trigger="item = { first: item.name, last: 'Doe' }">Change last name</button>
```

{% hint style="success" %}
- With the above behavior of non-eager binding, applications can have the opportunity to leave some bindable properties untouched,
while with the opposite behavior of always observing all properties on the given object based on the number of bindable properties,
missing value (`null`/`undefined`) will start flowing in in an unwanted way.
{% endhint %}

There are some other behaviors of the spread binding that are worth noting:

- All bindings created with `$bindables.spread` or `...` syntax will have binding mode equivalent to `to-view`, binding behavior cannot alter this.
Though other binding behavior like `throttle`/`debounce` can still work.
- If the same object is returned from evaluating the expression, the spread binding won't try to rebind its inner bindings. This means mutating and then reassigning won't result in new binding, instead, give the spread binding a new object.

## Attributes Transferring

Attribute transferring is a way to relay the binding(s) on a custom element to its child element(s).

As an application grows, the components inside it also grow. Something that starts simple, like the following component

```typescript
export class FormInput {
  @bindable label
  @bindable value
}
```

with the template

```html
<label>${label}
  <input value.bind="value">
</label>
```

can quickly grow out of hand with a number of needs for configuration: aria, type, min, max, pattern, tooltip, validation etc...

After a while, the `FormInput` component above will become more and more like a relayer to transfer the bindings from outside, to the elements inside it. This often results in an increase in the number of `@bindable`. While this is fine, you end up with components that have a lot of boilerplate.

```typescript
export class FormInput {
  @bindable label
  @bindable value
  @bindable type
  @bindable tooltip
  @bindable arias
  @bindable etc
}
```

And the usage of our component would look like this:

```html
<form-input
  label.bind="label"
  value.bind="message"
  tooltip.bind="Did you know Aurelia syntax comes from an idea of an Angular community member? We greatly appreciate Angular and its community for this."
  validation.bind="...">
```

to be repeated like this inside:

```html
<label>${label}
  <input value.bind tooltip.bind validation.bind min.bind max.bind>
</label>
```

To juggle all the relevant pieces for such a task isn't difficult, but somewhat tedious. With attribute transferring, which is roughly close to object spreading in JavaScript, the above template should be as simple as:

```html
<label>${label}
  <input ...$attrs>
</label>
```

, which reads like this: for some bindings on `<form-input>`, change the targets of those bindings to the `<input>` element inside it.

### Usage

To transfer attributes & bindings from a custom element, there are two steps:

* Set `capture` to `true` on a custom element via `@customElement` decorator:

```typescript
@customElement({
  ...,
  capture: true
})
```

Or use the `capture` decorator from `aurelia` package if you don't want to declare the `customElement` decorator and have to specify your name and template values.

```typescript
import { capture } from 'aurelia';

@capture
export class MyCustomElement {
  ...
}

// either form is valid
@capture()
export class MyCustomElement {
  ...
}
```

As the name suggests, this is to signal the template compiler that all the bindings & attributes, with some exceptions, should be captured for future usage.

#### Spread the captured attributes onto an element

Using the ellipsis syntax which you might be accustomed to from Javascript, we can spread our attributes onto an element proceeding the magic variable `$attrs`

```html
<input ...$attrs>
```

#### Spread attributes and overriding specific ones

In case you want to spread all attributes while explicitly overriding individual ones, make sure these come after the spread operator.

```html
<input value.bind="..." ...$attrs> spread wins
<input ...$attrs value.bind="..."> explicit wins
```

{% hint style="warning" %}
It's recommended that this feature should not be overused in multi-level capturing & transferring. This is often known as prop-drilling in React and could have a bad effect on the overall & long-term maintainability of an application. It's probably healthy to limit the max level of transferring to 2.
{% endhint %}

### Usage with conventions

Aurelia conventions enable the setting of `capture` metadata from the template via `<capture>` tag, like the following example:

```html
<capture>

<input ...$attrs>
```

### Attribute filtering

Sometimes it is desirable to capture only certain attributes on a custom element. Aurelia supports this via 2nd form of the custom element `capture` value: a function that takes 1 parameter, which is the attribute name, and returns a boolean to indicate whether it should be captured.

```typescript
@customElement({
  capture: attr => attr !== 'class'
})
```

### How it works

#### What attributes are captured

Everything except the template controller and custom element bindables are captured.

{% code title="form-input.ts" %}
```typescript
export class FormInput {
  @bindable label
}
```
{% endcode %}

A usage example is as follows:

{% code title="my-app.html" %}
```html
<form-input
  if.bind="needsComment"
  label.bind="label"
  value.bind="extraComment"
  class="form-control"
  style="background: var(--theme-purple)"
  tooltip="Hello, ${tooltip}">
```
{% endcode %}

**What is captured:**

* `value.bind="extraComment"`
* `class="form-control"`
* `style="background: var(--theme-purple)"`
* `tooltip="Hello, ${tooltip}"`

**What is not captured:**

* `if.bind="needsComment"` (`if` is a template controller)
* `label.bind="label"` (`label` is a bindable property)

#### How will attributes be applied in ...$attrs

Attributes that are spread onto an element will be compiled as if it was declared on that element.

This means `.bind` command will work as expected when it's transferred from some element onto some element that uses `.two-way` for `.bind`.

It also means that spreading onto a custom element will also work: if a captured attribute targets a bindable property of the applied custom element. An example:

```html
app.html
<input-field value.bind="message">

input-field.html
<my-input ...$attrs>
```

if `value` is a bindable property of `my-input`, the end result will be a binding that connects the `message` property of the corresponding `app.html` view model with `<my-input>` view model `value` property. The binding mode is also preserved like normal attributes.
