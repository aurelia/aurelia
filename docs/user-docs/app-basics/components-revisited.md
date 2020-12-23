# Components Revisited

## Shadow DOM and Slots

// TODO

## au-slot

Aurelia provides another way of content projection with `au-slot`.
This is similar to the native `slot` in terms of content projection, however, it does not use shadow DOM.
`au-slot` is useful where you want externally defined styles to penetrate the component boundary, to facilitate easy styling of components.
If you are creating your own set of custom elements that are solely used in your application, then you might want to avoid the native slots in the custom elements as it might be difficult to style those elements from your application.
However, if you still want to have slot-like behavior, then you can use `au-slot`, as that makes the styling those custom elements/components easier.
Instead of using shadow DOM, the resulting view is composed purely by Aurelia compilation pipeline.
There are other aspects of `au-slot` as well which will be explored in this section with examples.

{% hint style="info" %}
- An obvious question might be "Why not simply 'turn off' shadow DOM, and use the `slot` itself"? We feel that goes to the opposite direction of Aurelia's promise of keeping things as close to native behavior as possible. Moreover, using a different name like `au-slot` makes it clear that the native slot is not used in this case, however still bringing slotting behavior to use.
- If you have used the `replaceable` and `replace part` before or with Aurelia1, it is replaced with `au-slot`.
- The following examples use [local templates](#getting-started/components/local-templates) for succinctness only; the examples should also work for full-fledged custom elements.
{% endhint %}

### Basic templating usage

Like `slot`, a "projection target"/"slot" can be defined using a `<au-slot>` element, and a projection to that slot can be provided using a `[au-slot]` attribute.
Consider the following example.

{% code title="my-app.html" %}
```markup
<!-- A custom element with <au-slot> -->
<template as-custom-element="my-element">
  static content
  <au-slot>fallback content for default slot.</au-slot>
  <au-slot name="s1">fallback content for s1 slot.</au-slot>
</template>

<!-- Usage without projection -->
<my-element></my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    static content
    fallback content for default slot.
    fallback content for s1 slot.
  </my-element>
-->

<!-- Usage with projection -->
<my-element>
  <div au-slot>d</div>        <!-- using `au-slot="default"` explicitly also works. -->
  <div au-slot="s1">p1</div>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    static content
    <div>d</div>
    <div>p1</div>
  </my-element>
-->

<my-element>
  <template au-slot="s1">p1</template>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    static content
    fallback content for default slot.
    p1
  </my-element>
-->
```
{% endcode %}

In the example above, the `my-element` custom element defines two slots: one default, and one named.
The slots can optionally have fallback content; i.e. when no projection is provided for the slot, the fallback content will be displayed.
Projecting to a slot is therefore also optional.
However, when a projection is provided for a slot, that overrides the fallback content of that slot.

An important point to note here is that using the `[au-slot]` attribute to provide projection is mandatory (a workaround can be made for the default `au-slot` using 'processContent' hook; refer the [documentation](#the-processContent-hook) for an example transformation function.).
Projection without `[au-slot]` attribute is not supported and may result in unexpected behavior.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <au-slot name="s1">s1fb</au-slot>
  <au-slot>dfb</au-slot>
</template>

<!-- Is not projected to any slot. -->
<my-element><div>projection</div></my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <div>projection</div>
    s1fb
    dfb
  </my-element>
-->
```
{% endcode %}

Another important point to note is that the usage of `[au-slot]` attribute is supported only on the direct children elements of a custom element.
This means that the following examples do not work.

{% code title="my-app.html" %}
```markup
<!-- Do NOT work. -->

<div au-slot></div>

<template><div au-slot></div></template>

<my-element>
  <div>
    <div au-slot></div>
  </div>
<my-element>
```
{% endcode %}


### Binding scope

It is also possible to use data-binding, interpolation etc. while projecting.
While doing so, the scope accessing rule can be described by the following thumb rule:

1. When projection is provided, the scope of the custom element, providing the projection is used.
2. When projection is not provided, the scope of the inner custom element is used.
3. The outer custom element can still access the inner scope using the `$host` keyword while projecting.

These rules are explained with the following examples.

**Example: Projection uses the outer scope by default**

Let's consider the following example with interpolation.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<my-element>
  <div au-slot="s1">${message}</div>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <div>outer</div>
  </my-element>
-->
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  public readonly message: string = 'outer';
}
```
{% endtab %}
{% tab title="my-element.html" %}
```markup
<au-slot name="s1">${message}</au-slot>
```
{% endtab %}
{% tab title="my-element.ts" %}
```typescript
export class MyElement {
  public readonly message: string = 'inner';
}
```
{% endtab %}
{% endtabs %}

Although the `my-element` has a `message` property, but as `my-app` projects to `s1` slot, scope of `my-app` is used to evaluate the interpolation expression.
Similar behavior can also be observed when binding properties of custom elements, as shown in the following example.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<my-element>
  <foo-bar au-slot="s1" foo.bind="message"></foo-bar>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <foo-bar>outer</foo-bar>
  </my-element>
-->
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  public readonly message: string = 'outer';
}
```
{% endtab %}
{% tab title="my-element.html" %}
```markup
<au-slot name="s1">${message}</au-slot>
```
{% endtab %}
{% tab title="my-element.ts" %}
```typescript
export class MyElement {
  public readonly message: string = 'inner';
}
```
{% endtab %}
{% tab title="foo-bar.html" %}
```markup
${foo}
```
{% endtab %}
{% tab title="foo-bar.ts" %}
```typescript
export class FooBar {
  @bindable public foo: string;
}
```
{% endtab %}
{% endtabs %}

**Example: Fallback uses the inner scope by default**

Let's consider the following example with interpolation.
This is the same example as before, but this time without projection.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<my-element></my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    inner
  </my-element>
-->
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  public readonly message: string = 'outer';
}
```
{% endtab %}
{% tab title="my-element.html" %}
```markup
<au-slot name="s1">${message}</au-slot>
```
{% endtab %}
{% tab title="my-element.ts" %}
```typescript
export class MyElement {
  public readonly message: string = 'inner';
}
```
{% endtab %}
{% endtabs %}

Note that in the absence of projection, the fallback content uses the scope of `my-element`.
For completeness the following example shows that it also holds while binding values to the `@bindable`s in custom elements.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<my-element></my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <foo-bar>inner</foo-bar>
  </my-element>
-->
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  public readonly message: string = 'outer';
}
```
{% endtab %}
{% tab title="my-element.html" %}
```markup
<au-slot name="s1">
  <foo-bar foo.bind="message"></foo-bar>
</au-slot>
```
{% endtab %}
{% tab title="my-element.ts" %}
```typescript
export class MyElement {
  public readonly message: string = 'inner';
}
```
{% endtab %}
{% tab title="foo-bar.html" %}
```markup
${foo}
```
{% endtab %}
{% tab title="foo-bar.ts" %}
```typescript
export class FooBar {
  @bindable public foo: string;
}
```
{% endtab %}
{% endtabs %}

**Example: Access the inner scope with `$host`**

The outer custom element can access the inner custom element's scope using the `$host` keyword, as shown in the following example.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<my-element>
  <div au-slot="s1">${$host.message}</div>
  <div au-slot="s2">${message}</div>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <div>inner</div>
    <div>outer</div>
  </my-element>
-->
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  public readonly message: string = 'outer';
}
```
{% endtab %}
{% tab title="my-element.html" %}
```markup
<au-slot name="s1"></au-slot>
<au-slot name="s2"></au-slot>
```
{% endtab %}
{% tab title="my-element.ts" %}
```typescript
export class MyElement {
  public readonly message: string = 'inner';
}
```
{% endtab %}
{% endtabs %}

Note that using the `$host.message` expression, `MyApp` can access the `MyElement#message`.
The following example demonstrate the same behavior for binding values to custom elements.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<my-element>
  <foo-bar au-slot="s1" foo.bind="$host.message"></foo-bar>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <foo-bar>inner</foo-bar>
  </my-element>
-->
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  public readonly message: string = 'outer';
}
```
{% endtab %}
{% tab title="my-element.html" %}
```markup
<au-slot name="s1"></au-slot>
```
{% endtab %}
{% tab title="my-element.ts" %}
```typescript
export class MyElement {
  public readonly message: string = 'inner';
}
```
{% endtab %}
{% tab title="foo-bar.html" %}
```markup
${foo}
```
{% endtab %}
{% tab title="foo-bar.ts" %}
```typescript
export class FooBar {
  @bindable public foo: string;
}
```
{% endtab %}
{% endtabs %}

Let's consider another example of `$host` which highlights the necessity of it.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <bindable property="people"></bindable>
  <au-slot name="grid">
    <au-slot name="header">
      <h4>First Name</h4>
      <h4>Last Name</h4>
    </au-slot>
    <template repeat.for="person of people">
      <au-slot name="content">
        <div>${person.firstName}</div>
        <div>${person.lastName}</div>
      </au-slot>
    </template>
  </au-slot>
</template>

<my-element people.bind="people">
  <template au-slot="header">
    <h4>Meta</h4>
    <h4>Surname</h4>
    <h4>Given name</h4>
  </template>
  <template au-slot="content">
    <div>${$host.$index}-${$host.$even}-${$host.$odd}</div>
    <div>${$host.person.lastName}</div>
    <div>${$host.person.firstName}</div>
  </template>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <h4>Meta</h4>           <h4>Surname</h4>      <h4>Given name</h4>

    <div>0-true-false</div> <div>Doe</div>        <div>John</div>
    <div>1-false-true</div> <div>Mustermann</div> <div>Max</div>
  </my-element>
-->
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  public readonly people: Person[] = [
    new Person('John', 'Doe'),
    new Person('Max', 'Mustermann'),
  ];
}

class Person {
  public constructor(
    public firstName: string,
    public lastName: string,
  ) { }
}
```
{% endtab %}
{% endtabs %}

