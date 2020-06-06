# Components Revisited

## Shadow DOM and Slots

// TODO

## HTML-Only Components

In some instances, a component does not need a view-model, just the HTML aspect. Perhaps you have a component that renders a profile photo or displays a stylized heading, both of which only require basic bindable values.

The convention for HTML-only components is the filename becomes the tag name, and when you are referencing them throughout your application, you must also add the `.html` file extension.

### Without Bindable Properties

Here is a basic example that will render a heading one element with a value of `This is a HTML-only component`.

```HTML
<h1>This is a HTML-only component</h1>
```

Saving this as `my-element.html` will result in a component that will be referenced using its tag `<my-element></my-element>`. To import the component in your application, use the `<import>` element.

```HTML
<import from="./my-element.html"></import>

<my-element></my-element>
```

### With Bindable Properties

In many instances, you'll want a custom element which supports one or more bindable properties. These properties allow you to pass in data to the component itself. Taking the above example, let's allow the text to be changed and we will save it as `heading-one.html` instead.

```HTML
<bindable name="text"></bindable>
<h1>${text}</h1>
```

To use our newly created `heading-one` component, import it and use it like this:

```HTML
<import from="./heading-one.html"></import>

<heading-one text="This is my heading..."></heading-one>
```

You can even specify the binding mode for your bindables. This will make our bindable property `two-way` so it updates in both directions.

```HTML
<bindable name="text" mode="two-way"></bindable>
<h1>${text}</h1>
```

## Local templates

Like local functions, templates can also be defined locally.
Let us consider the following example.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<template as-custom-element="person-info">
  <bindable property="person"></bindable>
  <div>
    <label>Name:</label>
    <span>${person.name}</span>
  </div>
  <div>
    <label>Address:</label>
    <span>${person.address}</span>
  </div>
</template>

<h2>Sleuths</h2>
<person-info repeat.for="sleuth of sleuths" person.bind="sleuth"></person-info>

<h2>Nemeses</h2>
<person-info repeat.for="nemesis of nemeses" person.bind="nemesis"></person-info>
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
export class App {
  public readonly sleuths: Person[] = [
    new Person('Byomkesh Bakshi', '66, Harrison Road'),
    new Person('Sherlock Holmes', '221b Baker Street')
  ];
  public readonly nemeses: Person[] = [
    new Person('Anukul Guha', 'unknown'),
    new Person('James Moriarty', 'unknown')
  ];
}

class Person {
  public constructor(
    public name: string,
    public address: string,
  ) { }
}
```
{% endtab %}
{% endtabs %}

The example defines a template inside the `my-app.html` markup that can be used as a custom element.
The name of the custom element, so defined, comes from the value of the `as-custom-element` attribute used on the template.
In this case, it is named as `person-info`.
A custom element defined that way cannot be used outside the template that defines it; in this case the `person-info` is therefore unavailable outside `my-app`.
Thus, the name 'local template'.

Local templates can also optionally specify bindable properties using the `<bindable>` tag as shown above.
Apart from `property`, other allowed attributes that can be used in this tag are `attribute`, and `mode`.
In that respect, the following two declarations are synonymous.

```html
<bindable property="foo" mode="twoWay" attribute="fiz-baz"></bindable>
```

```typescript
@bindable({mode: BindingMode.twoWay, attribute: 'fiz-baz'}) foo;
```

Although it might be quite clear, it is worth reiterating that the value of the `bindable` `attribute` should not be camelCased or PascalCased.

### Why

In essence, the local templates are similar to HTML-Only custom elements, with the difference that the local templates cannot be reused outside the defining custom element.
Sometimes we need to reuse a template multiple times in a single custom element.
To create a separate custom element for that is bit of an overkill.
Also given the fact that the custom element is only used in one single custom element, it might be optimized for that, and not meant to be reused outside this context.
The local templates are meant to promote that, whereas having a separate custom element makes it open for reuse in another context.
In short, it aims to reduce the boilerplate code, and promotes highly cohesive, better encapsulated custom elements.

This means that the following is a perfectly valid example. Note the local templates with same name are *defined* in different custom elements.

{% tabs %}
{% tab title="level-one.html" %}
```markup
<template as-custom-element="foo-bar">
  <bindable property='prop'></bindable>

  Level One ${prop}
</template>
<foo-bar prop.bind="prop"></foo-bar>
```
{% endtab %}
{% tab title="level-one.ts" %}
```typescript
class LevelOne {
  @bindable public prop: string;
}
```
{% endtab %}
{% tab title="level-two.html" %}
```markup
<template as-custom-element="foo-bar">
  <bindable property='prop'></bindable>
  Level Two ${prop}
  <level-one prop="fiz baz"></level-one>
