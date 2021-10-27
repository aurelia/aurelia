# Coercing bindable values

You have seen in the [bindable setter](bindable-setter.md) section how to adapt the value that is being bound to a `@bindable` property.
One of frequent usage of the setter is to coerce the values that are bound from the view.

Consider the following example.

{% tabs %}
{% tab title="my-el.ts" %}
```typescript
@customElement({ name:'my-el', template: 'not-important' })
export class MyEl {
  @bindable public num: number;
}
```
{% endtab %}
{% tab title="my-app.html" %}
```typescript
@customElement({ name:'my-app', template: '<my-el num="42"></my-el>' })
export class MyApp { }
```
{% endtab %}
{% endtabs %}

Without any setter for the `@bindable` num we might end up the string `'42'` as the value for `num` in `MyEl`.
You can write a setter to coerce the value.

However, it is bit annoying to write a setter for every `@bindable`s.
To address this issue Aurelia2 supports type coercion out of the box.
Which means that thanks to the type-coercion you might never end up with values of unexpected types for the `@bindable`s.

## How to leverage the type-coercion?

### For TypeScript development

For TypeScript development this gets easier when the `emitDecoratorMetadata` configuration property in `tsconfig.json` is set to `true`.
When this property is set and the `@bindable` properties are annotated with types, there is no need to do anything else; Aurelia2 will do the rest.

If for some reason you cannot do that then refer the next section.

### For JavaScript development

For JavaScript development you need to explicitly specify the `type` in the `@bindable` definition.

```javascript
@customElement({ name:'my-el', template: 'not-important' })
export class MyEl {
  @bindable({ type: Number }) num;
}
```

{% hint style="info" %}
The rest of the document is based on TypeScript examples. However, we trust that you can transfer that knowledge to your JavaScript codebase if need be.
{% endhint %}

## Coercing primitive types

Currently coercion for four primitive types are supported out-of-the-box.
These are `number`, `string`, `boolean`, and `bignit`.
The coercion functions for these type are respectively `Number(value)`, `String(value)`, `Boolean(value)`, and `BigInt(value)`.

{% hint style="warning" %}
Be mindful when dealing with `bigint` as the `BigInt(value)` will throw if the `value` cannot be converted to bigint; for example `null`, `undefined` or non-numeric string literal etc.
{% endhint %}

## Coercing to instances of classes

It is also possible to coerce values to instances of classes.
There are two ways how that can be done.

### Using a static `coercer` method

You can define a static method named `coercer` in the class that is used as a `@bindable` type.
This method will be called by Aurelia2 automatically in order to coerce the bound value.

This is shown in the following example with the `Person` class.

{% tabs %}
{% tab title="person.ts" %}
```typescript
export class Person {
  public constructor(
    public readonly name: string,
    public readonly age: number,
  ) { }
  public static coercer(value: unknown): Person {
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
@customElement({ name:'my-el', template: 'not-important' })
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

According to `Person#coercer` implementation, for the example above `MyEl#person` will be assigned an instance of `Person` that is equivalent to `new Person('john', null)`.

### Using the `@coercer` decorator

Aurelia2 also offers a `@coercer` decorator to declare a static method in the class as the coercer.
With that the previous example can be re-written as follows.

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

@customElement({ name:'my-el', template: 'not-important' })
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

With `@coercer` decorator you are free to name the static method as you like.

## Coercing nullable values

To maintain the compatibility, Aurelia2 does not attempt to coerce `null` and `undefined` values.
We believe that this default choice should avoid unnecessary surprises and code-breaks when migrating to new version of Aurelia.

However, you can explicitly mark a `@bindable` to be not nullable.

```typescript
@customElement({ name:'my-el', template: 'not-important' })
export class MyEl {
  @bindable({ nullable: false }) public num: number;
}
```

When this `nullable` is explicitly set to `false`, Aurelia2 will try to coerce the `null` and `undefined` values.

<!-- TODO: globally enable or disable type coercion -->
<!-- TODO: globally enable or disable nullable coercion -->


<!-- TODO: ## Pitfalls

- Setter preceds type
- union type
 -->
