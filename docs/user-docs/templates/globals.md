---
description: >-
  Learn how Aurelia 2 handles global variables in templates, the built-in list
  of accessible globals, and when to use them effectively.
---

# Global Variables in Templates

By design, Aurelia templates limit direct access to global variables like `window` or `document` for security and maintainability reasons. However, Aurelia recognizes that some JavaScript globals are frequently needed—like `Math`, `JSON`, or `Array`—and therefore provides a **predefined list** of global objects that can be safely accessed in template expressions.

---

## Why Limit Global Access?

- **Security:** Restricting direct access to browser globals reduces the risk of accidental or malicious operations on sensitive objects.
- **Maintainability:** Encourages developers to keep logic in their view models, improving code clarity.
- **Performance:** Minimizes the amount of unnecessary logic in templates, preventing overuse of global operations in tight rendering loops.

Despite these constraints, Aurelia acknowledges the utility of common global constructors and functions. Below is the canonical list accessible within Aurelia 2 templates **without** additional configuration:

- Infinity
- NaN
- isFinite
- isNaN
- parseFloat
- parseInt
- decodeURI
- decodeURIComponent
- encodeURI
- encodeURIComponent
- Array
- BigInt
- Boolean
- Date
- Map
- Number
- Object
- RegExp
- Set
- String
- JSON
- Math
- Intl

---

## Example Usages of Built-In Globals

Below are illustrative examples showing how to use these built-in globals in Aurelia templates. The syntax is identical to standard JavaScript, but you simply call them within Aurelia’s binding expressions.

### 1. Working with `JSON`

Serialize an object for debugging or quick display:

```html
<template>
  <pre>${JSON.stringify(user, null, 2)}</pre>
</template>
```

### 2. Mathematical Operations with Math

Perform simple or complex calculations:

```html
<template>
  <p>The square root of 16 is: ${Math.sqrt(16)}</p>
</template>
```

### 3. Conditional Rendering with isNaN

Use global numeric checks to conditionally display elements:

```html
<template>
  <input type="text" value.bind="value" />
  <p if.bind="isNaN(value)">This is not a valid number!</p>
</template>
```

### 4. Regular Expressions with RegExp

Construct inline regular expressions for quick validation:

```html
<template>
  <input value.bind="email" placeholder="Enter email" />
  <p if.bind="new RegExp('^\\S+@\\S+\\.\\S+$').test(email)">
    Valid Email Address
  </p>
</template>
```

### 5. Dynamic Property Access with Object

Use Object methods for reflection or retrieval:

```html
<template>
  <p>Property Value: ${Object.getOwnPropertyDescriptor(user, selectedProp)?.value}</p>
</template>
```

### 6. Set Operations with Set

De-duplicate arrays or combine sets inline:

```html
<template>
  <p>Unique Values: ${[...new Set(numbersArray)]}</p>
</template>
```

### 7. Encoding & Decoding URLs

Leverage encodeURI / decodeURI for safe link construction:

```html
<template>
  <a href.bind="encodeURI(externalLink)">Visit External Site</a>
  <p>Original URL: ${decodeURI(externalLink)}</p>
</template>
```

### 8. Number Formatting with Intl.NumberFormat

Localize numbers, currency, or dates easily:

```html
<template>
  <p>Price: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)}</p>
</template>
```

### 9. Complex Array Manipulations

Filter, map, and transform arrays:

```html
<template>
  <p>Active Items: ${Array.from(dataSet).filter(i => i.active).map(i => i.name).join(', ')}</p>
</template>
```

---

## Best Practices and Considerations

1. Use Sparingly
   - Keep business logic in your view models, not in templates. Inline calls to complex global functions (e.g., JSON.stringify on large data) can degrade performance and reduce readability.
2. Security
   - Even though Aurelia limits global access, treat any data you process via global functions (e.g., decodeURI) with caution to prevent potential XSS attacks or other vulnerabilities.
3. Performance
   - Template expressions run on each re-render. If you repeatedly perform expensive operations (like JSON.stringify on large objects), consider handling them in the view model and binding to a computed property instead.
4. Reactivity
   - Accessing global objects doesn’t magically become reactive. If you want to update the UI when data changes, store and manipulate it in the view model, ensuring Aurelia’s change detection can pick it up.
5. Clarity and Testing
   - Test heavy logic in a view model or service, not in templates. This approach keeps your code testable with unit tests and fosters a separation of concerns.

By sticking to these guidelines, you can leverage Aurelia’s built-in global access without sacrificing maintainability or performance.