In the example above, we replace the 'content' template of the grid, defined in `my-element`, from `my-app`.
While doing so, we can grab the scope of the repeater and use the properties made available by the binding context, and use those in the projection template.
Note that `$host` let us access even the contextual properties like `$index`, `$even`, or `$odd`.
Without the `$host` it might have been difficult to provide a template for the repeater from outside.

{% hint style="info" %}
The last example is also interesting from another aspect.
It shows that while working with a grid, many parts of the grid can be replaced with projection.
This includes, the header of the grid (`au-slot="header"`), the template column of the grid (`au-slot="content"`), or even the whole grid itself (`au-slot="grid"`).
{% endhint %}

{% hint style="warning" %}
The `$host` keyword can only be used in context of projection.
Using it in any other context is not supported, and will throw error with high probability.
{% endhint %}

### Multiple projections for single slot

It is possible to provide multiple projections to single slot.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <au-slot name="s1">s1</au-slot>
  <au-slot name="s2">s2</au-slot>
</template>

<my-element>
  <div au-slot="s2">p20</div>
  <div au-slot="s1">p11</div>
  <div au-slot="s2">p21</div>
  <div au-slot="s1">p12</div>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <div>p11</div>
    <div>p12</div>

    <div>p20</div>
    <div>p21</div>
  </my-element>
