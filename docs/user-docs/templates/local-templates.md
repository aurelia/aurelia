---
description: >-
  Local templates allow you to remove boilerplate in your Aurelia applications,
  by creating local templates specific to the templated view you are working
  within and are not reusable.
---

# Local templates (inline templates)

## Introduction

In many instances, when working with templated views in Aurelia, you will be approaching development from a reusability mindset. However, sometimes, you need a template for one specific application part. You could create a component for this, but it might be overkill. This is where local templates can be useful.

{% tabs %}
{% tab title="my-app.html" %}
```html
<template as-custom-element="person-info">
  <bindable name="person"></bindable>
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

The example defines a template inside the `my-app.html` markup that can be used as a custom element. The name of the custom element, so defined, comes from the value of the `as-custom-element` attribute used on the template.&#x20;

In this case, it is named as `person-info`. A custom element defined that way cannot be used outside the template that defines it; in this case, the `person-info` is, therefore, unavailable outside `my-app`. Thus, the name 'local template'.

Local templates can also optionally specify bindable properties using the `<bindable>` tag as shown above. Apart from `property`, other allowed attributes that can be used in this tag are `attribute`, and `mode`. In that respect, the following two declarations are synonymous.

```html
<bindable name="foo" mode="twoWay" attribute="fiz-baz"></bindable>
```

```typescript
@bindable({mode: BindingMode.twoWay, attribute: 'fiz-baz'}) foo;
```

Although it might be quite clear, it is worth reiterating that the value of the `bindable` `attribute` should not be camelCased or PascalCased.

### Why use local templates

In essence, the local templates are similar to HTML-Only custom elements, with the difference that the local templates cannot be reused outside the defining custom element. Sometimes we need to reuse a template multiple times in a single custom element.&#x20;

Creating a separate custom element for that is a bit overkill. Also, given that the custom element is only used in one single custom element, it might be optimized for that and not meant to be reused outside this context. The local templates are meant to promote that, whereas having a separate custom element makes it open for reuse in another context.&#x20;

In short, it aims to reduce boilerplate code and promotes highly cohesive, better-encapsulated custom elements.

This means that the following is a perfectly valid example. Note that the local templates with the same name (`foo-bar`) are _defined_ in different custom elements.

{% tabs %}
{% tab title="level-one.html" %}
```html
<template as-custom-element="foo-bar">
  <bindable name='prop'></bindable>

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
```html
<template as-custom-element="foo-bar">
  <bindable name='prop'></bindable>
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
```html
<level-two prop="foo2"></level-two>
<level-one prop="foo1"></level-one>
```
{% endtab %}
{% endtabs %}

## Features and pitfalls

Like anything, there is always an upside and downside: local templates are no different. While they can be a powerful addition to your Aurelia applications, you need to be aware of the caveats when using them, as you may encounter them.

### Local templates are hoisted.

```html
<foo-bar foo.bind="'John'"></foo-bar>

<template as-custom-element="foo-bar">
  <bindable name="foo"></bindable>
  <div> ${foo} </div>
</template>
```

It is theoretically possible to go to an infinite level of nesting. That is, the following example will work. However, whether such composition is helpful depends on the use case.

Although it might provide a stronger cohesion, as the level of nesting grows, it might not be easy to work with. It is up to you to decide on a reasonable tradeoff while using local templates.&#x20;

In this respect, a good thumb rule is to keep the local function analogy in mind.

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

### Custom elements cannot contain only local templates

The following examples will cause a (jit) compilation error.

{% tabs %}
{% tab title="invalid-example2.html" %}
```html
<!--Having such custom element does not help much either.-->
<template as-custom-element="foo-bar">Does this work?</template>
<template as-custom-element="fiz-baz">Of course not!</template>
```
{% endtab %}
{% endtabs %}

### A local template always needs to be defined directly under the root element

The following example will cause a (jit) compilation error.

{% tabs %}
{% tab title="invalid-example1.html" %}
```html
<div>
  <template as-custom-element="foo-bar">This does not work.</template>
</div>
```
{% endtab %}
{% endtabs %}

### Local templates need to have a name

The following example will cause a (jit) compilation error.

```html
<template as-custom-element="">foo-bar</template>
<div></div>
```

### Local template names need to be unique

The following example will cause a (jit) compilation error.

```html
<template as-custom-element="foo-bar">foo-bar1</template>
<template as-custom-element="foo-bar">foo-bar2</template>
<div></div>
```

### Bindable tags need to be under the local template root

The following example will cause a (jit) compilation error.

```html
<template as-custom-element="foo-bar">
  <div>
    <bindable name="prop"></bindable>
  </div>
</template>
<div></div>
```

### The property attribute on bindable tags is mandatory

The following example will cause a (jit) compilation error.

```html
<template as-custom-element="foo-bar">
  <bindable attribute="prop"></bindable>
</template>
<div></div>
```