</template>
<foo-bar prop.bind="prop"></foo-bar>
<level-one prop.bind="prop"></level-one>
```
{% endtab %}
{% tab title="level-two.ts" %}
```typescript
class LevelTwo {
  @bindable public prop: string;
}
```
{% endtab %}
{% tab title="my-app.html" %}
```markup
<level-two prop="foo2"></level-two>
<level-one prop="foo1"></level-one>
```
{% endtab %}
{% endtabs %}

### Features and pitfalls

* Local templates are hoisted. That is following example will work.

{% endtab %}
{% tab title="my-app.html" %}
```markup
<foo-bar foo.bind="'John'"></foo-bar>

<template as-custom-element="foo-bar">
  <bindable property="foo"></bindable>
  <div> ${foo} </div>
</template>
```
{% endtab %}
{% endtabs %}

* It is theoretically possible to go to infinite level of nesting. That is the following example will work. However, whether such composition is helpful or not, depends on the use-case. Although it might provides a stronger cohesion, as the level of nesting grows, it might be difficult to work with. It is up to you decide a reasonable tradeoff while using local templates. In this respect, a good thumb rule is to keep the local function analogy in mind.
```html
<template as-custom-element="el-one">
  <template as-custom-element="one-two">
    1
  </template>
  2
  <one-two></one-two>
</template>
<template as-custom-element="el-two">
  <template as-custom-element="two-two">
    3
  </template>
  4
  <two-two></two-two>
</template>
<el-two></el-two>
<el-one></el-one>
```

* A custom element cannot contain only local templates. The following examples will cause (jit) compilation error.


{% tabs %}
{% tab title="invalid-example1.html" %}
```markup
<!--This is equivalent to say that the custom element in itself is a local template!-->
<!--That does not make much sense.-->
<template as-custom-element="foo-bar">This does not work.</template>
```
{% endtab %}
{% tab title="invalid-example2.html" %}
```markup
<!--Having such custom element does not help much either.-->
<template as-custom-element="foo-bar">Does this work?</template>
<template as-custom-element="fiz-baz">Of course not!</template>
```
{% endtab %}
{% endtabs %}

* A local template always needs to be defined directly under the root element. The following example will cause (jit) compilation error.

{% tabs %}
{% tab title="invalid-example1.html" %}
```markup
<div>
  <template as-custom-element="foo-bar">This does not work.</template>
</div>
```
{% endtab %}
{% endtabs %}

* This one is obvious; the local templates need to have a name. The following example will cause (jit) compilation error.

{% endtab %}
{% tab title="my-app.html" %}
```markup
<template as-custom-element="">foo-bar</template>
<div></div>
```
{% endtab %}
{% endtabs %}

* The names of the local templates need to be unique (in the defining custom element). The following example will cause (jit) compilation error.

{% endtab %}
{% tab title="my-app.html" %}
```markup
<template as-custom-element="foo-bar">foo-bar1</template>
<template as-custom-element="foo-bar">foo-bar2</template>
<div></div>
```
{% endtab %}
{% endtabs %}

* The `<bindable>` tags needs to be under the local template root. The following example will cause (jit) compilation error.

{% endtab %}
{% tab title="my-app.html" %}
```markup
<template as-custom-element="foo-bar">
  <div>
    <bindable property="prop"></bindable>
  </div>
</template>
<div></div>
```
{% endtab %}
{% endtabs %}

* The `property` attribute in `<bindable>` tags is mandatory. The following example will cause (jit) compilation error.

{% endtab %}
{% tab title="my-app.html" %}
```markup
<template as-custom-element="foo-bar">
  <bindable attribute="prop"></bindable>
</template>
<div></div>
```
{% endtab %}
{% endtabs %}

## Odds and Ends

Aurelia's component system is rich with features, designed to enable you to tackle any scenario that your app demands.

### Bindable Options

// TODO

### Containerless Components

// TODO

### The `@children` Decorator

// TODO

### The `as-element` Attribute

In some cases, especially when creating table rows out of Aurelia custom elements, you may need to have a custom element masquerade as a standard HTML element. For example, if you're trying to fill table rows with data, you may need your custom element to appear as a `<tr>` row or `<td>` cell. This is where the `as-element` attribute comes in handy.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./hello-row.html">

<table>
  <tr as-element="hello-row">
</table>
```
{% endtab %}

{% tab title="hello-row.html" %}
```markup
<td>Hello</td>
<td>World</td>
```
{% endtab %}
{% endtabs %}

The `as-element` attribute tells Aurelia that we want the content of the table row to be exactly what our `hello-row` template wraps. The way different browsers render tables means this may be necessary sometimes.

