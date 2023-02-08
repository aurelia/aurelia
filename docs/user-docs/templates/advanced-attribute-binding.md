# Advanced Attribute Binding

## How it works

Aurelia, by default, will automatically bind properties to attributes using the native binding syntax. This is accomplished by using a mapping function that converts an aurelia property into a native html attribute. See the [attribute mapper](https://github.com/aurelia/aurelia/blob/0efe8f914f4f6b426ac6115cb40e290fb8d164db/packages/runtime-html/src/attribute-mapper.ts#L24-L50) for an example of how this is done.

Attributes are turned into camel-case equivalent properties by default if there's no mapping specified, so for example, `some-fake-attribute.bind="prop"` will set `someFakeAttribute` on the element properties to the value of `prop`.

In some cases though, not all properties will be mapped automatically to attributes. In these cases, you have several options. 

### Attribute tag

One method is to replace `.bind` with `.attr`. This will ensure that the property is correctly mapped to the attribute. 

```html
<input pattern.attr="patternProp">
```

### Attribute binding behavior

Another option is to apply the attribute [binding behavior](./binding-behaviors.md) (`.attr). This also gives you the ability to specify binding type. 

```html
<input pattern.bind="patternProp & attr">
```

### Extend the attribute mapper

**TODO**: This section is in progress