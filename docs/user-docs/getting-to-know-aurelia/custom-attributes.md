---
description: Using built-in custom attributes and building your own.
---

# Custom attributes

A custom attribute allows you to create special properties you can use to enhance and decorate existing HTML elements and components. Natively attributes exist in the form of things such as `disabled` on form inputs or aria text labels. Where custom attributes can be especially useful is wrapping existing HTML plugins that generate their own markup.

## Creating custom attributes

On a simplistic level, custom attributes resemble that of components quite a lot. They can have bindable properties and they use classes for their definitions. A basic custom attribute looks something like this:

```typescript
import { customAttribute } from 'aurelia';

@customAttribute('custom-property')
export class MyCustomProperty {
}
```

If you were to replace `customAttribute` with the `customElement` decorator, it would be a component. You can see on a core level, custom attributes are just a more primitive form of component.

Let's create a custom attribute that adds a red background and height to any dom element it is used on:

```typescript
  import { customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('red-square') 
  export class RedSquareCustomAttribute {
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = '100px';
        this.element.style.backgroundColor = 'red';
    }
  }
```

Now, let's use our custom attribute:

```html
<import from="./red-square"></import>

<div red-square></div>
```

We import our custom attribute so DI knows about it and then we use it on an empty DIV. We'll have a red background element with a height of one hundred pixels.

### Explicit custom attributes

The `customAttribute` decorator allows you to explicitly create custom attributes, including the name. Other configuration options include the ability to create aliases.

#### Explicit attribute naming

You can explicitly name the custom attribute using the `name` configuration property.

```typescript
  import { customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute({ name: 'red-square' }) 
  export class RedSquareCustomAttribute {
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = '100px';
        this.element.style.backgroundColor = 'red';
    }
  }
```

#### Attribute aliases

The `customAttribute` allows you to also create one or more aliases that this attribute can go by.

```typescript
  import { customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute({ name: 'red-square', aliases: ['redify', 'redbox'] }) 
  export class RedSquareCustomAttribute {
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = '100px';
        this.element.style.backgroundColor = 'red';
    }
  }
```

### Single value binding

In some instances, you want a custom attribute that only has one bindable property. You don't actually need to explicitly define the bindable property to do this as Aurelia supports custom attributes with single value bindings.

```typescript
  import { customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('red-square') 
  export class RedSquareCustomAttribute {
    private value;
    
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = '100px';
        this.element.style.backgroundColor = 'red';
    }
    
    bind() {
        this.element.style.backgroundColor = this.value;
    }
  }
```

The `value` property is automatically populated if a value is supplied to a custom attribute, however requires you to explicitly define the value property as a bindable.

When the value is changed, we can access it like this:

```
  import { bindable, customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('red-square') 
  export class RedSquareCustomAttribute {
    @bindable() private value;
    
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = '100px';
        this.element.style.backgroundColor = 'red';
    }
    
    bound() {
        this.element.style.backgroundColor = this.value;
    }
    
    valueChanged(newValue: string, oldValue: string){
        this.element.style.backgroundColor = newValue;
    }
  }
```

### Accessing the element

When using the custom attribute on a dom element, there are instances where you want to be able to access the element itself. To do this, you can use the `INode` decorator and `HTMLElement` interface to inject the element and target it.

```typescript
  import { customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('red-square') 
  export class RedSquareCustomAttribute {
    constructor(@INode private element: HTMLElement){

    }
  }
```

The code above was lifted from the first example, allowing us to access the element itself on the class using `this.element` which is how we can set CSS values and perform other modifications such as the initialization of third-party plugins.

### Custom attributes with bindable properties

In many cases, you might only have a need for custom attributes without user-configurable properties. However, in some cases you want the user to be able to pass in one or more properties to change the behavior of the custom attribute (like a plugin).

Using bindable properties, you can create a configurable custom attribute. Taking our example from above, let's make the background color configurable instead of always being red. We will rename the attribute for this.

```typescript
  import { bindable, customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('color-square') 
  export class ColorSquareCustomAttribute {
    @bindable() color: string = 'red';
  
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = '100px';
        this.element.style.backgroundColor = this.color;
    }
    
    bound() {
      this.element.style.backgroundColor = this.color;
    }
  }
```

