# CSS-in-JS with Emotion

## What is CSS-in-JS?

CSS-in-JS is a technique where JavaScript is used to style components. This approach encapsulates styles within components, making the code more declarative and maintainable.

## Why Emotion?

Emotion is a highly performant and flexible CSS-in-JS library that is framework-agnostic, making it ideal for use with Aurelia 2. It provides:
- String and object-based styling.
- Predictable composition to avoid specificity issues.
- A great developer experience with source maps and labels.
- Heavy caching for optimized performance.

## Integrating Emotion with Aurelia 2

To integrate Emotion with Aurelia 2, follow these steps.

### 1. Install Emotion

Install the framework-agnostic version of Emotion:

```bash
npm install @emotion/css
```

### 2. Create a Custom Attribute

Define a custom attribute to apply Emotion styles, ensuring it works for both Shadow DOM and non-Shadow DOM scenarios.

```typescript
// src/resources/attributes/emotion.ts
import { resolve } from 'aurelia';
import { css, cache } from '@emotion/css';

export class EmotionCustomAttribute {
  private element: Element = resolve(Element);

  attached() {
    if (this.isInShadow(this.element)) {
      cache.sheet.container = (this.element.getRootNode() as ShadowRoot).querySelector('style') || this.element.getRootNode();
    } else {
      cache.sheet.container = document.head;
    }

    this.element.classList.add(css(this.value));
  }

  private isInShadow(element: Element): boolean {
    return element.getRootNode() instanceof ShadowRoot;
  }
}
```

### Explanation of Key Concepts

- **Shadow DOM Handling:**
  If the element is inside a Shadow DOM, Emotion will inject styles into the shadow root rather than the document head.
  This ensures styles are properly scoped.

- **`cache.sheet.container`:**
  Emotion uses this setting to define where styles are injected.
  - For Shadow DOM, styles are injected into the shadow root.
  - For regular DOM, styles are injected into `<head>`.

- **Why `attached()`?**
  The `attached()` lifecycle hook ensures that the element is in the DOM before determining its shadow state.

### 3. Register the Custom Attribute

Register the custom attribute in your Aurelia application:

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { EmotionCustomAttribute } from './resources/attributes/emotion';
import { MyApp } from './my-app';

Aurelia
  .register(EmotionCustomAttribute)
  .app(MyApp)
  .start();
```

### 4. Apply Styles in Components

Use the `emotion` custom attribute in your components:

```typescript
// src/my-app.ts
export class MyApp {
  public message = 'Hello World!';
  public cssObject = {
    backgroundColor: 'hotpink',
    '&:hover': {
      color: 'white'
    }
  };
}
```

```html
<!-- src/my-app.html -->
<template>
  <div emotion.bind="cssObject">${message}</div>
</template>
```

## Considerations

- **Shadow DOM Support:**
  If you're using Shadow DOM in Aurelia, Emotion will automatically inject styles into the correct shadow root.

- **Performance Implications:**
  CSS-in-JS solutions like Emotion introduce runtime overhead. If performance is a concern, consider Emotion’s static extraction capabilities.

By following this guide, you ensure that Emotion integrates seamlessly with Aurelia 2 while supporting both Shadow DOM and standard DOM rendering.
