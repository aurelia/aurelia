# Templating - Local Template

Like local functions, templates can also be defined locally. Let us consider the following example.

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

The example defines a template inside the `my-app.html` markup that can be used as a custom element. The name of the custom element, so defined, comes from the value of the `as-custom-element` attribute used on the template. In this case, it is named as `person-info`. A custom element defined that way cannot be used outside the template that defines it; in this case the `person-info` is therefore unavailable outside `my-app`. Thus, the name 'local template'.

Local templates can also optionally specify bindable properties using the `<bindable>` tag as shown above. Apart from `property`, other allowed attributes that can be used in this tag are `attribute`, and `mode`. In that respect, the following two declarations are synonymous.

```markup
<bindable property="foo" mode="twoWay" attribute="fiz-baz"></bindable>
```

```typescript
@bindable({mode: BindingMode.twoWay, attribute: 'fiz-baz'}) foo;
```

Although it might be quite clear, it is worth reiterating that the value of the `bindable` `attribute` should not be camelCased or PascalCased.

## Why

In essence, the local templates are similar to HTML-Only custom elements, with the difference that the local templates cannot be reused outside the defining custom element. Sometimes we need to reuse a template multiple times in a single custom element. To create a separate custom element for that is bit of an overkill. Also given the fact that the custom element is only used in one single custom element, it might be optimized for that, and not meant to be reused outside this context. The local templates are meant to promote that, whereas having a separate custom element makes it open for reuse in another context. In short, it aims to reduce boilerplate code, and promotes highly cohesive, better encapsulated custom elements.

This means that the following is a perfectly valid example. Note that the local templates with same name \(`foo-bar`\) are _defined_ in different custom elements.

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

## Features and pitfalls

* Local templates are hoisted. That is following example will work.

```markup
<foo-bar foo.bind="'John'"></foo-bar>

<template as-custom-element="foo-bar">
  <bindable property="foo"></bindable>
  <div> ${foo} </div>
</template>
```

* It is theoretically possible to go to an infinite level of nesting. That is the following example will work. However, whether such composition is helpful or not, depends on the use-case. Although it might provide a stronger cohesion, as the level of nesting grows, it can be difficult to work with. It is up to you decide a reasonable tradeoff while using local templates. In this respect, a good thumb rule is to keep the local function analogy in mind.

  ```markup
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

* A custom element cannot contain only local templates. The following examples will cause a \(jit\) compilation error.

{% tabs %}
{% tab title="invalid-example2.html" %}
```markup
<!--Having such custom element does not help much either.-->
<template as-custom-element="foo-bar">Does this work?</template>
<template as-custom-element="fiz-baz">Of course not!</template>
```
{% endtab %}
{% endtabs %}

* A local template always needs to be defined directly under the root element. The following example will cause a \(jit\) compilation error.

{% tabs %}
{% tab title="invalid-example1.html" %}
```markup
<div>
  <template as-custom-element="foo-bar">This does not work.</template>
</div>
```
{% endtab %}
{% endtabs %}

* This one is obvious; the local templates need to have a name. The following example will cause a \(jit\) compilation error.

```markup
<template as-custom-element="">foo-bar</template>
<div></div>
```

* The names of the local templates need to be unique \(in defining custom element\). The following example will cause a \(jit\) compilation error.

```markup
<template as-custom-element="foo-bar">foo-bar1</template>
<template as-custom-element="foo-bar">foo-bar2</template>
<div></div>
```

* The `<bindable>` tags needs to be under the local template root. The following example will cause a \(jit\) compilation error.

```markup
<template as-custom-element="foo-bar">
  <div>
    <bindable property="prop"></bindable>
  </div>
</template>
<div></div>
```

* The `property` attribute in `<bindable>` tags is mandatory. The following example will cause a \(jit\) compilation error.

```markup
<template as-custom-element="foo-bar">
  <bindable attribute="prop"></bindable>
</template>
<div></div>
```

