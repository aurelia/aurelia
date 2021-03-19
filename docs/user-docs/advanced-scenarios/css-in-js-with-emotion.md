### What is CSS-in-JS? 

CSS-in-JS is a styling technique where JavaScript is used to style components. When this JavaScript is parsed, CSS is generated (usually as an `<style>` element) and attached to the DOM. It allows you to abstract CSS to the component level itself, using JavaScript to describe styles in a declarative and maintainable way.
In the ecosystem of some client-side libraries, such as React, this method is very common. So we decided to discuss how to use CSS-in-JS in Aurelia.

### Why EmotionJS?
There are multiple implementations of CSS-in-JS concept in the form of libraries but few of them are framework-agnostic so we chose [EmotionJS](https://github.com/emotion-js/emotion)
This is how they define EmotionJS:
> Emotion is a performant and flexible CSS-in-JS library. Building on many other CSS-in-JS libraries, it allows you to style apps quickly with string or object styles. It has a predictable composition to avoid specificity issues with CSS. With source maps and labels, Emotion has a great developer experience and great performance with heavy caching in production.

### EmotionJS & Aurelia 2 integration
To integrate EmotionJS and Aurelia, Follow the steps below:
Add EmotionJS framework-agnostic version to your project with the following command

``` bash
npm i emotion --save
```

Define a custom attribute and name it Emotion just like the following code

``` typescript
import { inject } from "aurelia";
import { css, cache } from 'emotion'
@inject(Element)
export class EmotionCustomAttribute {
    constructor(private element: Element) {
    }
    attached() {
        if (this.isInShadow(this.element))
            cache.sheet.container = this.element.getRootNode() as HTMLElement;
        else
            cache.sheet.container = document.head;
        this.element.classList.add(css(this.value));
    }
    private isInShadow(element: Element): boolean {
        return element.getRootNode() instanceof ShadowRoot;
    }
}
```

Surely there are questions about the above code let me answer them one by one.

**What is isInShadow?**
This method helps us to find out if our HTMLElement is inside of a shadow-root or not.

**Why does shadow-root matter?**
Because Aurelia 2 supports ShadowDOM and we need to style those HTMLElements that are inside a shadow via the emotion library.

**What is cache.sheet.container?**
The emotion library uses container configuration to inject styles into specific DOM. To support shadow-root we should inject our styles into the shadow block but for global styles `document.head` is good.

**Why did we choose attached?**
Detecting ShadowDOM mode for an HTMLElement is possible via this life-cycle method.

Now, Register the new Emotion custom attribute in your main.ts file.

``` typescript
import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { EmotionCustomAttribute } from './emotion-attr';
Aurelia
  .register(EmotionCustomAttribute)
  .app(MyApp)
  .start();
```

Add an object in your view-model and call it cssObject.

``` typescript
export class MyApp {
  public message = 'Hello World!';
  private color = 'white'
  public cssObject = {
    backgroundColor: 'hotpink !important',
    '&:hover': {
      color: this.color
    }
  };
}
```

Go to your view and add emotion custom attribute to an HTML tag.

``` html
<div class="message" emotion.bind="cssObject">${message}</div>
```