-->
```
{% endcode %}

This is useful for many cases.
One evident example would a 'tabs' custom element.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-tabs">
  <au-slot name="header"></au-slot>
  <au-slot name="content"></au-slot>
</template>

<my-tabs>
  <h3 au-slot="header">Tab1</h3>
  <div au-slot="content">Tab1 content</div>

  <h3 au-slot="header">Tab2</h3>
  <div au-slot="content">Tab2 content</div>

  <!--...-->
</my-tabs>
```
{% endcode %}

This helps keeping things closer that belong together.
For example, keeping the tab-header and tab-content next to each other, provides better readability and understanding of the code to the developer.
On other hand, it still places the projected contents at the right slot.

### Duplicate slots

Having more than one `<au-slot>` with same name is also supported.
This lets us projecting same content to multiple slots declaratively, as can be seen from the following example.

{% code title="my-app.html" %}
```markup
<template as-custom-element="person-card">
  <let details-shown.bind="false"></let>
  <au-slot name="name"></au-slot>
  <button click.delegate="detailsShown=!detailsShown">Toggle details</button>
  <div if.bind="detailsShown">
    <au-slot name="name"></au-slot>
    <au-slot name="role"></au-slot>
    <au-slot name="details"></au-slot>
  </div>
</template>

<person-card>
  <span au-slot="name"> John Doe </span>
  <span au-slot="role"> Role1 </span>
  <span au-slot="details"> Lorem ipsum </span>
</person-card>
```
{% endcode %}