We now have the ability to provide a color on a per-use basis. Let's go one step further and allow the size to be set too.

```typescript
  import { bindable, customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('color-square') 
  export class ColorSquareCustomAttribute {
    @bindable() color: string = 'red';
    @bindable() size: string = '100px';
  
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = this.size;
        this.element.style.backgroundColor = this.color;
    }
    
    bound() {
      this.element.style.width = this.element.style.height = this.size;
      this.element.style.backgroundColor = this.color;
    }
}
```

### Responding to bindable property change events

We have code that will work on the first initialization of our custom property, but if the property is changed after render, nothing else will happen. For this, we need to use the change detection functionality to update the element when any of the bindable properties change.

```typescript
  import { bindable, customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('color-square') 
  export class ColorSquareCustomAttribute {
    @bindable() color: string = 'red';
    @bindable() size: string = '100px';
  
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = this.size;
        this.element.style.backgroundColor = this.color;
    }
    
    bound() {
      this.element.style.width = this.element.style.height = this.size;
      this.element.style.backgroundColor = this.color;
    }
    
    colorChanged(newColor, oldColor) {
      this.element.style.backgroundColor = newColor;
    }
    
    sizeChanged(newSize: string, oldSize: string) {
      this.element.style.width = this.element.style.height = newSize;
    }
}  
```

As a default convention, bindable property change callbacks will use the bindable property name followed by a suffix of `Changed` at the end. The change callback gets two parameters, the new value and the existing value.

{% hint style="info" %}
Want to learn more about bindable properties and how to configure them? Please reference the [bindable properties section](components/bindable-properties.md).
{% endhint %}

Whenever our size or color bindable properties change, our element will be updated accordingly instead of only at render.

### Options binding

Options binding provides a custom attribute with the ability to have multiple bindable properties. Each bindable property must be specified using the `bindable` decorator. The attribute view model may implement an optional `${propertyName}Changed(newValue, oldValue)` callback function for each bindable property.&#x20;

When binding to these options, separate each option with a semicolon and supply a binding command or literal value as in the example below. It is important to note that **bindable properties are converted to dash-case when used in the DOM**, while the view model property they are bound to are kept with their original casing.

```typescript
  import { bindable, customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('color-square') 
  export class ColorSquareCustomAttribute {
    @bindable() color: string = 'red';
    @bindable() size: string = '100px';
  
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = this.size;
        this.element.style.backgroundColor = this.color;
    }
    
    bound() {
      this.element.style.width = this.element.style.height = this.size;
      this.element.style.backgroundColor = this.color;
    }
    
    colorChanged(newColor, oldColor) {
      this.element.style.backgroundColor = newColor;
    }
    
    sizeChanged(newSize: string, oldSize: string) {
      this.element.style.width = this.element.style.height = newSize;
    }
}  
```

To use options binding, here is how you might configure those properties:

```html
<import from="./color-square"></import>

<div color-square="color.bind: myColor; size.bind: mySize;"></div>
```

### Specifying a primary property

When you have more than one bindable property, you might want to specify which property is the primary one (if any). If you mostly expect the user to only configure one property most of the time, you can specify it is the primary property through the bindable configuration.

```typescript
  import { bindable, customAttribute, INode } from 'aurelia-framework';
  
  @customAttribute('color-square') 
  export class ColorSquareCustomAttribute {
    @bindable( {primary: true} ) color: string = 'red';
    @bindable() size: string = '100px';
  
    constructor(@INode private element: HTMLElement){
        this.element.style.width = this.element.style.height = this.size;
        this.element.style.backgroundColor = this.color;
    }
    
    bound() {
      this.element.style.width = this.element.style.height = this.size;
      this.element.style.backgroundColor = this.color;
    }
    
    colorChanged(newColor, oldColor) {
      this.element.style.backgroundColor = newColor;
    }
    
    sizeChanged(newSize, oldSize) {
      this.element.style.width = this.element.style.height = newSize;
    }
}  
```

In the above example, we specify that color is the primary bindable property. Our code actually doesn't change at all. The way we consume the custom attribute just changes slightly.

```html
<import from="./color-square"></import>

<div color-square="blue"></div>
```

Or, you can bind in the value itself to the attribute:

```html
<import from="./color-square"></import>

<div color-square.bind="myColour"></div>
```
