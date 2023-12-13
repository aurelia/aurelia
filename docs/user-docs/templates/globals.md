# Globals variables in templates

In Aurelia 2, templates are designed to limit direct access to global variables like `window` or `document` for security reasons. However, there are scenarios where access to certain global variables is necessary. Aurelia allows access to a predefined list of global variables commonly used in development.

To reduce boilerplate, Aurelia allows template expression to access a fixed list of global variables that are usually needed. Those globals are as follows:

```
Infinity
NaN
isFinite
isNaN
parseFloat
parseInt
decodeURI
decodeURIComponent
encodeURI
encodeURIComponent
Array
BigInt
Boolean
Date
Map
Number
Object
RegExp
Set
String
JSON
Math
Intl
```

## Global Examples

Here are some examples of using globals inside of Aurelia templates. The usage is the same as it is inside of Javascript, except in your Aurelia templates.

### Working with JSON

Manipulate JSON data directly in your templates.

```html
<template>
  <pre>${JSON.stringify(user, null, 2)}</pre>
</template>
```

### Mathematical Operations

Perform calculations using the Math object.

```html
<template>
  <p>The square root of 16 is ${Math.sqrt(16)}</p>
</template>
```

### Conditional Rendering with `isNaN`

Display content conditionally based on numeric checks.

```html
<template>
  <p if.bind="isNaN(value)">Not a number</p>
</template>
```

### Regular Expressions with `RegExp`

Use the `RegExp` constructor to create dynamic regular expressions for data validation or manipulation.

```html
<template>
  <input value.bind="email" type="email" placeholder="Enter email">
  <p if.bind="new RegExp('^\\S+@\\S+\\.\\S+$').test(email)">Valid Email Address</p>
</template>
```

### Dynamic Object Property Access with `Object`

Access properties dynamically on an object using the `Object` constructor.

```html
<template>
  <p>Property Value: ${Object.getOwnPropertyDescriptor(user, selectedProperty)?.value}</p>
</template>
```

### Set Operations with `Set`

Demonstrate set operations like union, intersection, or difference.

```HTML
<template>
  <p>Unique Numbers: ${[...new Set(numbersArray)]}</p>
</template>
```

### Encoding and Decoding URLs with `encodeURI` and `decodeURI`

Manipulate URL strings by encoding or decoding them.

```html
<template>
  <a href.bind="encodeURI(externalLink)">Visit External Site</a>
  <p>Original URL: ${decodeURI(externalLink)}</p>
</template>
```

### Number Formatting with `Intl.NumberFormat`

Format numbers using Intl.NumberFormat for localization.

```html
<template>
  <p>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)}</p>
</template>
```

### Complex Array Manipulations with `Array`

Demonstrate complex array manipulations, such as chaining methods.

```html
<template>
  <p>Processed Data: ${Array.from(dataSet).filter(x => x.isActive).map(x => x.value).join(', ')}</p>
</template>
```

## Best Practices and Considerations

- **Use Sparingly:** Rely on global variables only when necessary. Prefer component properties and methods for data and logic.
- **Security:** Be cautious of the data processed using global functions to prevent XSS attacks and other vulnerabilities.
- **Performance:** Frequent use of complex operations like JSON.stringify in templates can impact performance. Consider handling such operations in the component class.
- **Reactivity:** Remember that changes to global variables are not reactive. If you need reactivity, use component properties or state management solutions.