Note that projection for the name is provided once, but it gets duplicated in 2 slots.
You can also see this example in action [here](https://stackblitz.com/edit/au-slot-duplicate-slots?file=my-app.html).

### Template controller integration and dynamic content

Template controllers like `if/else`, `switch`, and `repeat.for` be used in combination of `au-slot` element to dynamically generate content.

{% hint style="warning" %}
One limitation at this point is that template controllers cannot be used directly with `[au-slot]` attribute.
However, it can be easily circumvented by wrapping the template controller with the element with `[au-slot]` attribute.
{% endhint %}

**Examples using `if`/`else`**

Following is a basic example of `if`/`else`, combined with `au-slot`.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <bindable property="showS1"></bindable>
  <au-slot name="s1" if.bind="showS1"></au-slot>
  <au-slot name="s2" else></au-slot>
</template>

<my-element show-s1.bind="true">
  <div au-slot="s2">p2</div>
  <div au-slot="s1">p1</div>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <div>p1</div>
  </my-element>
-->

<my-element show-s1.bind="false">
  <div au-slot="s2">p2</div>
  <div au-slot="s1">p1</div>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <div>p2</div>
  </my-element>
-->
```
{% endcode %}

Another interesting use-case is to use the same slot name, but conditionally render different elements.
This is shown below.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <bindable property="asList"></bindable>
  <ul if.bind="asList">
    <au-slot></au-slot>
  </ul>
  <div else>
    <au-slot></au-slot>
  </div>
</template>

<my-element as-list.bind="true">
  <template au-slot>
    <li>1</li>
    <li>2</li>
  </template>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <ul>
      <li>1</li>
      <li>2</li>
    </ul>
  </my-element>
-->

<my-element as-list.bind="false">
  <template au-slot>
    <span>1</span>
    <span>2</span>
  </template>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <div>
      <span>1</span>
      <span>2</span>
    </div>
  </my-element>
-->
```
{% endcode %}

Although the previous examples work, but the following attempt to use `if`/`else` with `[au-slot]` throws error.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <au-slot name="s1"></au-slot>
</template>

<!-- Does NOT work. -->
<my-element>
  <div au-slot="s1" if.bind="condition">p1</div>
</my-element>
```
{% endcode %}

However the content can still be projected dynamically from client by wrapping the `if.bind` as follows.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <au-slot name="s1"></au-slot>
</template>

<my-element>
  <div au-slot="s1">
    <template if.bind="true"> p1 </template>
  </div>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <div> p1 </div>
  </my-element>
-->
```
{% endcode %}

This wrapping of template controller by the element with the `[au-slot]` holds for other template controllers as well.

**Example using `switch`**

Providing dynamic projections using `switch` is also supported.

{% code title="my-app.html" %}
```markup
<template as-custom-element="foo-bar">
  <au-slot name="s1"></au-slot>
</template>

<let status='received'></let>
<foo-bar>
  <template au-slot="s1">
    <template switch.bind="status">
      <span case="received">Order received.</span>
      <span case="dispatched">On the way.</span>
      <span case="processing">Processing your order.</span>
      <span case="delivered">Delivered.</span>
    </template>
  </template>
</foo-bar>
<!-- Rendered (simplified): -->
<!--
  <foo-bar>
    <span>Order received.</span>
  </foo-bar>
-->
```
{% endcode %}

**Examples using `repeat.for`**

A simple example of using the repeater with `au-slot` is shown below.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <au-slot repeat.for="i of 5">\${i}</au-slot>
</template>

<my-element>
  <template au-slot>${$host.i*2}</template>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    02468
  </my-element>
-->
```
{% endcode %}

It is also possible to project to a nested slot, used inside a `repeat.for`.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <template repeat.for="i of 5">
    <au-slot name="s1">\${i}<au-slot name="s2">\${i+2}</au-slot></au-slot>
    <au-slot name="s1">\${i+3}<au-slot name="s2">\${i+4}</au-slot></au-slot>
  </template>
</template>

<my-element>
  <template au-slot="s2">${$host.i*2}</template>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    00
    30
    12
    42
    24
    54
    36
    66
    48
    78
  </my-element>
-->
```
{% endcode %}

Another interesting example of `repeat.for` is already shown in the [Binding scope](#binding-scope) section in context of `$host` keyword that you must check, if you haven't already.

**Examples using `with`**

The `with` template controller can also be used naturally with `au-slot`.
A basic example is shown below.

{% code title="my-app.html" %}
```markup
<template as-custom-element="my-element">
  <bindable property="people"></bindable>
  <au-slot with.bind="{item: people[0]}">
    ${item.firstName}
  </au-slot>
</template>

<let people.bind="[{firstName: 'John', lastName: 'Doe'}, {firstName: 'Max', lastName: 'Mustermann'}]"><let>
<my-element people.bind="people">
  <div au-slot>${$host.item.lastName}</div>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
   <div>Doe</div>
  </my-element>
-->
```
{% endcode %}

### Miscellaneous examples

The next example shows that projections are supported to different custom elements, defining slots.

{% tabs %}
{% tab title="person.ts" %}
```typescript
class Person {
  public constructor(
    public firstName: string,
    public lastName: string,
    public pets: string[],
  ) { }
}
```
{% endtab %}
{% tab title="collection-viewer.html" %}
```markup
<au-slot name="collection">
  <div repeat.for="item of collection">${item}</div>
</au-slot>
```
{% endtab %}
{% tab title="collection-viewer.ts" %}
```typescript
class CollectionViewer {
  @bindable public collection: string[];
}
```
{% endtab %}
{% tab title="my-element.html" %}
```markup
<au-slot name="grid">
  <au-slot name="header">
    <h4>First Name</h4>
    <h4>Last Name</h4>
    <h4>Pets</h4>
  </au-slot>
  <template repeat.for="person of people">
    <au-slot name="content">
      <div>${person.firstName}</div>
      <div>${person.lastName}</div>
      <collection-viewer collection.bind="person.pets"></collection-viewer>
    </au-slot>
  </template>
</au-slot>
```
{% endtab %}
{% tab title="my-element.ts" %}
```typescript
class MyElement {
  @bindable public people: Person[];
}
```
{% endtab %}
{% tab title="my-app.html" %}
```markup
<my-element people.bind="people">
  <template au-slot="content">
    <div>${$host.person.firstName}</div>
    <div>${$host.person.lastName}</div>
    <collection-viewer collection.bind="$host.person.pets">
      <ul au-slot="collection">
        <li repeat.for="item of $host.collection">${item}</li>
      </ul>
    </collection-viewer>
  </template>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    <h4>First Name</h4> <h4>Last Name</h4>    <h4>Pets</h4>

    <div>John</div>     <div>Doe</div>        <collection-viewer>
                                                <ul>
                                                  <li>Browny</li>
                                                  <li>Smokey</li>
                                                </ul>
                                              </collection-viewer>
    <div>Max</div>      <div>Mustermann</div> <collection-viewer>
                                                <ul>
                                                  <li>Sea biscuit</li>
                                                  <li>Swift Thunder</li>
                                                </ul>
                                              </collection-viewer>
  </my-element>
-->
```
{% endtab %}
{% tab title="my-app.ts" %}
```typescript
class MyApp {
  public readonly people: Person[] = [
    new Person('John', 'Doe', ['Browny', 'Smokey']),
    new Person('Max', 'Mustermann', ['Sea biscuit', 'Swift Thunder']),
  ];
}
```
{% endtab %}
{% endtabs %}

An important point to note in the above example is that the `$host.collection` while projecting to `<collection-viewer>`, lets us access the scope of that custom element which is a different scope than the one used in the expression `$host.person.pets`.

Projections are supported to different nested custom elements with same slot name.

{% tabs %}
{% tab title="my-element1.html" %}
```markup
<au-slot name="s1"></au-slot>
```
{% endtab %}
{% tab title="my-element1.ts" %}
```typescript
class MyElement1 { }
```
{% endtab %}
{% tab title="my-element2.html" %}
```markup
<au-slot name="s1"></au-slot>
```
{% endtab %}
{% tab title="my-element2.ts" %}
```typescript
class MyElement2 { }
```
{% endtab %}
{% tab title="my-app.html" %}
```markup
<my-element1>
  <template au-slot="s1">
    p1
    <my-element2>
      <template au-slot="s1">
        p2
      </template>
    </my-element2>
  </template>
</my-element1>
<!-- Rendered (simplified): -->
<!--
  <my-element1>
    p1
    <my-element2>
      p2
    </my-element2>
  </my-element1>
-->
```
{% endtab %}
{% endtabs %}

You can 'chain' projections, as explained in the following example.

{% tabs %}
{% tab title="lvl-zero.html" %}
```markup
<au-slot name="s0"></au-slot>
```
{% endtab %}
{% tab title="lvl-one.html" %}
```markup
<lvl-zero>
  <template au-slot="s0">
    <au-slot name="s1"></au-slot>
  </template>
</lvl-zero>
```
{% endtab %}
{% tab title="my-app.html" %}
```markup
<lvl-one>
  <div au-slot="s1">p</div>
</lvl-one>
<!-- Rendered (simplified): -->
<!--
  <lvl-one>
    <lvl-zero>
      <div>p</div>
    </lvl-zero>
  </lvl-one>
-->
```
{% endtab %}
{% endtabs %}

Following are some invalid examples that are not supported, and may result in unexpected result.

```html
<!-- Example#1: projection attempt to non-existing slot is no-op. -->
<template as-custom-element="my-element">
  <au-slot name="s1">s1fb</au-slot>
</template>

<my-element>
  <template au-slot="s2"> p1 </template>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    s1fb
  </my-element>
-->


<!-- Example#2: projection attempt with au-slot element instead of the attribute causes mis-projection. -->
<template as-custom-element="my-element">
  <au-slot>dfb</au-slot>
  <au-slot name="s1">s1fb</au-slot>
</template>

<my-element>
  <au-slot name="s1"> mis-projected </au-slot>
  <au-slot name="foo"> bar </au-slot>
</my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element>
    mis-projected
    bar
    dfb
    s1fb
  </my-element>
-->


<!-- Example#3: au-slot>*[au-slot] is no-op. -->
<template as-custom-element="my-element">
  <au-slot name="s1">
    <div au-slot="s1">no-op</div>
  </au-slot>
</template>

<my-element></my-element>
<!-- Rendered (simplified): -->
<!--
  <my-element></my-element>
-->
```

## HTML-Only Components

In some instances, a component does not need a view-model, just the HTML aspect. Perhaps you have a component that renders a profile photo or displays a stylized heading, both of which only require basic bindable values.

The convention for HTML-only components is the filename becomes the tag name, and when you are referencing them throughout your application, you must also add the `.html` file extension.

### Without Bindable Properties

Here is a basic example that will render a heading one element with a value of `This is a HTML-only component`.

```markup
<h1>This is a HTML-only component</h1>
```

Saving this as `my-element.html` will result in a component that will be referenced using its tag `<my-element></my-element>`. To import the component in your application, use the `<import>` element.

```markup
<import from="./my-element.html"></import>

<my-element></my-element>
```

### With Bindable Properties

In many instances, you'll want a custom element which supports one or more bindable properties. These properties allow you to pass in data to the component itself. Taking the above example, let's allow the text to be changed and we will save it as `heading-one.html` instead.

```markup
<bindable name="text"></bindable>
<h1>${text}</h1>
```

To use our newly created `heading-one` component, import it and use it like this:

```markup
<import from="./heading-one.html"></import>

<heading-one text="This is my heading..."></heading-one>
```

You can even specify the binding mode for your bindables. This will make our bindable property `two-way` so it updates in both directions.

```markup
<bindable name="text" mode="two-way"></bindable>
<h1>${text}</h1>
```

## Odds and Ends

Aurelia's component system is rich with features, designed to enable you to tackle any scenario that your app demands.

### Bindable Options

// TODO

### Containerless Components

// TODO

### The `@children` Decorator

// TODO

### The 'processContent' hook

There are scenarios where we would like to transform the template provided by the usage-side.
The 'processContent' hook lets us define a pre-compilation hook to make that transformation.

The signature of the hook function is as follows.

```typescript
// pseudo-code; `typeof TCustomElement` doesn't work in Generics form.
<TCustomElement>(this: typeof TCustomElement, node: INode, platform: IPlatform) => boolean | void;
```

There are two important things to note here.

First is the `node` argument.
It is the DOM tree on the usage-side for the custom element.
For example, if there is a custom element named `my-element`, on which a 'processContent' hook is defined, and it is used somewhere as shown in the following markup, then when the hook is invoked, the `node` argument will provide the DOM tree that represents the following markup.

```markup
<my-element>
 <foo></foo>
 <bar></bar>
</my-element>
```
Then inside the hook this DOM tree can be transformed/mutated into a different DOM tree.
The mutation can be addition/removal of attributes or element nodes.

Second is the return type `boolean | void`.
Returning from this function is optional.
Only an explicit `false` return value results in skipping the compilation (and thereby enhancing) of the child nodes in the DOM tree.
The implication of skipping the compilation of the child nodes is that Aurelia will not touch those DOM fragments and will be kept as it is.
In other words, if the mutated node contains custom elements, custom attributes, or template controllers, those will not be hydrated.

The `platform` argument is just the helper to have platform-agnostic operations as it abstracts the platform.
Lastly the `this` argument signifies that the hook function always gets bound to the custom element class function for which the hook is defined.

The most straight forward way to define the hook is to use the `processContent` property while defining the custom-element.

```typescript
import { customElement, INode, IPlatform } from '@aurelia/runtime-html';

// Use a standalone function...
function processContent(node: INode, platform: IPlatform) { }
@customElement({ name: 'my-element', processContent })
export class MyElement { }

// ... or use a static method.
@customElement({ name: 'my-element', processContent: MyElement.processContent })
export class MyElement {
  static processContent(node: INode, platform: IPlatform) { }
}
```

Apart from this, there is also the `@processContent` decorator which can used class-level or method-level.

```typescript
import { customElement, INode, IPlatform, processContent } from '@aurelia/runtime-html';

// Reference a static method
@processContent(MyElement.processContent)
export class MyElement {
  static processContent(node: INode, platform: IPlatform) { }
}

// ...or a standalone method
function processContent(this: typeof MyElement, node: INode, platform: IPlatform) { }
@processContent(processContent)
export class MyElement {
}

// ...or the method-level decorator
export class MyElement {
  @processContent()
  static processContent(node: INode, platform: IPlatform) { }
}
```

That's the API.
Now let us say consider an example.
Let us say that we want to create a custom elements that behaves as a tabs control.
That is this custom element shows different sets of information grouped under a set of headers, and when the header is clicked the associated content is shown.
To this end, we can conceptualize the markup for this custom element as follows.

```markup
<!--tabs.html-->
<div class="header">
  <au-slot name="header"></au-slot>
</div>
<div class="content">
  <au-slot name="content"></au-slot>
</div>
```

The markup has 2 slots for the header and content projection.
While using the `tabs` custom element we want to have the following markup.

{% hint style="info" %}
If you are unfamiliar with the `au-slot` then visit the [documentation](#au-slot).
'processContent' can be very potent with `au-slot`.
{% endhint %}

```markup
<!--app.html-->
<tabs>
  <tab header="Tab one">
    <span>content for first tab.</span>
  </tab>
  <tab header="Tab two">
    <span>content for second tab.</span>
  </tab>
  <tab header="Tab three">
    <span>content for third tab.</span>
  </tab>
</tabs>
```

Now note that there is no custom element named `tab`.
The idea is to keep the usage-markup as much dev-friendly as possible, so that it is easy to maintain, and the semantics are quite clear.
Also it is easy to refactor as now we know which parts belong together.
To support this usage-syntax we will use the 'processContent' hook to rearrange the DOM tree, so that the nodes are correctly projected at the end.
A prototype implementation is shown below.

```typescript
// tabs.ts
import { INode, IPlatform, processContent } from '@aurelia/runtime-html';

@processContent(Tabs.processTabs)
class Tabs {

  public static processTabs(node: INode, p: IPlatform): boolean {
    const el = node as Element;

    // At first we prepare two templates that will provide the projections to the `header` and `content` slot respectively.
    const headerTemplate = p.document.createElement('template');
    headerTemplate.setAttribute('au-slot', 'header');
    const contentTemplate = p.document.createElement('template');
    contentTemplate.setAttribute('au-slot', 'content');

    // Query the `<tab>` elements present in the `node`.
    const tabs = toArray(el.querySelectorAll('tab'));
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];

      // Add header.
      const header = p.document.createElement('button');
      // Add a class binding to mark the active tab.
      header.setAttribute('class.bind', `activeTabId=='${i}'?'active':''`);
      // Add a click delegate to activate a tab.
      header.setAttribute('click.delegate', `showTab('${i}')`);
      header.appendChild(p.document.createTextNode(tab.getAttribute('header')));
      headerTemplate.content.appendChild(header);

      // Add content.
      const content = p.document.createElement('div');
      // Show the content if the tab is activated.
      content.setAttribute('if.bind', `activeTabId=='${i}'`);
      content.append(...toArray(tab.childNodes));
      contentTemplate.content.appendChild(content);

      el.removeChild(tab);
    }
    // Set the first tab as the initial active tab.
    el.setAttribute('active-tab-id', '0');

    el.append(headerTemplate, contentTemplate);
  }

  @bindable public activeTabId: string;
  public showTab(tabId: string) {
    this.activeTabId = tabId;
  }
}
```

<!-- TODO add a live example later after a new dev version is released post merge of #1068. -->

**Example transformation function for default `[au-slot]`**

If you have used [`au-slot`](#au-slot), you might have noticed that in order to provide a projection the usage of `[au-slot]` attribute is mandatory, even if the projections are targeted to the default `au-slot`.
With the help of the 'processContent' hook we can workaround this minor inconvenience.
The following is a sample transformation function that loops over the direct children under `node` and demotes the nodes without any `[au-slot]` attribute to a synthetic `template[au-slot]` node.

```typescript
processContent(node: INode, p: IPlatform) {
  const projection = p.document.createElement('template');
  projection.setAttribute('au-slot', '');
  const content = projection.content;
  for (const child of toArray(node.childNodes)) {
    if (!(child as Element).hasAttribute('au-slot')) {
      content.append(child);
    }
  }
  if (content.childElementCount > 0) {
    node.appendChild(projection);
  }
}
```

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

